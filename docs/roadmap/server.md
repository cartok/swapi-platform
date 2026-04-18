# Server Roadmap

- [ ] Device Detection: Try to do URL rewrites instead of redirects to:
  1. Speed up the initial page load
  2. Keep URLs clean

  You most likely need a caching solution via custom headers as URLs for the HTML pages will then no longer be unique.

- [ ] Implement process signal handling for proper shutdown, inculding healthcheck endpoints-
- [ ] Possibly cache the SSG files in memory so that file-system access does not occur every time.
