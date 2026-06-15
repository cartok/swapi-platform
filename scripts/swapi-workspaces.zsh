#!/usr/bin/env zsh
emulate -LR zsh
set -euo pipefail

tmp_dir=$(mktemp -d)
cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT INT TERM HUP

depcruise_json="$tmp_dir/depcruise-src.json"

typeset -A package_name_to_root
typeset -A package_name_to_src_root
typeset -A package_name_to_usage_file

typeset -a workspace_roots
typeset -a package_names
typeset -a all_workspace_src_roots
typeset -a consumer_packages
typeset -a selected_include_packages
typeset -a selected_exclude_packages

selected_target_package=""
selected_include_mode=""
selected_output_mode=""

main() {
  ensure_gum_available
  collect_workspace_roots
  collect_workspace_packages
  run_wizard
  run_dependency_cruiser
  build_usage_files

  local include_result_file
  include_result_file=$(build_include_result_file)

  local final_result_file
  final_result_file=$(build_final_result_file "$include_result_file")

  print_configuration_summary
  print_paths_from_file "$final_result_file"

  if [[ "$selected_output_mode" == "details" ]]; then
    print_details_for_paths_file "$final_result_file"
  fi
}

ensure_gum_available() {
  if [[ "${DEPS_GUM_MOCK:-0}" == "1" ]]; then
    return
  fi

  if [[ ! -t 0 || ! -t 1 ]]; then
    echo "This script is interactive and requires a TTY." >&2
    return 1
  fi

  if ! bunx --no-install gum --version >/dev/null 2>&1; then
    echo "gum is required but not available via bunx --no-install gum." >&2
    return 1
  fi
}

collect_workspace_roots() {
  workspace_roots=(
    ${(f)"$(
      jq -r '
        if (.workspaces | type) == "array" then .workspaces[]
        elif (.workspaces | type) == "object" and ((.workspaces.packages | type) == "array") then .workspaces.packages[]
        else empty
        end
      ' package.json \
        | while read -r workspace_glob; do
            [[ -z "$workspace_glob" ]] && continue
            for workspace_dir in ${~workspace_glob}(N/); do
              print -r -- "${workspace_dir%/}"
            done
          done \
        | sort -u
    )"}
  )

  if [[ ${#workspace_roots[@]} -eq 0 ]]; then
    echo "Found no workspace definition in package.json." >&2
    return 1
  fi
}

collect_workspace_packages() {
  local workspace_root=""
  local package_json=""
  local src_dir=""
  local package_name=""

  package_names=()
  all_workspace_src_roots=()

  for workspace_root in "${workspace_roots[@]}"; do
    package_json="$workspace_root/package.json"
    src_dir="$workspace_root/src"

    [[ -f "$package_json" ]] || continue
    [[ -d "$src_dir" ]] || continue

    package_name="$(jq -r '.name // empty' "$package_json")"
    [[ -z "$package_name" ]] && continue

    package_names+=("$package_name")
    package_name_to_root[$package_name]="$workspace_root"
    package_name_to_src_root[$package_name]="$src_dir"
    all_workspace_src_roots+=("$src_dir")
  done

  package_names=(${(ou)package_names})
  all_workspace_src_roots=(${(u)all_workspace_src_roots})

  if [[ ${#package_names[@]} -lt 2 ]]; then
    echo "Need at least two workspace packages with package.json and src/." >&2
    return 1
  fi
}

run_wizard() {
  local default_target="${package_names[1]}"
  if array_contains "@swapi/shared" "${package_names[@]}"; then
    default_target="@swapi/shared"
  fi

  selected_target_package="$(gum_choose_single \
    "Choose package to analyze usage of:" \
    "$default_target" \
    "${package_names[@]}")"

  build_consumer_packages

  local -a include_defaults=()
  if array_contains "@swapi/server" "${consumer_packages[@]}"; then
    include_defaults+=("@swapi/server")
  fi
  if array_contains "@swapi/worker" "${consumer_packages[@]}"; then
    include_defaults+=("@swapi/worker")
  fi

  local include_defaults_csv=""
  include_defaults_csv=$(join_by_comma "${include_defaults[@]}")

  while true; do
    local include_selection=""
    local include_package=""
    include_selection="$(gum_choose_multi \
      "Choose packages where to check dependants:" \
      "$include_defaults_csv" \
      "${consumer_packages[@]}")"

    selected_include_packages=()
    while IFS= read -r include_package; do
      [[ -z "$include_package" ]] && continue
      if ! array_contains "$include_package" "${consumer_packages[@]}"; then
        continue
      fi
      if ! array_contains "$include_package" "${selected_include_packages[@]}"; then
        selected_include_packages+=("$include_package")
      fi
    done <<< "$include_selection"

    if [[ ${#selected_include_packages[@]} -gt 0 ]]; then
      break
    fi

    if [[ "${DEPS_GUM_MOCK:-0}" == "1" ]]; then
      echo "Mock include selection produced no valid packages." >&2
      return 1
    fi

    echo "Select at least one include package." >&2
  done

  selected_include_mode="$(gum_choose_single \
    "How should include packages be combined?" \
    "ANY" \
    "ALL" \
    "ANY")"

  local -a exclude_defaults=()
  if array_contains "@swapi/client" "${consumer_packages[@]}"; then
    exclude_defaults+=("@swapi/client")
  fi

  local exclude_defaults_csv=""
  exclude_defaults_csv=$(join_by_comma "${exclude_defaults[@]}")

  local exclude_selection=""
  local exclude_package=""
  exclude_selection="$(gum_choose_multi \
    "Choose packages to exclude from the result (optional):" \
    "$exclude_defaults_csv" \
    "${consumer_packages[@]}")"

  selected_exclude_packages=()
  while IFS= read -r exclude_package; do
    [[ -z "$exclude_package" ]] && continue
    if ! array_contains "$exclude_package" "${consumer_packages[@]}"; then
      continue
    fi
    if ! array_contains "$exclude_package" "${selected_exclude_packages[@]}"; then
      selected_exclude_packages+=("$exclude_package")
    fi
  done <<< "$exclude_selection"

  local output_mode_label=""
  output_mode_label="$(gum_choose_single \
    "Choose output mode:" \
    "paths" \
    "paths" \
    "paths + details")"

  if [[ "$output_mode_label" == "paths + details" ]]; then
    selected_output_mode="details"
  else
    selected_output_mode="paths"
  fi
}

build_consumer_packages() {
  local package_name=""
  consumer_packages=()

  for package_name in "${package_names[@]}"; do
    [[ "$package_name" == "$selected_target_package" ]] && continue
    consumer_packages+=("$package_name")
  done

  if [[ ${#consumer_packages[@]} -eq 0 ]]; then
    echo "Found no consumer package options after target selection." >&2
    return 1
  fi
}

gum_choose_single() {
  local header="$1"
  local default_value="$2"
  shift 2
  local -a options=("$@")

  if [[ "${DEPS_GUM_MOCK:-0}" == "1" ]]; then
    case "$header" in
      "Choose package to analyze usage of:")
        print -r -- "${DEPS_MOCK_TARGET:-@swapi/shared}"
      ;;
      "How should include packages be combined?")
        print -r -- "${DEPS_MOCK_INCLUDE_MODE:-ALL}"
      ;;
      "Choose output mode:")
        print -r -- "${DEPS_MOCK_OUTPUT_MODE:-paths}"
      ;;
      *)
        print -r -- "$default_value"
      ;;
    esac
    return
  fi

  if [[ -n "$default_value" ]]; then
    bunx --no-install gum choose --header "$header" --selected "$default_value" "${options[@]}"
  else
    bunx --no-install gum choose --header "$header" "${options[@]}"
  fi
}

gum_choose_multi() {
  local header="$1"
  local selected_csv="$2"
  shift 2
  local -a options=("$@")

  if [[ "${DEPS_GUM_MOCK:-0}" == "1" ]]; then
    case "$header" in
      "Choose packages where to check dependants:")
        print -r -- "${DEPS_MOCK_INCLUDE_PACKAGES:-@swapi/server
@swapi/worker}"
      ;;
      "Choose packages to exclude from the result (optional):")
        print -r -- "${DEPS_MOCK_EXCLUDE_PACKAGES:-@swapi/client}"
      ;;
      *)
        print -r -- ""
      ;;
    esac
    return
  fi

  if [[ -n "$selected_csv" ]]; then
    bunx --no-install gum choose --no-limit --ordered --header "$header" --selected "$selected_csv" "${options[@]}"
  else
    bunx --no-install gum choose --no-limit --ordered --header "$header" "${options[@]}"
  fi
}

run_dependency_cruiser() {
  local -a files=()

  files=(${(f)"$(rg --files "${all_workspace_src_roots[@]}" --glob '*.ts' --glob '*.tsx' --glob '*.mts' --glob '*.cts')"})

  if [[ ${#files[@]} -eq 0 ]]; then
    echo "Found no source files for dependency analysis." >&2
    return 1
  fi

  bunx --no-install dependency-cruiser --output-type json -- "${files[@]}" > "$depcruise_json"
}

build_usage_files() {
  local target_prefix="${package_name_to_root[$selected_target_package]}/"
  local package_name=""

  for package_name in "${consumer_packages[@]}"; do
    local source_prefix="${package_name_to_src_root[$package_name]}/"
    local usage_file="$tmp_dir/usage-${#package_name_to_usage_file[@]}-paths.txt"

    jq -r --arg source_prefix "$source_prefix" --arg target_prefix "$target_prefix" '
      .modules[]
      | select(.source|startswith($source_prefix))
      | .dependencies[]?
      | select((.resolved|type) == "string")
      | select(.resolved|startswith($target_prefix))
      | .resolved
    ' \
      "$depcruise_json" | sort -u > "$usage_file"

    package_name_to_usage_file[$package_name]="$usage_file"
  done
}

build_include_result_file() {
  local output_file="$tmp_dir/include-result.txt"
  local -a include_files=()
  local package_name=""

  for package_name in "${selected_include_packages[@]}"; do
    include_files+=("${package_name_to_usage_file[$package_name]}")
  done

  if [[ "$selected_include_mode" == "ALL" ]]; then
    cp "${include_files[1]}" "$output_file"

    local intermediate_file="$tmp_dir/include-intermediate.txt"
    local i=0
    for ((i = 2; i <= ${#include_files[@]}; i++)); do
      comm -12 --check-order "$output_file" "${include_files[$i]}" > "$intermediate_file"
      mv "$intermediate_file" "$output_file"
    done
  else
    cat "${include_files[@]}" | sort -u > "$output_file"
  fi

  print -r -- "$output_file"
}

build_final_result_file() {
  local include_result_file="$1"
  local output_file="$tmp_dir/final-result.txt"

  cp "$include_result_file" "$output_file"

  if [[ ${#selected_exclude_packages[@]} -eq 0 ]]; then
    print -r -- "$output_file"
    return
  fi

  local -a exclude_files=()
  local package_name=""
  for package_name in "${selected_exclude_packages[@]}"; do
    exclude_files+=("${package_name_to_usage_file[$package_name]}")
  done

  local exclude_union_file="$tmp_dir/exclude-union.txt"
  cat "${exclude_files[@]}" | sort -u > "$exclude_union_file"

  local filtered_file="$tmp_dir/final-filtered.txt"
  comm -23 --check-order "$output_file" "$exclude_union_file" > "$filtered_file"
  mv "$filtered_file" "$output_file"

  print -r -- "$output_file"
}

print_configuration_summary() {
  echo ""
  echo "Target package: $selected_target_package"
  echo "Include packages ($selected_include_mode): $(format_list_or_none "${selected_include_packages[@]}")"
  echo "Exclude packages: $(format_list_or_none "${selected_exclude_packages[@]}")"
  echo "Output mode: $selected_output_mode"
  echo ""
  echo "Resulting file paths:"
}

print_paths_from_file() {
  local paths_file="$1"

  while read -r resolved_path; do
    [[ -z "$resolved_path" ]] && continue
    echo "./$resolved_path"
  done < "$paths_file"
}

print_details_for_paths_file() {
  local paths_file="$1"
  local -a importer_prefixes=()
  local package_name=""

  for package_name in "${selected_include_packages[@]}"; do
    importer_prefixes+=("${package_name_to_src_root[$package_name]}/")
  done
  importer_prefixes=(${(u)importer_prefixes})

  local importer_prefixes_json="[]"
  importer_prefixes_json="$(printf '%s\n' "${importer_prefixes[@]}" | jq -R . | jq -s .)"

  while read -r resolved_path; do
    [[ -z "$resolved_path" ]] && continue
    echo ""
    echo "## ./$resolved_path"

    jq -r --arg resolved_path "$resolved_path" --argjson importer_prefixes "$importer_prefixes_json" '
      .modules[]
      | . as $module
      | select(any($importer_prefixes[]; $module.source | startswith(.)))
      | select(any($module.dependencies[]?; (.resolved|type) == "string" and .resolved == $resolved_path))
      | $module.source
    ' \
      "$depcruise_json" | sort -u
  done < "$paths_file"
}

join_by_comma() {
  local IFS=,
  print -r -- "$*"
}

format_list_or_none() {
  if [[ $# -eq 0 ]]; then
    print -r -- "(none)"
    return
  fi

  local IFS=", "
  print -r -- "$*"
}

array_contains() {
  local needle="$1"
  shift

  local item=""
  for item in "$@"; do
    if [[ "$item" == "$needle" ]]; then
      return 0
    fi
  done

  return 1
}

main "$@"
