# Developer Experience (DX) Roadmap

- [ ] Update the VS Code launch configuration for debugging.
- [ ] Eventually add VS Code tasks that compose `Taskfile` tasks for advanced workflows.

---

- [ ] No unified sourcemap values, just define one env var per bundling tool (vite, rolldown, babel)
- [x] Cleanup app paths code a bit further & Check `/<path>` references and eventually use the constants + Two formats per path: one with and one without slash. (last part not done on purpose)
- [ ] Logging wrapper

---

- [ ] Git Hooks for linting, testing
- [x] Fix at least in the server project: Files that were build and then deleted (the sources) are not discovered as deleted, cause TS resolves to the built .js files.
- [ ] Taskfile: re-check `sources`, `generates`, `preconditions`
