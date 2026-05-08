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
- [ ] Server termination in docker seems to have issues, which are most likely caused by the new workers: `[docker:start] libgcc_s.so.1 must be installed for pthread_exit to work`
- [ ] CF Worker Proxy with the Device Redirection functionallity
  - [x] Rate limiting by using the free WAF rule
  - [ ] Recheck HTML caching afterwards (no more 302 on fly.io)

---

- [x] Add mock data, incl. some routes that error on purpose
- [x] Update README

---

- [ ] Extra rate limiting through hono middleware
- [ ] Deployment: CF Cache busting via given cache tags.
