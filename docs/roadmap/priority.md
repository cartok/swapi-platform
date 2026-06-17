# Priority Roadmap

- [ ] Fix situation in development server task: Could not add node condition for @swapi/hono/source, due to a [bun bug](https://github.com/oven-sh/bun/issues/30619) with more than 3 node conditions and temporarily added @swapi/server/source conditions to the hono package.json as a workaround.

## Environment Variables

- [ ] In general solid distinction between runtime and build time variables
- [ ] Simpler variable names, only prefixes where necessary in a defined manner.

### App Runtime Variables do not exist right now

- [ ] The (vite) app has no real runtime variables, only those that are statically built, and which also will be used for DCE! A propably good solution here would be to create a microservice which gets variables from its host environment. It would propably be best if that service is a dedicated CF worker, to have it close to the client, as it's mandatory to get that information fast. Changes solely for the app runtime variables should not make it necessary to restart app-server or app-worker. If possible, the default variable values should still come from the code. If not possible, it could be implemented in the already existing CF worker.

  Links:
  - https://developers.cloudflare.com/kv/

  Variables:
  - `LOG_LEVEL`
  - `USE_SWAPI_MOCK` (even though it's temporary)
  - ... things like API addresses ...
  - ... things like feature flags that are system specific, not user relevant similar to `USE_SWAPI_MOCK` ...

## Compose

- [ ] Finish basic docker compose setup after necessary variables (will skip app runtime variable solution) are finally ok, to have E2E building and running locally through compose

## CI

- [ ] Create github actions based CI in steps. Test it locally using `act`.
- [ ] Have a working basic version running.
- [ ] Feature: Automated CF cache clear
- [ ] Feature: Automatic rollback

## Code quality

- [ ] Make use of [@typescript-eslint/naming-convention](https://typescript-eslint.io/rules/naming-convention/#options) after finishing E2E (+ CI)
- [ ] Change monorepo package folder structure and rename the packages

## Docs

- [ ] Update / Cleanup docs
- [ ] Go to the beach
