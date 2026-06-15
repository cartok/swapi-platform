# Developer Experience (DX) Roadmap

- [ ] Update the VS Code launch configuration for debugging.

---

## Direnv

- [ ] Make `swapi-workspaces` script run in any directory, currently path resolution issue on package.json
- [ ] Handle situation where user has alias for `task`
- [ ] Finish configuration in general

---

- [ ] Use zsh only for interactive things, otherwise if possible dash and if neccessary bash
- [ ] No unified sourcemap values, just define one env var per bundling tool (vite, rolldown, babel)
- [x] Cleanup app paths code a bit further & Check `/<path>` references and eventually use the constants + Two formats per path: one with and one without slash. (last part not done on purpose)
- [ ] Logging wrapper

---

- [ ] Git Hooks for linting, testing
- [x] Fix at least in the server project: Files that were build and then deleted (the sources) are not discovered as deleted, cause TS resolves to the built .js files.
- [ ] Taskfile: re-check `sources`, `generates`, `preconditions`
- [ ] Taskfile: `vars` prefixen, weil als default erstmal env vars genommen werden statt `| default "<value>"`

---

- [ ] Not 100% happy with the env solutions. Recheck once E2E via compose + CI is in.
- [ ] Logging with log levels to remove noise for example in E2E tests.

---

- [ ] Linting & if possible auto fixing of package.json
- [ ] AI-powered git hook(s)

---

## Docker

- [ ] Add set of maintainance aliases / functions:

  ```shell
  du -h -d1 <path> | sort -h
  ...
  ```

- [ ] Maybe `lf`
- [ ] Maybe add copy of my zsh env or just fish

---

- [ ] Tally: Create github issue about show-checks not working if image name/definition uses variables.
- [ ] Tally: Create github issue to ask for config json schema / create one

---

- [x] Move server docker file to server package
- [x] Move server task of root file to server package
- [x] Dockerfile formatting & linting
- [ ] Make use of [@typescript-eslint/naming-convention](https://typescript-eslint.io/rules/naming-convention/#options) after finishing E2E (+ CI)
- [ ] Make use of `buildx bake`, at least for the tool & runtime version variables and the cache ids (CID)
