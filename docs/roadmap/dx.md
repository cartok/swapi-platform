# Developer Experience (DX) Roadmap

- [ ] Update the VS Code launch configuration for debugging.
- [ ] Eventually add VS Code tasks that compose `Taskfile` tasks for advanced workflows.

---

- [ ] No unified sourcemap values, just define one env var per bundling tool (vite, rolldown, babel)
- [ ] Cleanup app paths code a bit further & Check `/<path>` references and eventually use the constants + Two formats per path: one with and one without slash.
- [ ] Logging wrapper

---

- [ ] Add end-to-end tests incl. axe a11y
- [ ] Fix unit tests.
- [ ] Add build matrix tests.
  - [ ] Make `server:dev` run directly from source by adding a Vite dev-server middleware (if feasible).
- [ ] Automate linting and test execution.
  - [ ] Git Hooks
  - [ ] Github Actions
- [ ] Github Action for deployment
