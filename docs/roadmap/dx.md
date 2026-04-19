# Developer Experience (DX) Roadmap

- [ ] Update the VS Code launch configuration for debugging.
- [ ] Add VS Code tasks that compose `Taskfile` tasks for advanced workflows.
- [ ] Make `server:dev` run directly from source by adding a Vite dev-server middleware (if feasible).
- [ ] Fix unit tests.
- [ ] Add end-to-end tests incl. axe a11y
- [ ] Add build tests.
- [ ] Automate linting and test execution.
- [ ] Eventually add bunfig.toml with `env = false` and eventually more
- [ ] Check repo init against clean environment
  - [ ] Check if vscode taskfile extension resolves the installed taskfile dependency
- [ ] No unified sourcemap values, just define one env var per bundling tool (vite, rolldown, babel)
