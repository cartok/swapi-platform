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
- [x] Environment variables for things like timeouts that are referred to in the code.
  - [ ] Make use of them.
- [ ] Is it possible to have the node server use sourcemaps to keep MINIFY in server env active so that runtime code is minified but still get good error logs?
- [x] Create a secret check utility

## Stability

- [x] At least log out a warning if in-flight request count is reaching configured fly.io soft limit
- [x] Test if in-flight requests telemetry behaves correct
- [x] SSR Render Worker Pool
- [ ] Additional rate limiting

## Performance

- [ ] HTML result caching via Dragonfly (and runtime memory)
  - [ ] First only feature flaged to speed up E2E testing.
  - [ ] Right now there is a simple runtime memory based volatile solution in place. A fast NoSQL DB like Dragonfly would allow storing the results. For production though, in order to scale I'd have to properly limit the system. Ultimately caching shouldn't be so important when on production requests go through CF, but it can still be a good thing and at least it can help with E2E tests and exploration is fun.
    - [ ] non-personal SSR results: Should be worth it, to store/restore those persistently.
    - [ ] SSG results: Are just files which get loaded by, not sure how I want to do this. I could preload all SSG files on start into memory, if the total size will stay small but here im rather creating scalable solutions - so maybe create a space limited solution. First benchmark bun vs Dragonfly access for SSG files, to see potential benefits for SSG.

---

- [ ] Create a good long running load test and analyze GC and compare `large heap` with `small heap` via `--smol` flag

## Response Caching

- [x] Cache control headers and cache tags
- [ ] Cache avoid mechanism via secret
