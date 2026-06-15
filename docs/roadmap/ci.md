# CI Roadmap

- [ ] Add task to build e2e docker image with push to ghrc
- [ ] Add Github Actions for deployment

  In general with usefull caching and artifacts.

  #### Jobs (draft):
  - install dependencies to then run: lint, typecheck, (unit tests) and cache the dependencies for the next steps
  - build app-worker bundle and store it as artifact
  - build app-worker docker image and push it to ghrc
  - build app-server docker image and push it to ghrc
  - build e2e docker image and push it to ghrc
  - run e2e test via docker compose
    - upload screenshots / HTML report / traces as artifacts
  - wait for deployment approval
  - deploy
    - disable CF cache
    - clear CF cache for HTML and unhashed assets (robots.txt, favicon.ico)
    - deploy app-server to fly.io
    - deploy app-worker to CF
    - run e2e smoke tests against it
      - if passed:
        - enable CF cache
      - if failed:
        - rollback (tbd) to previous version
        - eventually run e2e tests against it
        - enable CF cache

- [ ] Eventually set Taskfile `output` mode for CI to 'group' ...
- [ ] Add A Testing Environment

  Right now there is no testing environment, so I should create one.

  The E2E tests should reply on a preset of data, which is defined in the code and deployed to the testing environment.

  That way those E2E tests that rely on data can later be run against the testing environment. This allows to check even closer to production. With this I could either only run a smaller suite against testing environment or to not run any E2E tests in CI but all tests on the testing environment.

- [ ] Green-Blue Deployment
  - [ ] ...
  - [ ] Add SSR warmup for CF

    Right now there is no caching of SSR pages on production-like environments cause CF will take care about caching anyways and such type of caches need to be implemented carefully.
