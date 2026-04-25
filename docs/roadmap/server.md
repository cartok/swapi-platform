# Server Roadmap

- [x] Deny crawlers for now.
- [x] Deny indexing for now.
- [x] Implement process signal handling for proper shutdown, inculding healthcheck endpoints

## Device Detection

- [ ] Eventually try to do URL rewrites instead of redirects to:
  1. Speed up the initial page load
  2. Keep URLs clean

  Most likely need a caching solution via custom headers as URLs for the HTML pages will then no longer be unique. Maybe first try out device detection on CF Worker.

## Quality

- [ ] Unify smoke test code, less repetition & timeouts should be configurable in one place.
- [ ] Environment variables for things like timeouts that are referred to in the code.
- [ ] Eventually refactor file cache code in a cohesive class structure.

## Stability

- [ ] At least log out a warning if in-flight request count is reaching configured fly.io soft limit
- [ ] Make requests cancelable, so that the server stops at least SSR if client stoped requesting
- [ ] Test if in-flight requests telemetry behaves correct
- [ ] Semaphore + FIFO-Queue and logging for SSR rendering

## Performance

- [ ] Try out worker threads SSR rendering for >= 4 Cores or so
- [ ] Eventually cache the SSG files in memory so that file-system access does not occur every time
- [ ] Eventually cache the SSR results in volatile memory
  - [ ] Decide about database
  - [ ] Implement SWR
  - [ ] Add cache clean endpoint
  - [ ] Add automated tests

  Eventually make use of bun's file API, but first try out CF worker for the whole server

## Response Caching

- [x] Cache control headers and cache tags
