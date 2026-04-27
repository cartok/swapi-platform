# Critical Roadmap

- [x] Check why device detection no longer happens on start page (SSG propably generally affected)
- [ ] Server: Important SSR fixes in API error case:
  - [ ] Render error UI if critical API resource failed
  - [ ] Do not retry API request during SSR, otherwise server is blocked for long time
  - [ ] Create SSR rendering context object for each request, using HttpInterceptor with HttpContext Token and send (503 or similar) status code in critical error case with `no-store` cache headers.
  - [ ] Ensure client then hydrates error UI, knows about the situation and starts retrying such API requests after a delay.
- [ ] Server: Make requests cancelable, so that the server stops working if client stopped requesting.
- [ ] Server: Timeouts via middleware, especially for SSR, with redirection to error page & logging.
- [ ] Deployment: CF Cache busting via given cache tags.
