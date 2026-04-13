# Bundling and Runtime Roadmap

- [x] Remove `node_modules` from the server bundle.
- Replace Express with Hono.
- [x] Ensure that server build is JIT free (Angular-wise) as right now it's not.
- Add additional Docker targets for a full matrix: `bundled|unbundled x full-linux|distroless`.
- Use automated tests against this matrix to detect bundling or distroless runtime issues early.
