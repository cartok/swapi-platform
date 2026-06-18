# E2E Roadmap

- [ ] Better solution for `E2E worker limit`, `SSR worker limit`, `SSR worker pool config` and `E2E timeouts` depending on environment (local, CI, test/prod) & extra configuration / personal environment variable overrides of `E2E worker limit` and `SSR worker limit` for local development.
- [ ] Improve the projects solution
- [ ] Better solution for responsive UI testing:
  - [ ] good solution for page level bucket-breakpoints
  - [x] market target device resolutions
    - [ ] differentiate between portrait and landscape (only portrait tested rn)

---

- [ ] Make wcag22aa compliant

---

- [ ] Better solution for server port override
- [ ] Create issue / fix for playwright axe that the type of `Result.NodeResult[]['target'] -> UnlabeledFrameSelector` will be `undefined`, if `options.selectors` is set to `false`. Type is defined in `axe-core` tho.

---

- [ ] Fixture for screenshot tests: always mask `<app-image>`
- [ ] `.spec.ts -> .(unit|int|e2e).ts`
- [ ] Further improve test coverage: Feature tests for pages other than home page; Component tests

---

- [x] Finish coarse test coverage
- [ ] Compose: Local | Hook | CI
- [ ] Maybe extra Dev-Mode flags: `--only-changed --no-deps --last-failed --ignore-snapshots`
