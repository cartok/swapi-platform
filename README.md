# Angular SSR/SSG web platform for SWAPI

<!-- TODO: update -->

This repository started as a successful job application challenge implementation of a frontend for the Star Wars API (SWAPI) and has been evolved into a production-oriented _(yet not fully production ready)_ Angular monorepo template optimized for responsive server-first rendering and ready for custom APIs and services.

- [UI Mockups / Design given by job application challange](https://xd.adobe.com/view/b3c98134-11a8-44c2-5dd2-477b8550307f-c5f8/)

## Live Demos

> Currently the SWAPI is down due to a expired TLS certificate, but data is mocked with an artificial request delay at the moment until I created my own backend.

- [Test domain (Fly.io behind Cloudflare)](https://swapi-platform.cartok.dev/)
- [Fly.io test domain](https://swapi-platform.fly.dev/)

  The first request can take longer, as the fly.io machine will automatically suspend if there was no traffic for a while.

## What This Project Demonstrates

<!-- TODO: incomplete -->

- Modern Angular architecture with standalone components, zoneless change detection, and lazy-loaded routes
- Hybrid rendering setup with CSR, SSR, and SSG in one codebase
- Device-aware server-first routing using Client Hints + URL device context parameters
- Strict environment/schema validation and shared typed contracts across packages
- Defensive third-party API integration for SWAPI with explicit DTO-to-model mapping
- Docker-ready build and runtime setup

## Architecture At A Glance

### Monorepo Packages

<!-- prettier-ignore -->
| Package | Responsibility |
| --- | --- |
| `packages/client` | Angular app (browser + server entry, routes, pages, UI blocks/components) |
| `packages/server` | Hono host for security checks, device context handling, redirects, SSG file serving, SSR fallback |
| `packages/shared` | Shared runtime/types, routing constants, device context schema, code generators |

### Request And Rendering Flow

1. Validate host/protocol (`SWAPI_ALLOWED_HOSTS`, target-aware HTTP/HTTPS checks).
2. Read device context from Client Hints headers (`Sec-CH-UA-*`, viewport hints).
3. Normalize URL to a device-context prefix segment like `r;format=mobile;width=768`.
4. Serve static assets from the built browser output.
5. Serve prerendered HTML (SSG) when a matching file exists.
6. Fall back to Angular SSR for all non-prerendered HTML routes.

### Current SSG Scope

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

## Reliability and Production Features

- Clear client/server request behavior for stable, predictable runtime behavior.
- Automatic cancellation of obsolete in-flight requests during fast navigation to reduce unnecessary backend load.
- CDN-ready caching model with explicit cache headers and cache tagging support.
- Consistent HTTP error and timeout responses with cache-safe semantics.
- Isolated SSR execution in a worker pool with controlled concurrency and bounded queueing.
- Worker recovery and runtime metrics for observability and operational diagnostics.
- Graceful shutdown with in-flight request draining for safer deploys and restarts.

## SWAPI Integration Notes

SWAPI is intentionally integrated defensively because of schema and data inconsistencies.

- See details in [docs/swapi.md](./docs/swapi.md)
- Includes known API behavior differences, mapping strategy, and fallback decisions

### Temporary SWAPI Mock Mode

As of **May 2026**, the public `swapi.dev` API is unstable due to an expired TLS certificate.
To keep the app reliably usable across environments, the client currently serves SWAPI responses from local mock data.

- Mock source: SWAPI fixture data (`Juriy/swapi`) transformed to SWAPI-compatible `films`, `people`, and `planets` API responses
- Activation: `USE_SWAPI_MOCK=true` in client environment files
- Mock transport behavior: includes an artificial per-request delay (`150-450ms`) for both success and `404` responses

This is a temporary fallback until the app is switched to its own backend.

## Setup

### Prerequisites

<!-- TODO: incomplete list and bad structure -->

- **Node.js**

  Version: see [.node-version](./.node-version)

  It's recommended to have a node version manager compatible with .node-version set up for automatic installation and update of the Node.js version used in the project.

- **Bun**

  Version: see [.bun-version](./.bun-version) but any works, as it is installed and only run from project dependencies.

  Only necessary to install the dependencies. The bun binary that is to be used for in the project will be installed via `package.json` and is used throughout the tasks via `bunx bun` in order to align the bun version for every developer and with the production runtime environment _(a fixed version of oven/bun docker image is used)_.

- **direnv**

- **Taskfile**

  It's recommended to install Taskfile on the system plus setting up shell completion.

- **Fly.io CLI**

  Only if you intend to deploy from your local environment instead of CI.

### Install

```bash
cp ./Taskfile.template.yml ./Taskfile.yml
task i
```

Local URLs:

- App's vite server in development mode: `http://localhost:4200`
- App's vite server in production mode: `http://localhost:4300`
- App's hono server in development mode: `http://localhost:50000`
- App's hono server in production mode: `http://localhost:51000`
- App's cloudflare worker: `http://localhost:52000`

### Build Matrix

Use BUILD_PROFILE` and BUILD_TARGET_ENVIRONMENT` explicitly when needed:

- BUILD_PROFILE`: `development`, `release`
- BUILD_TARGET_ENVIRONMENT`: `local`, `ci`, `testing`, `production`

#### Environment Variables

Taskfiles derive the app environment variables from the Build Matrix variables:

- BUILD_PROFILE`: `BUILD_PROFILE`
- BUILD_TARGET_ENVIRONMENT`: `BUILD_TARGET_ENVIRONMENT`

Taskfiles load the remaining environment variables via dotenv from `.env` files like:

- `packages/client/.env/.env.BUILD_TARGET_ENVIRONMENT>.BUILD_PROFILE>`
- `packages/server/.env/.env.BUILD_TARGET_ENVIRONMENT>.BUILD_PROFILE>`

## Documentation

See the project documentation in the [`docs`](docs/) folder.

## Roadmap

<!-- TODO: describe -->

See the project roadmap documents in the [`docs/roadmap`](docs/roadmap/) folder.
