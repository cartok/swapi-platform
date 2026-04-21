# Server Roadmap

- [ ] Device Detection: Try to do URL rewrites instead of redirects to:
  1. Speed up the initial page load
  2. Keep URLs clean

  Most likely need a caching solution via custom headers as URLs for the HTML pages will then no longer be unique. Maybe first try out device detection on CF Worker.

- [x] Deny crawlers for now.
- [x] Deny indexing for now.
- [ ] Implement process signal handling for proper shutdown, inculding healthcheck endpoints
- [ ] Once SWAPI certificate got updated, benchmark to find good soft and hard limits

---

- [ ] Eventually cache the SSG files in memory so that file-system access does not occur every time
- [ ] Eventually cache the SSR results in volatile memory
  - [ ] Decide about database
  - [ ] Implement SWR
  - [ ] Add cache clean endpoint
  - [ ] Add automated tests

  Eventually make use of bun's file API, but first try out CF worker for the whole server

- [ ] Eventually make more use of hono's MiddlewareHandler and Handler types
- [ ] Eventuelly switch to RPC

---

- [ ] Test if in-flight requests telemetry behaves correct
- [ ] Smoke test retrys + ggf nextTick
- [ ] Make requests cancelable, so that the server stops at least SSR if client stoped requesting
