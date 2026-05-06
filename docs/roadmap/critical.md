# Critical Roadmap

- [x] Check why device detection no longer happens on start page (SSG propably generally affected)

---

- [x] Do not retry API request during SSR, otherwise server is blocked for long time
- [x] Ensure client retrys API requests that failed on SSR
- [x] Send (503 or similar) status code in critical error case with `no-store` cache headers.
- [x] Server: Make requests generally cancelable, so that the server stops working if client stopped requesting.
- [x] Server: General request timeout
- [x] Server: Make SSR rendering cancelable by client cancelation or timeouts by creating a worker solution including a queue.
- [x] To allow SSR rendering abortion via singals and to gather information about the rendering result, so that it can be treated on server side: Create SSR rendering context object for each request, using HttpInterceptor with HttpContext Token

---

- [x] Add mock data, incl. some routes that error on purpose
- [ ] Update README

---

- [ ] Render error UI in page content, if critical API resource failed
- [ ] Ensure client then hydrates error UI and retries after a small delay so that the user can understand whats going on.

---

- [ ] Deployment: CF Cache busting via given cache tags.
