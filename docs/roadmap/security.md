# Security Roadmap

- [x] Improve security by adding and configuring Hono's Secure Headers Middleware.
- [ ] Security: Enable Script CSP via nonces: https://hono.dev/docs/middleware/builtin/secure-headers#nonce-attribute
- [ ] Disable shell history while adding fly secrets if necessary & if possible remove from clipboard. Or just do not send it to clipboard and store it into file & send it to target system via management cli.
- [x] Ensure that server build does DCE on environment variables
- [ ] Extra rate limiting through middleware on both sides
- [ ] Add a signed header solution for requests:
  1. **Worker:** Create a timestamp and sign it together with the request method and the request path. Set it as header by a JSON string
  2. **Origin:** Check if validation header is set. If so, parse the header value, check if time delta is below 10ish seconds, create the signature out of it and compare the signature. If it's invalid, return 404, otherwise proceed.
- [ ] Hide origin address, only alow CF TLS certificate, change DNS setup

---

- [ ] **Worker:** Send 404 on invalid headers:
  - Check what if any X-Forwarded-Proto, X-Secret-Health-Check, X-Skip-SSG header is set, and if so return 404.
  - Otherwise delete all headers (check if it's fine to do so first)
  - Check what of this really necessary on top of CF protections

- [ ] Send 404 on invalid paths:
  1. **Worker:** Check if request is a HTML request or one to /assest/, files in public dir, /.well-known/, /cdn-cgi/ (might not be necessary to check for origin)
  2. **Origin:** Check if request is a HTML request or one to an entry of a `Set` that is generated out of the vite manifest and a new `public-manifest.json` that gets generated on client build and includes all files in the public dir. The `Set` is only generated once on server start. If the result is `false` return 404.
