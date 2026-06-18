# Next

## Wait for bun fix

- Fix situation in development server task: Could not add node condition for @swapi/hono/source, due to a [bun bug](https://github.com/oven-sh/bun/issues/30619) with more than 3 node conditions and temporarily added @swapi/server/source conditions to the hono package.json as a workaround.

## Environment Variables

### App Runtime Variables do not exist right now

The (vite) app has no real runtime variables, only those that are statically built, and which also will be used for DCE! A propably good solution here would be to create a microservice which gets variables from its host environment. It would propably be best if that service is a dedicated CF worker, to have it close to the client, as it's mandatory to get that information fast. Changes solely for the app runtime variables should not make it necessary to restart app-server or app-worker. If possible, the default variable values should still come from the code. If not possible, it could be implemented in the already existing CF worker.

**Links:**

- https://developers.cloudflare.com/kv/

**Variables:**

- `LOG_LEVEL`
- `USE_SWAPI_MOCK` (even though it's temporary)
- ... things like API addresses ...
- ... things like feature flags that are system specific, not user relevant similar to `USE_SWAPI_MOCK` ...

### App Server Runtime Variables could be more flexible

Generally: For runtime variables fly secrets can be used.

It would make sense to be able to change port, host and the list of allowed hosts through runtime variables, but at the moment the SSG rendering is done statically during build process only and it depends on host and port variables.

## Important Angular Update

Angular 22 is out and it supports TS6, so the update would bring more ease to the project as it right now it uses TS5 and TS5.
With the new Angular version the `CommonEngine` got deprecated. Will have to take a look if the new one can be integrated well. There is also that `ɵSERVER_CONTEXT` issue where the SSG-rendered pages get rendered with `app-root[ng-server-context="ssr"]`, which might be fixed afterwards. Additional care should be taken to also update Analog.js. Both of these updates might also allow the tsconfig and vite bundling workarounds in the app code.

## Maintainance

Automated dependency patching incl. deployment. Propably it would be good to also invest some time into observability, to make sure that this can just run as it wants and that I only get informed if:

- production has issues
- dependency updates were unsuccessful
- major package updates are possible.

## Backend

Basic own backend.
