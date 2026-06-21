# Now

## Environment Variables

- [x] In general solid distinction between runtime and build time variables
- [ ] Simpler variable names, only prefixes where necessary in a defined manner.
  - [x] In full build process
  - [x] In app code

#### Current SSG rendering limits build/run quality

It would make sense to be able to change port, host and the list of allowed hosts through runtime variables, but at the moment the SSG rendering is done statically during build process only and it depends on host and port variables.

It's best practice to have as few build arguments as possible.

- [x] Remove SSG rendering from build process and instead implement it on a secure server route.

## Compose

- [ ] Finish basic docker compose setup after necessary variables (will skip app runtime variable solution) are finally ok, to have E2E building and running locally through compose

## CI

- [ ] Create github actions based CI in steps. Test it locally using `act`.
- [ ] Have a working basic version running.
- [ ] Feature: Automated CF cache clear
- [ ] Feature: Automatic rollback

## Code quality

- [ ] Make use of [@typescript-eslint/naming-convention](https://typescript-eslint.io/rules/naming-convention/#options) after finishing E2E (+ CI)
- [ ] Change package and folder names
- [ ] Change package folder structure

  Idea:

  ```
  - ./frontends/app
  - ./frontends/backoffice
  - ./libs/app/hono
  - ./libs/app/shared
  - ./libs/backoffice/shared
  - ./libs/tsconfig
  - ./services/reliability/e2e
  - ./maintainance/automations/package-updates
  - ./services/authenication/keycloak
  - ./services/infrastructure/app-server
  - ./services/infrastructure/app-worker
  - ./services/infrastructure/backend
  ```

- [ ] Add prek
- [ ] env.ts:
  - [x] move schemas into a env.schema.ts file
  - [x] move secrets into a env.secrets.ts file
    - [ ] map secret env keys to header names
    - [ ] create reusable validation function on top and use it in ssg render- & health check handler

## DX

- [ ] Docker compose profiles for development

## Docs

- [ ] Update / Cleanup docs
- [ ] Go to the beach
