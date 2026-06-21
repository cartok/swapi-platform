# Taskfile Issues

These notes collect Taskfile behavior that should be turned into upstream
GitHub issues later. Local reproductions were run with Task `3.51.1`.

## Confirmed Issue Candidates

### Empty Template Values In `sources` Or `generates` Can Expand To Root Globs And Hang

When `run: when_changed` is enabled, template strings in `sources` or
`generates` can render to unexpectedly broad glob patterns if a referenced
variable is unset. For example, `{{.FOO}}/**/*` renders as `/**/*` when `FOO`
has no value. Task then appears to scan the filesystem and can hang without a
useful diagnostic.

This is especially easy to miss because normal Task template behavior is to
render missing values as an empty string.

**Reproducer:**

```yaml
version: 3

run: when_changed

tasks:
  # Times out / appears to hang.
  source-empty-generate-root-glob:
    sources:
      - ''
    generates:
      - '{{.FOO}}/**/*'
    cmds:
      - echo "hi"

  # Times out / appears to hang.
  source-root-glob:
    sources:
      - '{{.FOO}}/**/*'
    cmds:
      - echo "hi"

  # Runs. The broad generated glob alone does not trigger the hang.
  generate-root-glob:
    generates:
      - '{{.FOO}}/**/*'
    cmds:
      - echo "hi"
```

**Observed behavior:**

Running the first two tasks with a timeout exits with `124` and Task prints:

```text
task: Signal received: "terminated"
```

The third task runs normally:

```text
task: [generate-root-glob] echo "hi"
hi
```

**Additional observations:**

- `generates` with an unset template value does not hang by itself.
- As soon as `sources` exists and has at least one entry, an unset template
  value in either `sources` or `generates` can trigger the hang if it leaves a
  broad glob such as `/**/*`.
- The `sources` entry does not need to be meaningful; `''` or a literal string
  is enough to trigger the problematic `generates` case.
- In local reproduction, a plain `{{.FOO}}` entry rendered empty and did not
  hang; the hanging case was reproduced when the empty value was part of a path
  or glob expression.

**Expected behavior:**

Task should reject or warn about empty template values that turn into absolute
root globs during `sources`/`generates` fingerprinting, or document this
behavior clearly. It should not silently scan the filesystem in a way that makes
the task appear stuck.

**Possible issue title:** `Unset template variables in sources or generates can expand to root glob and hang when using run: when_changed`

### Nested `ref:` Values In `map:` Variables Are Not Resolved

Nested `ref:` entries inside a `map:` variable are treated as plain map data
instead of being resolved.

**Reproducer:**

```yaml
version: 3

vars:
  ROOT_A: root-a
  TOP_SIMPLE_REF:
    ref: .ROOT_A
  TEST:
    map:
      templateFromRoot: '{{.ROOT_A}}'
      refFromRoot:
        ref: .ROOT_A

tasks:
  default:
    cmds:
      - echo 'TOP_SIMPLE_REF={{.TOP_SIMPLE_REF}}'
      - echo 'templateFromRoot={{.TEST.templateFromRoot}}'
      - echo 'refFromRoot={{.TEST.refFromRoot}}'
```

**Actual output:**

```text
TOP_SIMPLE_REF=root-a
templateFromRoot=root-a
refFromRoot=map[ref:.ROOT_A]
```

**Expected behavior:**

Either nested `ref:` values should resolve consistently, or Task should reject
or document this syntax as unsupported.

**Possible issue title:** `Nested map variables treat ref as plain map data instead of resolving it`

### YAML Lists In Nested `map:` Variables Are Unreliable Intermediate Values

YAML lists stored inside nested `map:` variables can lose referenced values when
they are used as intermediate values. Piping such values through `compact` can
also panic with a nil pointer error.

**Reproducer shape:**

```yaml
vars:
  ROOT_A: root-a
  TEST:
    map:
      serviceName: app-server
      container:
        nameParts:
          - '{{.ROOT_A}}'
          - '{{.TEST.serviceName}}'
        name: '{{.TEST.container.nameParts | compact | join "-"}}'
```

**Observed behavior:**

- The nested list can render with missing values, for example `[root-a ]`.
- The `compact` call can fail with:

```text
error calling compact: runtime error: invalid memory address or nil pointer dereference
```

**Workarounds observed in local tests:**

- Direct template expressions using `list ... | join ...` avoid storing a YAML
  list as an intermediate nested map value.
- Top-level `ref: fromYaml ... | join ...` can work for list construction.

**Possible issue title:** `Nested map variable YAML lists lose referenced values and can panic with compact`

### Nested `map:` Template Scoping Is Not Predictable Enough

Template strings in nested `map:` variables can read root-level values, but
referencing values from the same map is not reliable enough for derived values.

**Confirmed observations:**

- Root-level values can be referenced from nested template strings.
- Referencing sibling or parent values from the same map can be order/context
  dependent and may render as an empty string.
- Computed nested sibling values can render correctly when printed directly, but
  can still be empty when reused by another nested template value.

**Example shape:**

```yaml
vars:
  ROOT_A: root-a
  TEST:
    map:
      serviceName: app-server
      image:
        baseName: '{{list .ROOT_A .TEST.serviceName | join "/"}}'
        reference: '{{list .TEST.image.baseName "local" | join ":"}}'
```

In local experiments, direct output of the computed value can look correct while
the second computed value that reuses it renders with the reused part missing.

**Possible issue title:** `Document or fix template scoping for nested map variables`

### Map Values Returned From Template Vars Cannot Be Reused As Maps

When a task variable is assigned with a template string that returns a map, the
value prints like a map but cannot be reused with field access. Direct field
access on the original expression works. Using `ref:` for the intermediate
value also works.

**Reproducer:**

```yaml
version: 3

tasks:
  map-direct-access:
    vars:
      TARGET: ssr
      TARGETS:
        map:
          browser:
            distDir: ./dist/browser
          ssr:
            distDir: ./dist/ssr
      TARGET_CONFIG: '{{get .TARGETS .TARGET}}'
      DIRECT_DIST_DIR: '{{(get .TARGETS .TARGET).distDir}}'
      INDIRECT_DIST_DIR: '{{.TARGET_CONFIG.distDir}}'
    cmds:
      - echo 'TARGET_CONFIG={{.TARGET_CONFIG}}'
      - echo 'DIRECT_DIST_DIR={{.DIRECT_DIST_DIR}}'
      - echo 'INDIRECT_DIST_DIR={{.INDIRECT_DIST_DIR}}'

  map-direct-access-ref:
    vars:
      TARGET: ssr
      TARGETS:
        map:
          browser:
            distDir: ./dist/browser
          ssr:
            distDir: ./dist/ssr
      TARGET_CONFIG:
        ref: get .TARGETS .TARGET
      INDIRECT_DIST_DIR: '{{.TARGET_CONFIG.distDir}}'
    cmds:
      - echo 'TARGET_CONFIG={{.TARGET_CONFIG}}'
      - echo 'INDIRECT_DIST_DIR={{.INDIRECT_DIST_DIR}}'
```

**Actual output:**

```text
template: :1:16: executing "" at <.TARGET_CONFIG.distDir>: can't evaluate field distDir in type interface {}
```

The `ref:` control case works:

```text
TARGET_CONFIG=map[distDir:./dist/ssr]
INDIRECT_DIST_DIR=./dist/ssr
```

**Expected behavior:**

Either template variables that evaluate to structured values should remain
structured, or Task should document clearly that `ref:` is required when an
intermediate variable must be reused as a map/list.

**Possible issue title:** `Template vars that return maps cannot be reused as maps without ref`

### Lists Returned From Template Vars Cannot Be Iterated As Lists

When a task variable is assigned with a template string that returns a list,
Task stores the rendered list representation as a string. Printing it can look
list-like, but `range` cannot iterate over it. Using `ref:` preserves the
structured list.

**Reproducer:**

```yaml
version: 3

tasks:
  list-concat-template:
    vars:
      BASE_ARGS:
        - vite
        - build
      TARGET: ssr
      TARGETS:
        map:
          ssr:
            args:
              - --ssr
              - ./src/main.server.ts
      ARGS: '{{concat .BASE_ARGS (get .TARGETS .TARGET).args}}'
    cmds:
      - echo 'ARGS={{.ARGS}}'
      - echo 'RANGE={{range .ARGS}}{{. | q}} {{end}}'

  list-concat-ref:
    vars:
      BASE_ARGS:
        - vite
        - build
      TARGET: ssr
      TARGETS:
        map:
          ssr:
            args:
              - --ssr
              - ./src/main.server.ts
      ARGS:
        ref: concat .BASE_ARGS (get .TARGETS .TARGET).args
    cmds:
      - echo 'ARGS={{.ARGS}}'
      - echo 'RANGE={{range .ARGS}}{{. | q}} {{end}}'
```

**Actual output:**

```text
template: :1:20: executing "" at <.ARGS>: range can't iterate over [vite build --ssr ./src/main.server.ts]
```

The `ref:` control case works:

```text
ARGS=[vite build --ssr ./src/main.server.ts]
RANGE=vite build --ssr ./src/main.server.ts
```

**Expected behavior:**

Task should preserve structured list values returned by template expressions, or
document clearly that template-string variables always become strings and
`ref:` is required for list reuse.

**Possible issue title:** `Template vars that return lists cannot be iterated as lists without ref`

### `requires` Validation Can Be Bypassed By Empty `ref` Values

When a required enum variable is assigned via `ref:` and the expression resolves
to an empty value, Task does not reject the missing/empty value. Invalid
non-empty values are rejected.

**Reproducer:**

```yaml
version: 3

tasks:
  coalesce-ref-empty:
    requires:
      vars:
        - name: PROFILE
          enum: [development, release]
    vars:
      PROFILE:
        ref: coalesce (env "BUILD_PROFILE") .PROFILE
    cmds:
      - echo 'PROFILE={{.PROFILE}}'
```

**Actual output without `BUILD_PROFILE`:**

```text
PROFILE=
```

**Expected behavior:**

The required enum should reject the empty result, or Task should clearly
document why `ref:`-computed empty values bypass required validation.

**Additional observation:**

With `BUILD_PROFILE=invalid`, Task correctly rejects the value as invalid.

**Possible issue title:** `Required enum validation allows empty values produced by ref`

### Task-Level `dotenv` Values Are Not Available To Task Templates

Variables loaded with task-level `dotenv:` are visible to shell commands, but not
to Task template expressions in the same task.

**Reproducer:**

```yaml
version: 3

tasks:
  dotenv-template-var:
    dotenv:
      - ./.env
    cmds:
      - echo 'template={{.DOTENV_VALUE}}'
      - echo "shell=$DOTENV_VALUE"
```

With `.env`:

```env
DOTENV_VALUE=from-dotenv
```

**Actual output:**

```text
template=
shell=from-dotenv
```

**Expected behavior:**

It would be useful if task-level `dotenv` values were available to Task
templates, or if the limitation were documented more prominently.

**Possible issue title:** `Task-level dotenv values are not available to task template variables`

### `requires` Is Evaluated Before `status`

Task validates required variables before checking `status`, so a task that would
otherwise be skipped as up-to-date can still fail because of missing required
variables.

**Reproducer:**

```yaml
version: 3

tasks:
  status-before-requires:
    requires:
      vars:
        - REQUIRED_FOR_SKIPPED_TASK
    status:
      - 'true'
    cmds:
      - echo 'should not run'
```

**Actual output:**

```text
Task "status-before-requires" cancelled because it is missing required variables: REQUIRED_FOR_SKIPPED_TASK
```

**Expected behavior:**

If `status` determines that the task is already up-to-date, Task could skip
required variable validation for values that are only needed by commands.

**Possible issue title:** `requires is evaluated before status for skipped tasks`

### `if` On Dependencies Is Ignored

The JSON schema allows `if` on dependency entries, but Task still runs the
dependency when the condition is false.

**Reproducer:**

```yaml
version: 3

tasks:
  default:
    deps:
      - task: should-not-run
        if: 'false'
    cmds:
      - echo default

  should-not-run:
    cmds:
      - echo should-not-run
```

**Actual output:**

```text
should-not-run
default
```

**Expected behavior:**

The dependency should be skipped when its `if` condition evaluates to false, or
the schema should reject/document the unsupported property.

**Possible issue title:** `if on dependency entries is ignored despite being allowed by the schema`

### Included Taskfile Variables Can Override Importing Taskfile Variables

File-global variables are not scoped to the file that defines them. Variables
from included Taskfiles can override variables defined in the importing
Taskfile.

**Reproducer:**

`Included.yml`:

```yaml
version: 3

vars:
  SHARED_NAME: included

tasks:
  print:
    cmds:
      - echo 'included={{.SHARED_NAME}}'
```

`Taskfile.yml`:

```yaml
version: 3

includes:
  included:
    taskfile: ./Included.yml

vars:
  SHARED_NAME: root

tasks:
  default:
    cmds:
      - echo 'root={{.SHARED_NAME}}'
      - task: included:print
```

**Actual output:**

```text
root=included
included=included
```

**Expected behavior:**

Variables should ideally flow from the importing Taskfile into included
Taskfiles, but included Taskfiles should not override file-global variables in
the importer unless explicitly configured.

**Possible issue title:** `Included Taskfile variables can override variables from the importing Taskfile`

### CLI Variables Do Not Override Root Variables When Running Included Tasks

CLI variables passed while running a task from an included Taskfile do not
behave like direct task-call variables. Root Taskfile global variables can still
take precedence.

**Reproducer:**

`Included.yml`:

```yaml
version: 3

tasks:
  print:
    cmds:
      - echo '{{.VALUE}}'
```

`Taskfile.yml`:

```yaml
version: 3

includes:
  included:
    taskfile: ./Included.yml

vars:
  VALUE: root

tasks:
  print:
    cmds:
      - echo 'root={{.VALUE}}'
```

**Actual output:**

CLI variables override root-global variables for tasks defined in the root
Taskfile:

```sh
$ task print VALUE=cli
task: [print] echo 'root=cli'
root=cli
```

The same CLI variable does not override the root-global variable when the task
comes from an included Taskfile:

```sh
$ task included:print VALUE=cli
task: [included:print] echo 'included=root'
included=root
```

**Control case:**

Calling the included Taskfile directly allows the CLI variable to override the
file-global variable:

```sh
$ task -t Included.yml print VALUE=cli
task: [print] echo 'included=cli'
included=cli
```

**Additional observation:**

A dynamic root variable can make the value configurable again when it explicitly
reads a same-named shell variable:

```yaml
version: 3

vars:
  VALUE:
    sh: |
      if [ -n "${VALUE:-}" ]; then
        printf "%s" "${VALUE}"
      fi

includes:
  included:
    taskfile: ./Included.yml
```

With this setup, both invocation styles can populate `{{.VALUE}}` in an
included task:

```sh
$ VALUE=env task included:print
task: [included:print] echo 'included=env'
included=env

$ task included:print VALUE=cli
task: [included:print] echo 'included=cli'
included=cli
```

The CLI variable is still not a normal shell environment variable for task
commands:

```yaml
tasks:
  print:
    cmds:
      - echo 'template={{.VALUE}}'
      - echo "shell=$VALUE"
```

```sh
$ task included:print VALUE=cli
template=cli
shell=
```

This suggests that Task exposes CLI variables to the environment used while
evaluating dynamic `sh:` variables, but does not export them to the shell
environment of normal task commands. This behavior is useful, but should be
documented explicitly if it is intentional.

**Expected behavior:**

`task included:print VALUE=cli` should ideally behave like a direct invocation
of the included task, so the CLI variable should be treated as task-call scope
and override file-global variables from the importing Taskfile.

If the current behavior is intentional, the documentation should explicitly
clarify that CLI variables passed while running included tasks are not
considered "variables given while calling a task from another" or otherwise
direct task-call variables in the variable precedence model.

**Possible issue title:** `CLI variables do not override root variables when running included tasks`

### YAML Merge Keys Are Not Expanded In `vars` Or `env`

YAML anchors and aliases work for scalar values inside `vars` and `env`, but
YAML merge keys (`<<`) are not expanded before Task decodes those sections.
Task appears to treat `<<` as a normal variable name and then tries to decode
the merged mapping as a single variable value.

**Reproducer:**

```yaml
version: 3

vars:
  MESSAGE: from-global

tasks:
  vars-merge:
    vars:
      <<:
        VAR_A: '{{.MESSAGE}}'
      VAR_B: local
    cmds:
      - echo "VAR_A={{.VAR_A}} VAR_B={{.VAR_B}}"

  env-merge:
    env:
      <<:
        ENV_A: '{{.MESSAGE}}'
      ENV_B: local
    cmds:
      - echo "ENV_A=$ENV_A ENV_B=$ENV_B"
```

**Actual output:**

```text
"VAR_A" is not a valid variable type. Try "sh", "ref", "map" or using a scalar value
```

The same behavior was observed for `env`, where the error references `ENV_A`
instead.

**Expected behavior:**

Task should either let the YAML parser expand merge keys for `vars` and `env`,
or document/reject `<<` explicitly. From a YAML user's perspective, this should
produce the same result as writing the merged keys directly.

**Working control cases:**

Scalar aliases inside `vars` and `env` work:

```yaml
tasks:
  vars-value-anchor:
    vars:
      VAR_A: &var-a '{{.MESSAGE}}'
      VAR_B: *var-a
    cmds:
      - echo "VAR_A={{.VAR_A}} VAR_B={{.VAR_B}}"

  env-value-anchor:
    env:
      ENV_A: &env-a '{{.MESSAGE}}'
      ENV_B: *env-a
    cmds:
      - echo "ENV_A=$ENV_A ENV_B=$ENV_B"
```

Full-map aliases can also be used when no extension is needed:

```yaml
tasks:
  base:
    internal: true
    vars: &base-vars
      VAR_A: '{{.MESSAGE}}'
    cmds:
      - ':'

  use-base:
    vars: *base-vars
    cmds:
      - echo "VAR_A={{.VAR_A}}"
```

**Likely cause:**

`Vars.UnmarshalYAML` manually iterates over the raw `yaml.Node` mapping entries
to preserve order. That custom decoder sees `<<` as a normal key instead of a
YAML merge operation.

**Possible issue title:** `YAML merge keys are not expanded in vars or env`

## Documentation And Best-Practice Notes

### Environment Variables And Task Variables With The Same Name

Task environment variables can satisfy undeclared Task variables:

```sh
BUILD_PROFILE=release task env-overrides-undeclared-var
```

can make `{{.BUILD_PROFILE}}` available when the task does not define
`BUILD_PROFILE` in `vars`.

If a task defines the same variable in `vars`, that local value wins over the
environment value unless explicit fallback logic is used.

For variables that are meant to be configurable through environment variables,
it is currently safer to keep Task variable names and environment variable names
the same, and avoid unnecessary local defaults that would hide the environment
value.

### Environment Fallback Can Accidentally Fill Variables Like `PATH`

Variables that have no Task value can be implicitly filled from environment
variables with the same name. This is useful for variables like `BUILD_PROFILE`,
but it can be surprising or dangerous for common names such as `PATH`.

Potential feature request:

- Add a configurable allow list for environment-variable fallback.
- Alternatively provide a way to mark Task variables as intentionally
  environment-backed.

### `coalesce (env ...) .VAR` Can Be Useful But Needs Care

Explicit coalescing can give environment variables priority over Task variables:

```yaml
vars:
  PROFILE: '{{coalesce (env "BUILD_PROFILE") .PROFILE}}'
```

However, the `ref:` variant can bypass required enum validation when it resolves
to an empty value. Avoid using `ref:` for this pattern unless the behavior is
intentionally tested.

## Needs Further Reproduction

### Interactive Required Variables In Subtask Calls

There were project-local observations that required variable enum selection in
interactive mode behaves inconsistently when a task calls another task without
passing required variables. This needs a dedicated TTY/taskrc reproduction before
opening an upstream issue.

Observed non-interactive baseline:

```text
Task "child-required" cancelled because it is missing required variables
```

Potential issue area:

- Whether `interactive: true` prompts are consistently triggered for direct task
  calls and subtask calls.
- Whether YAML anchors or conditional task calls affect required-variable
  prompting.

### Root Task Selector In Transient Included Taskfiles

Project-local observation: the root task selector syntax
`task: :some:task:available:from:root` may not be usable in Taskfiles that are
transitively included into the root Taskfile.

This needs a minimal include-chain reproduction before opening an upstream
issue.

## Feature Request Ideas

### Functional Tasks

Tasks are currently focused on execution. It would be useful to define tasks
that intentionally return a result and can be used as input for other Taskfile
features.

Possible shape:

- A `functional: true` property, or a similar distinct mode.
- It could imply or configure behavior similar to `interactive: true` and
  `silent: true`.
- Functional tasks should be usable as input for `vars`, subtask-call `vars`,
  `if`, `status`, `preconditions`, and `enum`.
- Tasks could potentially become pipeable.

Current workaround:

- Running subtasks through shell commands.
- This forces manual serialization/deserialization of values and adds avoidable
  complexity.

### Template-Defined Enums

Enums should be definable by templates, so allowed values can be derived from
project data instead of repeated manually.

### Boolean Variable Type

A boolean variable type would avoid patterns like:

```yaml
enum: ['true', 'false']
```

and checks that compare `ne .VARIABLE "true"` inside Task templates.

### Lazy Template Evaluation And Reusable Template Values

Task templates are evaluated eagerly/static enough that some advanced reuse
patterns are hard or fragile.

Useful improvements:

- Lazy template evaluation where possible.
- A dedicated `template` property for reusable expressions that are not executed
  until used.

Example where reuse is currently useful but limited:

```yaml
tasks:
  example:
    vars:
      ENV:
        sh: yq '.env["{{.BUILD_TARGET_ENVIRONMENT}}"].vars' ./wrangler.jsonc
      ENV_MAP:
        ref: .ENV | fromJson
```

Another example is a shell-backed value that should ideally only run when
needed:

```yaml
vars:
  GIT_COMMIT_SHA:
    sh: |
      if command -v git >/dev/null 2>&1; then
        printf "%s" "$(git rev-parse --verify HEAD)"
      fi
```

### Better Editor Support For Templates And Task Tokens

Useful editor improvements:

- Basic syntax highlighting for Task template expressions, even if it is only
  one color.
- Auto-completion for Task tokens such as variables and task names.

### Cache Key Or Label Control

Task could expose a dedicated property for labels and/or cache keys, or a way to
define which variables participate in cache identity.

### Git-Aware Source Filtering

It would be useful to have a globally and locally configurable switch for
`sources` so that Task only considers tracked and untracked Git files, while
respecting ignored files.

### Built-In Git Utilities

Built-in Git helpers would reduce project-local wrapper tasks.

Potential helpers:

- `hasChanges` / `hasNoChanges`
- `files`
- `changedFiles`
- `stagedFiles`
- Filtering helpers, for example by extension list
