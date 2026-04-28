# Critical Roadmap

- [x] Check why device detection no longer happens on start page (SSG propably generally affected)

---

- [ ] Server: Important SSR fixes in API error case:
  - [x] Do not retry API request during SSR, otherwise server is blocked for long time
  - [x] Ensure client retrys API requests that failed on SSR
  - [ ] Render error UI in page content, if critical API resource failed
  - [ ] Create SSR rendering context object for each request, using HttpInterceptor with HttpContext Token and send (503 or similar) status code in critical error case with `no-store` cache headers.
  - [ ] Ensure client then hydrates error UI and retries after a small delay so that the user can understand whats going on.

---

- [ ] Server: Make requests cancelable, so that the server stops working if client stopped requesting.
- [ ] Server: Timeouts via middleware, especially for SSR, with redirection to error page & logging.
- [ ] Deployment: CF Cache busting via given cache tags.
