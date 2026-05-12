# Security Roadmap

- [x] Improve security by adding and configuring Hono's Secure Headers Middleware.
- [ ] Security: Enable Script CSP via nonces: https://hono.dev/docs/middleware/builtin/secure-headers#nonce-attribute
- [ ] Disable shell history while adding fly secrets if necessary & if possible remove from clipboard. Or just do not send it to clipboard and store it into file & send it to target system via management cli.
- [x] Ensure that server build does DCE on environment variables
- [ ] Extra rate limiting through middleware on both sides

---

- [ ] Send 404 on invalid paths and log it:

  I. Worker
  1. Asset match by a Set of vite manifest entries + files in public dir. Eventually add the previous manifest aswell.
  2. Otherwise check if it's HTML request else 404
  3. If valid, create and sign timestamp and set it as header by a json string. Before step 1. Check if the header is set and return 404 if it is.

  II. Origin
  1. Check if validation header is set. If so, parse the header value, check if time delta is below 10ish seconds, create the signature out of it and compare the signature. If it's invalid, return 404, otherwise proceed.
  2. If the validation header is not set: Do the same validation on the origin side. That code can be shared.

- [ ] Check all other custom headers. If they exist but should not, send 404 and log it
