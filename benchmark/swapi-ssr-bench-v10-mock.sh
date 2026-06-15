#!/usr/bin/env bash
set -euo pipefail

CURRENT_WD="/home/cartok/work/own/swapi-platform"
PORT=51000
BASE_URL="http://127.0.0.1:${PORT}"
ROUTES=(
  "/movies"
  "/movie/1"
)

RESULT_DIR="/tmp/swapi-ssr-bench-v10-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$RESULT_DIR/raw" "$RESULT_DIR/backups"
RESULT_CSV="$RESULT_DIR/results.csv"

echo "scenario,hardware,profile,worker_count,max_queued_jobs,queue_timeout_ms,render_abort_timeout_ms,timeout_global_ms,route,load_level,requests,concurrency,max_time_s,duration_s,rps,success_2xx,success_rate_pct,code_302,code_499,code_500,code_503,code_000,http_other,curl_errors,p50_s,p95_s,p99_s" > "$RESULT_CSV"

TASK_PID=""

TASKFILE="$CURRENT_WD/Taskfile.yml"
SERVER_FILE="$CURRENT_WD/packages/server/src/server.ts"
SSR_HANDLER_FILE="$CURRENT_WD/packages/server/src/ssr/ssr.handler.ts"
ABORT_HANDLER_FILE="$CURRENT_WD/packages/server/src/request/request-abort.handler.ts"

TASKFILE_BAK="$RESULT_DIR/backups/Taskfile.yml.bak"
SERVER_BAK="$RESULT_DIR/backups/server.ts.bak"
SSR_HANDLER_BAK="$RESULT_DIR/backups/ssr.handler.ts.bak"
ABORT_HANDLER_BAK="$RESULT_DIR/backups/request-abort.handler.ts.bak"

cp "$TASKFILE" "$TASKFILE_BAK"
cp "$SERVER_FILE" "$SERVER_BAK"
cp "$SSR_HANDLER_FILE" "$SSR_HANDLER_BAK"
cp "$ABORT_HANDLER_FILE" "$ABORT_HANDLER_BAK"

stop_server() {
  docker rm -f swapi-platform-app-server >/dev/null 2>&1 || true

  if [[ -n "$TASK_PID" ]]; then
    kill "$TASK_PID" >/dev/null 2>&1 || true
    wait "$TASK_PID" >/dev/null 2>&1 || true
    TASK_PID=""
  fi
}

restore_files() {
  cp "$TASKFILE_BAK" "$TASKFILE"
  cp "$SERVER_BAK" "$SERVER_FILE"
  cp "$SSR_HANDLER_BAK" "$SSR_HANDLER_FILE"
  cp "$ABORT_HANDLER_BAK" "$ABORT_HANDLER_FILE"
}

cleanup() {
  stop_server
  restore_files
}

wait_for_server() {
  local log_file="$1"
  local timeout_s="${2:-1800}"
  local start_ts
  start_ts=$(date +%s)

  while true; do
    if rg -q "Server running at:" "$log_file"; then
      return 0
    fi

    if rg -q "Startup failed|Failed to run task|EADDRINUSE|Error during" "$log_file"; then
      echo "[error] startup failed, see $log_file" >&2
      tail -n 120 "$log_file" >&2 || true
      return 1
    fi

    local now
    now=$(date +%s)
    if (( now - start_ts > timeout_s )); then
      echo "[error] startup timeout after ${timeout_s}s, see $log_file" >&2
      tail -n 120 "$log_file" >&2 || true
      return 1
    fi

    sleep 1
  done
}

start_server() {
  local scenario="$1"
  local log_file="$RESULT_DIR/${scenario}.log"

  stop_server
  : > "$log_file"

  (
    cd "$CURRENT_WD"
    go-task server:docker:start T_BUILD_LEVEL=release T_TARGET_ENVIRONMENT=local T_THROTTLED=true
  ) >"$log_file" 2>&1 &
  TASK_PID=$!

  wait_for_server "$log_file"
}

warmup_routes() {
  local scenario="$1"
  for route in "${ROUTES[@]}"; do
    local url="${BASE_URL}${route}"
    for _ in 1 2; do
      curl -s -L --max-time 15 -H 'Accept: text/html' "$url" >/dev/null || true
    done
  done
  echo "[$scenario] warmup done"
}

percentile_value() {
  local file="$1"
  local p="$2"
  local count
  count=$(wc -l < "$file")
  if [[ "$count" -eq 0 ]]; then
    echo "NA"
    return
  fi

  local idx
  idx=$(awk -v c="$count" -v p="$p" 'BEGIN { x=int((p*c)+0.999999); if (x<1) x=1; if (x>c) x=c; print x }')
  awk -v target="$idx" 'NR==target {print $1; exit}' "$file"
}

run_curl_case() {
  local scenario="$1"
  local hardware="$2"
  local profile="$3"
  local worker_count="$4"
  local max_queued_jobs="$5"
  local queue_timeout_ms="$6"
  local render_abort_timeout_ms="$7"
  local timeout_global_ms="$8"
  local route="$9"
  local level="${10}"
  local requests="${11}"
  local concurrency="${12}"
  local max_time_s="${13}"

  local url="${BASE_URL}${route}"
  local safe_route
  safe_route=$(printf '%s' "$route" | sed 's#[^a-zA-Z0-9._-]#_#g')
  local raw_file="$RESULT_DIR/raw/${scenario}_${level}_${safe_route}.txt"
  local sorted_times_file="$RESULT_DIR/raw/${scenario}_${level}_${safe_route}_times_sorted.txt"

  local start_ms end_ms duration_s
  start_ms=$(date +%s%3N)

  seq "$requests" | xargs -I{} -P "$concurrency" sh -c '
    url="$1"
    max_time="$2"

    out=$(curl -sS -L --max-time "$max_time" -o /dev/null -w "%{http_code} %{time_total}" -H "Accept: text/html" "$url" 2>/dev/null)
    ec=$?

    code=$(printf "%s" "$out" | awk "{print \$1}")
    time_total=$(printf "%s" "$out" | awk "{print \$2}")

    if [ -z "$code" ]; then
      code="000"
    fi

    if [ -z "$time_total" ]; then
      time_total="${max_time}.000"
    fi

    if [ "$ec" -ne 0 ]; then
      if [ "$code" = "000" ] && [ "$time_total" = "0.000000" ]; then
        time_total="${max_time}.000"
      fi
      printf "%s %s %s\n" "$code" "$time_total" "$ec"
    else
      printf "%s %s 0\n" "$code" "$time_total"
    fi
  ' _ "$url" "$max_time_s" > "$raw_file"

  end_ms=$(date +%s%3N)
  duration_s=$(awk -v s="$start_ms" -v e="$end_ms" 'BEGIN { printf "%.3f", (e-s)/1000 }')

  local total_count success_2xx success_rate rps
  total_count=$(wc -l < "$raw_file")
  success_2xx=$(awk '$1 ~ /^2/ {count++} END {print count+0}' "$raw_file")
  success_rate=$(awk -v ok="$success_2xx" -v total="$total_count" 'BEGIN { if (total==0) print "0.00"; else printf "%.2f", (ok/total)*100 }')
  rps=$(awk -v total="$total_count" -v dur="$duration_s" 'BEGIN { if (dur==0) print "0.00"; else printf "%.2f", total/dur }')

  local code_302 code_499 code_500 code_503 code_000 http_other curl_errors
  code_302=$(awk '$1 == 302 {count++} END {print count+0}' "$raw_file")
  code_499=$(awk '$1 == 499 {count++} END {print count+0}' "$raw_file")
  code_500=$(awk '$1 == 500 {count++} END {print count+0}' "$raw_file")
  code_503=$(awk '$1 == 503 {count++} END {print count+0}' "$raw_file")
  code_000=$(awk '$1 == 000 {count++} END {print count+0}' "$raw_file")
  curl_errors=$(awk '$3 != 0 {count++} END {print count+0}' "$raw_file")
  http_other=$(awk '$1 !~ /^2/ && $1 != 302 && $1 != 499 && $1 != 500 && $1 != 503 && $1 != 000 {count++} END {print count+0}' "$raw_file")

  awk '{print $2}' "$raw_file" | sort -n > "$sorted_times_file"
  local p50 p95 p99
  p50=$(percentile_value "$sorted_times_file" 0.50)
  p95=$(percentile_value "$sorted_times_file" 0.95)
  p99=$(percentile_value "$sorted_times_file" 0.99)

  echo "${scenario},${hardware},${profile},${worker_count},${max_queued_jobs},${queue_timeout_ms},${render_abort_timeout_ms},${timeout_global_ms},${route},${level},${requests},${concurrency},${max_time_s},${duration_s},${rps},${success_2xx},${success_rate},${code_302},${code_499},${code_500},${code_503},${code_000},${http_other},${curl_errors},${p50},${p95},${p99}" >> "$RESULT_CSV"

  echo "[$scenario][$level] $route -> rps=$rps 2xx=${success_2xx}/${total_count} (${success_rate}%) 503=${code_503} 500=${code_500} 000=${code_000} curl_err=${curl_errors} p95=${p95}s"
}

apply_hardware_profile() {
  local cpus="$1"
  local mem_mb="$2"

  cp "$TASKFILE_BAK" "$TASKFILE"
  perl -0pi -e "s/--cpus=[0-9.]+/--cpus=${cpus}/g" "$TASKFILE"
  perl -0pi -e "s/--memory=[0-9]+m/--memory=${mem_mb}m/g" "$TASKFILE"
  perl -0pi -e "s/--memory-swap=[0-9]+m/--memory-swap=${mem_mb}m/g" "$TASKFILE"

  rg -n -- "--cpus=|--memory=|--memory-swap=" "$TASKFILE" | sed -n '1,8p'
}

apply_network_latency_injection() {
  cp "$SSR_HANDLER_BAK" "$SSR_HANDLER_FILE"

  perl -0pi -e 's/\n\s*const result = await runtimeServices\.ssr\.renderPool\.render\(/\n      await benchmarkConstantNetworkDelay()\n\n      const result = await runtimeServices.ssr.renderPool.render(/' "$SSR_HANDLER_FILE"

  cat >> "$SSR_HANDLER_FILE" <<'TS'

async function benchmarkConstantNetworkDelay(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 65))
}
TS
}

set_pool_and_abort_config() {
  local worker_count="$1"
  local max_queued_jobs="$2"
  local queue_timeout_ms="$3"
  local render_abort_timeout_ms="$4"
  local timeout_global_ms="$5"

  cp "$SERVER_BAK" "$SERVER_FILE"
  cp "$ABORT_HANDLER_BAK" "$ABORT_HANDLER_FILE"

  perl -0pi -e "s/workerCount: [^,]+,/workerCount: ${worker_count},/" "$SERVER_FILE"
  perl -0pi -e "s/maxQueuedJobs: [^,]+,/maxQueuedJobs: ${max_queued_jobs},/" "$SERVER_FILE"
  perl -0pi -e "s/queueTimeoutMs: [^,]+,/queueTimeoutMs: ${queue_timeout_ms},/" "$SERVER_FILE"
  perl -0pi -e "s/renderAbortTimeoutMs: [^,]+,/renderAbortTimeoutMs: ${render_abort_timeout_ms},/" "$SERVER_FILE"

  perl -0pi -e "s/const TIMEOUT_GLOBAL = [0-9_]+/const TIMEOUT_GLOBAL = ${timeout_global_ms}/" "$ABORT_HANDLER_FILE"

  rg -n "workerCount:|maxQueuedJobs:|queueTimeoutMs:|renderAbortTimeoutMs:" "$SERVER_FILE" | sed -n '1,8p'
  rg -n "TIMEOUT_GLOBAL" "$ABORT_HANDLER_FILE"
}

run_scenario() {
  local scenario="$1"
  local hardware="$2"
  local profile="$3"
  local worker_count="$4"
  local max_queued_jobs="$5"
  local queue_timeout_ms="$6"
  local render_abort_timeout_ms="$7"
  local timeout_global_ms="$8"

  start_server "$scenario"
  warmup_routes "$scenario"

  for route in "${ROUTES[@]}"; do
    run_curl_case "$scenario" "$hardware" "$profile" "$worker_count" "$max_queued_jobs" "$queue_timeout_ms" "$render_abort_timeout_ms" "$timeout_global_ms" "$route" "load_80" 80 8 15
  done

  for route in "${ROUTES[@]}"; do
    run_curl_case "$scenario" "$hardware" "$profile" "$worker_count" "$max_queued_jobs" "$queue_timeout_ms" "$render_abort_timeout_ms" "$timeout_global_ms" "$route" "load_200" 200 20 15
  done

  stop_server
}

main() {
  trap cleanup EXIT

  apply_network_latency_injection

  # 1 CPU / 256MB (wc=1)
  apply_hardware_profile 1.0 256
  set_pool_and_abort_config 1 24 900 2500 3000
  run_scenario "h1c256_pA" "1cpu_256mb" "A" 1 24 900 2500 3000

  apply_hardware_profile 1.0 256
  set_pool_and_abort_config 1 32 1200 3000 4200
  run_scenario "h1c256_pB" "1cpu_256mb" "B" 1 32 1200 3000 4200

  apply_hardware_profile 1.0 256
  set_pool_and_abort_config 1 40 1400 3200 5000
  run_scenario "h1c256_pC" "1cpu_256mb" "C" 1 40 1400 3200 5000

  # 1 CPU / 512MB (wc=2)
  apply_hardware_profile 1.0 512
  set_pool_and_abort_config 2 24 900 2500 3000
  run_scenario "h1c512_pA" "1cpu_512mb" "A" 2 24 900 2500 3000

  apply_hardware_profile 1.0 512
  set_pool_and_abort_config 2 32 1200 3000 4200
  run_scenario "h1c512_pB" "1cpu_512mb" "B" 2 32 1200 3000 4200

  apply_hardware_profile 1.0 512
  set_pool_and_abort_config 2 40 1400 3200 5000
  run_scenario "h1c512_pC" "1cpu_512mb" "C" 2 40 1400 3200 5000

  # 2 CPU / 512MB (wc=2)
  apply_hardware_profile 2.0 512
  set_pool_and_abort_config 2 24 900 2500 3000
  run_scenario "h2c512_pA" "2cpu_512mb" "A" 2 24 900 2500 3000

  apply_hardware_profile 2.0 512
  set_pool_and_abort_config 2 32 1200 3000 4200
  run_scenario "h2c512_pB" "2cpu_512mb" "B" 2 32 1200 3000 4200

  apply_hardware_profile 2.0 512
  set_pool_and_abort_config 2 40 1400 3200 5000
  run_scenario "h2c512_pC" "2cpu_512mb" "C" 2 40 1400 3200 5000

  echo
  echo "RESULT_DIR=$RESULT_DIR"
  echo "RESULT_CSV=$RESULT_CSV"
}

main "$@"
