# Angular SSR/SSG web platform

This repository started as a successful application challenge implementation of a frontend for the Star Wars API (SWAPI) and has been evolved into a production-oriented Angular monorepo template optimized for responsive server-first rendering and ready for custom APIs and services.

- [UI Mockups / Design](https://xd.adobe.com/view/b3c98134-11a8-44c2-5dd2-477b8550307f-c5f8/)

Live Demo (GitHub Pages, CSR only):

- [https://cartok.github.io/swapi-platform/](https://cartok.github.io/swapi-platform/)

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
| `packages/server` | Express host for security checks, device context handling, redirects, SSG file serving, SSR fallback |
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
- Responsive UI blocks/components for list/detail pages
- DeviceService with route-aware and browser-aware breakpoint handling

## SWAPI Integration Notes

SWAPI is intentionally integrated defensively because of schema and data inconsistencies.

- See details in [docs/swapi.md](./docs/swapi.md)
- Includes known API behavior differences, mapping strategy, and fallback decisions

## Setup

### Prerequisites

- Node.js `24.14.1`
- Bun `1.3.9`
- Task runner: either `task` installed globally or via `bunx --no-install task`

### Install

```bash
bun i
```

### Run locally

```bash
# Angular dev server (client only)
task client:dev

# Angular preview server after browser build
task client:start

# Full server pipeline (security + device context + SSG + SSR)
task server:dev

# Full server pipeline in production mode
task server:start
```

Local URLs:

- Client dev server: `http://localhost:4200`
- Client preview server: `http://localhost:4300`
- SSR/SSG server: `http://localhost:51000`

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

Use `MODE` and `TARGET` explicitly when needed:

- `MODE`: `development` or `production`
- `TARGET`:
  - server: `local`, `testing`, `production`
  - client browser build also supports `pages`

Examples:

```bash
task server:build:with-ssg MODE=production TARGET=local
task server:bundle MODE=production TARGET=local
task server:start:bundle MODE=production TARGET=local
```

## Docker

```bash
task docker:build
task docker:start
```

The container exposes the server on port `51000` by default.

## Environment Configuration

Taskfiles load environment values from checked-in `.env` files:

- `packages/client/.env/.env.target.*`
- `packages/client/.env/.env.output.*`
- `packages/server/.env/.env.target.*`
- `packages/server/.env/.env.output.*`

Main runtime variables:

- `SWAPI_TARGET` (`local|testing|production`)
- `SWAPI_OUTPUT_MODE` (`development|production`)
- `SWAPI_SERVER_PORT`
- `SWAPI_SERVER_HOST`
- `SWAPI_ALLOWED_HOSTS`

## Documentation Index

- Device context strategy and Client Hints notes: [docs/device-context.md](./docs/device-context.md)
- SWAPI integration details: [docs/swapi.md](./docs/swapi.md)
- Technical decisions and trade-offs: [docs/entscheidungen.md](./docs/entscheidungen.md)
- Hosting roadmap (Fly.io, Cloudflare, later VPS): [docs/hosting.md](./docs/hosting.md)
