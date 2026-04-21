# Angular SSR/SSG web platform for SWAPI

This repository started as a successful job application challenge implementation of a frontend for the Star Wars API (SWAPI) and has been evolved into a production-oriented _(yet not fully production ready)_ Angular monorepo template optimized for responsive server-first rendering and ready for custom APIs and services.

- [UI Mockups / Design given by job application challange](https://xd.adobe.com/view/b3c98134-11a8-44c2-5dd2-477b8550307f-c5f8/)

## Live Demos

- [Test domain (Fly.io behind Cloudflare)](https://swapi-platform.cartok.dev/)
- [Fly.io test domain](https://swapi-platform.fly.dev/)
- [GitHub Pages demo (CSR only)](https://cartok.github.io/swapi-platform/)

## What This Project Demonstrates

- Modern Angular architecture with standalone components, zoneless change detection, and lazy-loaded routes
- Hybrid rendering setup with CSR, SSR, and SSG in one codebase
- Device-aware server-first routing using Client Hints + URL device context parameters
- Strict environment/schema validation and shared typed contracts across packages
- Defensive third-party API integration for SWAPI with explicit DTO-to-model mapping
- Docker-ready build and runtime setup

## Architecture At A Glance

### Monorepo packages

<!-- prettier-ignore -->
| Package | Responsibility |
| --- | --- |
| `packages/client` | Angular app (browser + server entry, routes, pages, UI blocks/components) |
| `packages/server` | Hono host for security checks, device context handling, redirects, SSG file serving, SSR fallback |
| `packages/shared` | Shared runtime/types, routing constants, device context schema, code generators |
| `scripts` | Helper scripts for build/runtime tasks |

### Request and rendering flow

1. Validate host/protocol (`SWAPI_ALLOWED_HOSTS`, target-aware HTTP/HTTPS checks).
2. Read device context from Client Hints headers (`Sec-CH-UA-*`, viewport hints).
3. Normalize URL to a device-context prefix segment like `r;format=mobile;width=768`.
4. Serve static assets from the built browser output.
5. Serve prerendered HTML (SSG) when a matching file exists.
6. Fall back to Angular SSR for all non-prerendered HTML routes.

### Current SSG scope

- Static prerendered paths are generated from `@swapi/shared/routing/ssg-paths`.
- Currently includes:
  - `error`
  - `home` with all generated device-context variants
- At the moment this results in `98` prerendered routes in total.

## Feature Scope

- Routes: `home`, `movies`, `movie/:id`, `characters`, `character/:id`, `planets`, `planet/:id`, `error`
- SWAPI resources: Films, People, Planets
- HTTP retry interceptor and explicit SWAPI DTO/model mapping layer
- Responsive & a11y friendly UI
  - _The search input in the header is only UI demonstration, and has no functionality._
- DeviceService with route-aware and browser-aware breakpoint handling

## SWAPI Integration Notes

SWAPI is intentionally integrated defensively because of schema and data inconsistencies.

- See details in [docs/swapi.md](./docs/swapi.md)
- Includes known API behavior differences, mapping strategy, and fallback decisions

## Setup

### Prerequisites

- **Node.js**

  Version: 24.14.1

  It's recommended to have a node version manager compatible with .node-version set up for automatic installation and update of the Node.js version used in the project.

- **Bun**

  Version: 1.x

  Only necessary to install the dependencies. The bun binary that is to be used for in the project will be installed via `package.json` and is used throughout the tasks via `bunx bun` in order to align the bun version for every developer and with the production runtime environment _(a fixed version of oven/bun docker image is used)_.

- **Taskfile**

  It's recommended to install Taskfile on the system plus setting up shell completion.

  Otherwise you could run: `bunx [--no-install] task`

### Install

```bash
task i
```

### Run

```bash
# Start `vite` dev server (only CSR, hot reload).
task client:dev

# ~ Build and start with `release` profile.
task client:start

# Start `bun` + `hono` server with SSG and SSR in dev mode.
# Notice: It's not yet fully direct code execution, no client hot reload.
task server:dev

# ~ Build and start with `release` profile.
task server:start

# ~ Add bundling.
task server:bundle

# ~ Build and run in Docker.
task docker:start
```

Local URLs:

- App's vite server in development mode: `http://localhost:4200`
- App's vite server in production mode: `http://localhost:4300`
- App's bun + hono Server in development mode: `http://localhost:50000`
- App's bun + hono Server in production mode: `http://localhost:51000`

## Build, Bundle, and Quality

### Linting and formatting

```bash
task lint
task fix
```

### Tests

```bash
task client:test
```

### Build matrix

Use `PROFILE` and `TARGET` explicitly when needed:

- `PROFILE`: `debug` or `release`
- `TARGET`:
  - server: `local`, `testing`, `production`
  - client browser build also supports `pages`

## Environment Configuration

Taskfiles load environment values from checked-in `.env` files:

- `packages/client/.env/.env.<target>.<profile>`
- `packages/server/.env/.env.<target>.<profile>`
- Docker runtime variants additionally use `packages/server/.env/.env.<target>.<profile>.docker`

Main runtime variables:

- `SWAPI_TARGET` (`local|testing|production`)
- `SWAPI_PROFILE` (`debug|release`)
- `SWAPI_RUN_MODE` (`source|build`)
- `SWAPI_SERVER_PORT`
- `SWAPI_SERVER_HOST`
- `SWAPI_ALLOWED_HOSTS`

## Roadmap

See the project roadmap documents in the [`docs/roadmap`](docs/roadmap/) folder.
