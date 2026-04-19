# Server Roadmap

- [ ] Device Detection: Try to do URL rewrites instead of redirects to:
  1. Speed up the initial page load
  2. Keep URLs clean

  You most likely need a caching solution via custom headers as URLs for the HTML pages will then no longer be unique.

- [ ] Implement process signal handling for proper shutdown, inculding healthcheck endpoints
- [ ] Possibly cache the SSG files in memory so that file-system access does not occur every time.
- [ ] Eventually make use of bun's file API, but first try out CF worker for the whole server
- [x] Deny crawlers for now.
- [x] Deny indexing for now.
- [ ] Analyze cause for PU02 errors.
- [ ] Eventually make more use of hono's MiddlewareHandler and Handler types
