# Taskfile Roadmap

- [x] Check if vscode taskfile extension resolves the installed taskfile dependency

---

- [x] Big refactoring
- [x] Document some things
- [x] Remove some anti-patterns
- [x] Better use of `interactive: true`
- [x] Prefix variables with `T_`
- [ ] T_BUILD_LEVEL and T_TARGET_ENVIRONMENT often have too many enum options
- [ ] Not all Taskfiles follow the documented order and maybe other best practices fully
- [ ] Reduce repetitions

---

## Report / Participate on Issues

- [ ] The `if`-conditional in `deps` not working despite being in the JSON schema
- [ ] File-global variables are not scoped to the file, like variables from imported Taskfiles override variables defined in the importing Taskfile. It should only flow in the opposite direction.
- [ ] Variables that have no value set are tried to be filled by environment variables, which for example will cause issues if you name a variable `PATH`. There should be a configurable allow list.
- [ ] Allow tasks to only output raw text (maybe additionally an option for Go data types) so that they can be used better as input for `vars` and tasks ran by `deps` or `cmds`. Tasks should be callable functional. Right now they are focused on execution. Running sub-tasks via shell has several issues besides the output not being raw you'd have to do serialization and deserialization of task variables in order to create good results but thats bad complexity. Tasks should also be usable as input for `vars`, as checks for `if`, `status`, `preconditions`, `enum`, maybe more. Add examples like the git functions I threw away, and/or similar.
- [ ] Enums should be definable by templates
- [ ] There should be a boolean variable type to not run into `enum: ["true", "false"]` + check like `{{if ne .VARIABLE "true"}}`
- [ ] Ask if it would be possible to have lazy template evaluation, cause right now its all static, which limits usage of advanced features like ternaries and many other. Also if evaluation could run lazy you could predefine templates that are used often in a file without running into issues - for example in the worker taskfile I use this very often:
  ```yml
  task:
    vars:
      T_ENV:
        sh: yq '.env["{{.T_TARGET_ENVIRONMENT}}"].vars' ./wrangler.jsonc
      T_ENV_MAP:
        ref: .T_ENV | fromJson
  ```
  Another example why this situation is a problem:
  ```yaml
  vars:
    T_GIT_COMMIT_SHA:
      sh: |
        if command -v git >/dev/null 2>&1; then
          printf "%s" "$(git rev-parse --verify HEAD)"
        fi
  ```
  It generally would be good to have an extra `template` property for reuse terms.
- [ ] Syntax highlighting: Any simple, one color highlighting for the templates would already help very much.
- [ ] Auto completion for task tokens like variables, task names
- [ ] Issue with root task selector (`task: :some:task:available:from:root`): its not usable in taskfiles that are transient / imported into a taskfile that is imported into the root task file.
- [ ] Feature: New property for label and/or cache key, or property/properties for variables in that regard
- [ ] Maybe there is or could be a better solution for coalescing of env vars into variables like I did.
- [ ] Feature: Globally and locally definable switch for `sources` property to make it include only tracked und untracked git files but no ignores.
- [ ] Feature: Git utils like `hasChanges/hasNoChanges`, `files/changedFiles/stagedFiles` + filtering by extension list
