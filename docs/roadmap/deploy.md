# Deployment Roadmap

- [x] Add a top level SSR smoke test
  - [x] Make SSR smoke test skip device detection
- [x] Add a top-level health check that reports:
  - [x] Exceptions catched in Hono and add that information to the health status
  - [x] Unhandled promise rejectsion catched in the main process
- [x] Simplify the /status/ready check
- [x] Add a service level health check for the SWAPI API
- [ ] Add a service level health check for the images
- [ ] Versioning of docker images

---

- [ ] Improve the deployment task:
  - First check if the SSR Smoke Test (once fixed) auto-starts a suspended/stopped machine.
  - Then, before deploying via `fly deploy`:
    - Read the name of the app by reading the `app` field of the fly config that is used in the deployment task.
    - Use the name of the app to aquire the list of machines for that app via `fly machine list --app <name> --json`.
    - Check if there is any machine running (started)
      - If not, run `fly machine start --app <machine-id>`, `flyctl checks list --app <name>`
      - Else only run `flyctl checks list --app <name>`
- [x] When deploying with --local-only, the image size is x3 bigger.

---

- [ ] Github Action for linting, testing
- [ ] Github Action for deployment

---

- [ ] Add external
  - [ ] Monitoring
  - [ ] Alerting
  - [ ] Logging
