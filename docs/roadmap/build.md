# Build Roadmap

- [x] Remove `node_modules` from the server bundle.
- [x] Replace Express with Hono.
- [x] Ensure that server build is JIT free (Angular-wise) as right now it's not.
- [ ] Add additional Docker targets for a full matrix: `bundled|unbundled x full-linux|distroless`.
- [ ] Eventually add bunfig.toml with `env = false` and eventually more.
