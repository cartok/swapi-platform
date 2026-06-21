# Taskfile

## Limits (wip)

- Reusing enum values for interactive selection is currently not possible but there is an existing github issue. So until then only use YAML anchors to reuse enum definitions (but that sadly does not work accros files).
- There are referencing issues that limit variable compositions. So for now prefer to reference at max two lavels and in turn keep variables flat, even though it would be cleaner otherwise. Take the `APP_SERVER_SERVICE_NAME`, `APP_SERVER_COMPOSE_ENV_FILE`, `APP_SERVER_DOCKER_CONTAINER_NAME`, `APP_SERVER_DOCKER_IMAGE_NAME`, `APP_SERVER_DOCKER_IMAGE_REFERENCE_LOCAL` variables as a reference example.

## Best Practices

### Order

- Generally retain the order of the standard [actions](#action)
- In each section define tasks "bottom-up" (from the smalles to the biggest), so that YAML anchors can be an option in properties where Taskfile variables can't be used.

  Example:

  ```yml
  tasks:
    client:build:
    client:build:dist-paths:
    client:build:browser:
    client:start:
    client:test:
  ```

### Maps (wip)

### Variables

- Define required task variables as `required:` even if a default value is given via `vars:`.
- Sort variables that are used as parameters (`requires:`) to the top of the `!ars:` list
- _(not yet applied)_ Always use a prefix for variables to not collide with things like `PATH` from system environment:
  - Use `P_` for parameters / required variables
  - Use `V_` for local variables

### Labels

General format: `<task-name>[:<target-env>][:<profile>]`

- Use `labels:` if a tasks output depends on variables
  - If those build outputs are not for development purpose
  - If it is a deployment task
  - Especially if task execution is [cached](#caching)

### Caching

- Use `labels:` if a task has run conditions like `sources:` or `status:`. Taskfile will evaluate the conditions for each label. This solves for example the situation, where you run a `lint:` task, that depends on BUILD_PROFILE` in some way, with BUILD_PROFILE: development` that hase some static `sources:` defined first - so it will get cached if it succeeds - but then you run it with BUILD_PROFILE: release` (or some other task runs it like that) and the task would not run.
- Always Define inclusion lists for `sources:`

### Commands

- Use folded block scalar style only for single commands

### Property order for tasks (coarse)

1. meta: `label`
1. meta: `desc`
1. meta: `summary`
1. flags: `internal`
1. flags: `interactive`
1. flags: `silent`
1. guards: `preconditions`
1. guards: `if`
1. variables: `requires`
1. variables: `vars`
1. cache-guards: `status` (overrides/superseeds `sources` and `generates`)
1. cache-guards: `sources`
1. cache-guards: `generates`
1. `deps`
1. `dir`
1. shell-variables: `dotenv`
1. shell-variables: `env`
1. `cmd`/`cmds`

## Glossary

### Task Names

TBD

### Task Scope

Defines the scope of task [actions](#action).

Every taskfile defines a scope and every package (despite [tsconfig](../packages/tsconfig/)) has a taskfile.

- scope name: `root`, workspace root
- scope name: `client`, workspace package: @swapi/client
- scope name: `server`, workspace package: @swapi/server
- scope name: `shared`, workspace package: @swapi/shared
- scope name: `worker`, workspace package: @swapi/worker
- scope name: `e2e`, workspace package: @swapi/e2e
- scope name: `hono`, workspace package: @swapi/hono

### Action

Defines which standard task actions exist.

Actions can use [tools](#tool).

- `lint`
- `fix`
- `build`
- `start`
- `test`
- `deploy`

### Tool

Defines a `tool:` task.

Tools wrap things like binaries that are commonly used in actions to provide good standards and caching behavior.

**Examples**

- `tool:eslint`
- `tool:eslint:lint`
- `tool:eslint:fix`
- `tool:prettier`
- `tool:prettier:lint`
- `tool:prettier:fix`

### Target Environment

`@dotenv-matrix` (app, app-server)

Defines the target environment a task result is built or configured for. Each part of the system should be flexible about defining their own possible target environments, but below are standard values defined which should be preferred if suiting.

- `local`
- `ci`
- `testing`
- `staging`
- `production`

### Build Profile

<!-- TODO: reformat the other glossary sections aswell -->

**Variable:** `BUILD_PROFILE`

**Tags:** `@dotenv-matrix` (app, app-server)

Defines with which profile builds are created, code is started or linted. Influences selection of dotenv files, which predefine several configurations.

Right now there is only one variable for all parts of the application. This could later get split if neccessary.

**Values:**

- `development`
- `release`

### Build Variant

**Tags:** `@dotenv-matrix`

Defined by the combination of [Build Profile](#profile) and [Target Environment](#target-environment).

### Virtualization Level

Defines the isolation/runtime level the task result is intended to run with.

- `native`
- `docker`

### Workflow Context

Defines from which workflow a task ist started.

- `local`
- `pre-commit`
- `pre-push`
- `ci`

### Source Mode

Defines which kind of sources builds should use.

Passed to the application as `BUILD_SOURCE_MODE` build environment variable. At the moment it is only used in the Vite build of the Angular App to select the correct Node.js conditions. The goal was to later be able to run the App Server directly without manual pre-compiling to have hot reload working across the boundaries.

- `source`
- `dist`

## Policies

### Table

<!-- prettier-ignore -->
| Action | Workflow Context | Virtualization Level | Target Environment | Build Profile |
| --- | --- | --- | --- | --- |
| build | local | native, docker | local | development, release |
| build | ci | docker | ci, production | release |
| lint | local, pre-commit, ci | native | - | development, release |
| fix | local, pre-commit | native | - | development |
| test:unit | local, pre-commit, ci | native | - | development, release |
| test:integration | local, pre-push, ci | native, docker | local, ci | development, release |
| test:e2e | local, pre-push, ci | native, docker | local, ci | release |
| start | local | native, docker | local | development, release |
| start | ci | docker | ci | release |
| deploy | local, ci | native | testing, production | release |

### Textual Examples

### Building a code bundle

In the "server" `scope` a **"build:bundle"** `action` may be run by the "local", "pre-push", and "ci" `workflow context`s.

- If it runs in the "local" `workflow context`, it may build for the "native" and "docker" `virtualization level`.
- If it runs in the "ci" `workflow context`, it may only build for the "docker" `virtualization level`.
- If it runs in the "pre-push" `workflow context`, it may only build for the "native" `virtualization level`.
- It may not run in the "pre-commit" `workflow context` as it would be too time consuming.

### Linting code

- In nearly any `scope` a **"lint"** `action` may be run by the "local", "pre-commit", and "ci" `workflow context`s.
  - Linting shall not be executed in docker image builds.
  - If it runs in the "local" or "pre-commit" `workflow context`, it may make use of caching and execution necessity checks and it may run for the "development" and "release" `build profile`.
    - If it runs in the "development" `build profile` it might take less resources but be less strict
    - If it runs in the "release" `build profile` it might take more resources to be more strict
  - If it runs in the "ci" `workflow context`, it may not make use of any caching or execution necessity checks and may only run in the "release" `build profile`.

---

## Task name ideas

Here are some old approaches to name and structure tasks, that were used for finding a good solution and are not implemented like that and are no standard to orientate on.

Names used might differ.

### 1. By full names

> Likely not the best solution.

**Task name pattern:** `<action|tool>[/<target>][/<profile>][:MISC ...] [VARIABLES ...]`

**Task name examples**

- install
- test/local
- test/release
- build/release/ci
- deploy/release/testing
- deploy/release/testing:fast
- generate:schema
- lint:tsc
- lint/release:tsc
- fix:eslint
- tool:eslint:fix
- tool:eslint

**Execution examples**

- `task deploy/release/testing`

#### Estimation

- **Pro**
  - Simple tasks
  - Composition
  - Coupling: low
  - Visibility in package task names about whats available
- **Contra**
  - Many tasks
  - Many Boilerplates
  - Composition complexity
  - No use of interactive prompts
  - Cohesion: low
  - Visibility in package task names about whats available but not intended to be used locally

### 2. By variables

**Task name pattern:** `<action|tool>[:<everything-else>: ...]: PROFILE=<profile> TARGET=<target> [VARIABLES ...]`

**Task name examples**

- install
- lint
- build
- start
- tool:eslint
- tool:prettier

**Execution examples**

- `task deploy PROFILE=development TARGET=testing`

#### Estimation

- **Pro**
  - Few tasks
  - Use of interactive prompts
  - Cohaesion: high
- **Contra**
  - Complex tasks
  - Coupling: low
