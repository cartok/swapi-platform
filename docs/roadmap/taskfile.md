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
- [ ] Tasks should be definable as functional (right now they are focused on execution) tasks that intend to return some result. There could be a `functional: boolean` property which sets/overrides `interactive: true` and `silent: true` or has a similar, more distinct effect. Additionaly they should be usable as input for `vars`, which would also allow setting `vars` on sub-task calls in `deps` or `cmds`. Running sub-tasks via shell as workaround has the issue that you'd have to do serialization and deserialization of task variables in order to create good results but thats bad complexity. To get out most of it tasks should also be usable in checks like `if`, `status`, `preconditions` and `enum`. Maybe tasks could even become pipeable.
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
