# Deployment Roadmap

- [ ] Make SSR smoke test skip device detection. Then create a top-level health check for SSR health check instead of having it in the process startup pipeline.
- [ ] Add a top-level health check that reports:
  - [ ] Exceptions catched in Hono and add that information to the health status
  - [ ] Unhandled promise rejectsion catched in the main process
  - [ ] Remove the /status/ready check

---

- [ ] Improve the deployment task:
  - First check if the SSR Smoke Test (once fixed) auto-starts a suspended/stopped machine.
  - Then, before deploying via `fly deploy`:
    - Read the name of the app by reading the `app` field of the fly config that is used in the deployment task.
    - Use the name of the app to aquire the list of machines for that app via `fly machine list --app <name> --json`.
    - Check if there is any machine running (started)
      - If not, run `fly machine start --app <machine-id>`, `flyctl checks list --app <name>`
      - Else only run `flyctl checks list --app <name>`

---

- [ ] Github Action for linting, testing
- [ ] Github Action for deployment

---

- [ ] Add external
  - [ ] Monitoring
  - [ ] Alerting
  - [ ] Logging
