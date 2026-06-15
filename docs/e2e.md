# E2E Test Architecture

## Purpose

This document defines the intended E2E test architecture for the project. It is meant to be used as long-term project documentation and as a shared reference for future implementation work.

The goal is not to create the simplest possible Playwright setup, but a maintainable architecture with clear responsibilities, explicit naming, and room for future growth.

## Running Tests Locally

Generally:

Local E2E runs are identified with the project-wide `SWAPI_LOCAL_E2E` environment variable. The variable is part of `@swapi/shared/environment/env` through `CommonEnvSchema`, so the E2E package, client, and server can all read the same signal with the same default value.

`SWAPI_LOCAL_E2E` intentionally describes the test harness, not the deployment target. `SWAPI_TARGET_ENVIRONMENT == 'local' && !CI` only says that the app runs in a local target outside CI; it does not say that Playwright is currently driving the app. A normal local development server, a local manual smoke check, and a local E2E run can all use the same target but need different operational behavior.

Current responsibilities:

- Playwright uses `SWAPI_LOCAL_E2E` to decide whether it should start the local app server through `webServer`.
- The E2E package uses it to select the local project set.
- The server uses it for E2E-specific operational tuning, for example the SSR worker-pool configuration used during local Playwright runs.

Future uses should stay operational and test-harness focused. Good candidates are deterministic diagnostics, E2E-only test routes, reduced logging noise, faster local resource settings, and fixtures that make failures easier to inspect. It should not be used to change the user-visible behavior being tested unless that behavior is explicitly the subject of the test.

Git hooks:

- pre-commit
  - Eventually smoke tests, otherwise none.
- pre-push
  - Smoke tests, if not in pre-commit
  - No broader E2E suite until the runtime architecture and local workflow are stable.

## Core Principles

1. **Test structure follows runtime responsibility.**  
   E2E tests should primarily be organized by user-visible behavior and runtime responsibility, not by mirroring the frontend source tree one-to-one.

2. **Specialized test types should be explicit.**  
   Different test types should use explicit filename markers, so that they are easy to locate, filter, and run independently.

3. **Smoke tests are minimal operational checks.**  
   Smoke tests should verify that important runtime paths work at a basic level. They should not become full feature tests.

4. **Page tests should focus on page-specific content and behavior.**  
   Shared application shell behavior should be tested centrally instead of being repeated in every page test.

5. **Expensive or broad checks should be scoped carefully.**  
   Axe scans, screenshots, and ARIA snapshots should generally avoid repeatedly testing the same app-shell content across every page unless there is a specific page-dependent reason.

6. **Reusable complex components can later receive dedicated E2E harness tests.**  
   Complex components such as image sliders should be tested in controlled harness routes rather than fully retested on every page that uses them.

## Playwright Extensions

All E2E tests should import `test` and `expect` from `#internal/extensions/index`, not directly from `@playwright/test`. The extension entry point provides the shared Playwright API for this package and keeps custom fixtures, matchers, and presets behind one stable import.

The extension layer currently covers two responsibilities:

- Accessibility helpers for Axe scans and readable accessibility failure output.
- Optional runtime monitoring for browser console output, page exceptions, failed requests, and unexpected HTTP responses.

Monitoring should remain opt-in per file or per test through presets or explicit fixture configuration. This keeps simple tests lightweight, while smoke tests and broad page tests can enable stricter diagnostics consistently.

The internal file structure under `packages/e2e/src/extensions` may change over time. The important contract is the public test API and the separation of concerns: tests consume stable helpers, while implementation details stay inside the extension layer.

## Test Filename Conventions

Use filename markers as orthogonal dimensions.

File naming pattern: `<subject>.<label>[.<flag>].spec.ts`

- Labels: `spec`, `axe`, `aria-snapshot`, `screenshot`, `request`
- Flags: `smoke`

Do not introduce additional markers such as `.feature`, `.flow`, `.navigation`, or `.interaction` unless a real need appears later. Normal feature tests should remain simple.

| Extension                | Meaning                                           |
| ------------------------ | ------------------------------------------------- |
| \*.spec.ts               | Normal feature / user interaction tests           |
| \*.smoke.spec.ts         | Minimal operational checks                        |
| \*.request.spec.ts       | Request/response-level tests                      |
| \*.request.smoke.spec.ts | Request/response-level smoke checks               |
| \*.axe.spec.ts           | Axe accessibility rule tests                      |
| \*.aria-snapshot.spec.ts | Accessibility tree / semantic structure snapshots |
| \*.screenshot.spec.ts    | Visual regression screenshot tests                |

## Test Directory Structure

```txt
tests/
  browser/
    app-shell/
      app-shell.smoke.spec.ts
      app-shell.spec.ts
      app-shell.axe.spec.ts
      app-shell.aria-snapshot.spec.ts
      app-shell.screenshot.spec.ts

    components/
      <component>.<label>.spec.ts

    layouts/
      <layout>.screenshot.spec.ts
      <layout>.aria-snapshot.spec.ts

    pages/
      home/
        <page>.smoke.spec.ts
        <page>.spec.ts
        <page>.axe.spec.ts
        <page>.aria-snapshot.spec.ts
        <page>.screenshot.spec.ts

      ... more pages ...

  request/
    <topic>.request.smoke.spec.ts
    <topic>.request.spec.ts
```

## Test Type Responsibilities

### Smoke Tests

Smoke tests answer:

```txt
Is this important runtime path basically working?
```

They should stay small and fast.

Relevant smoke areas for this project:

- App shell loads
- A representative SSG page loads
- A representative SSR page renders
- Device redirects work without loops
- Basic hydration does not crash
- Important request-level render modes return expected responses

Smoke tests should not check:

- All page variants
- All feature flows
- Full visual regression
- Full Axe coverage
- Complex edge cases
- Exhaustive breakpoint matrices

### Normal Feature Tests

Normal `*.spec.ts` files test user-visible behavior and interaction.

Examples:

- User can navigate between relevant pages
- User can interact with page-specific controls
- Page-specific state changes behave correctly
- Content from the current page is rendered as expected

Feature tests may contain small ARIA snapshots when the snapshot directly describes the state created by the user interaction.

When a subject also has an ARIA snapshot test, keep normal feature tests focused on
concrete behavior and contract details such as destinations, exact static copy,
attributes, state changes, and interaction results. Avoid duplicating broad
semantic structure that is already covered by the ARIA snapshot.

### Request Tests

Request tests use request-level checks where possible. Most request tests in this
project exercise HTTP behavior, but the test type is named after the testing
surface instead of the protocol.

Good candidates:

- Redirect behavior
- Redirect loop prevention
- Render-mode behavior
- Status codes
- Response headers
- Initial HTML checks
- SSR vs SSG delivery checks

Use `request` where a real browser page is not needed. This keeps request tests faster and more focused.

### Axe Tests

Axe tests should stay separate from ARIA snapshot tests. They are useful for detecting problems such as:

- Missing labels
- Invalid ARIA attributes
- Color contrast issues
- Duplicate IDs
- Structural accessibility violations

### ARIA Snapshot Tests

ARIA snapshot tests validate semantic structure and accessibility tree output.

Use them for:

- Page main-content semantic structure
- Landmark structure
- Heading hierarchy
- Navigation semantics
- Dialog/form/list/card semantics
- Important states after interaction

Avoid large whole-page ARIA snapshots as a default. Prefer scoped snapshots on `main`, `navigation`, dialogs, forms, lists, or stable regions.

ARIA snapshots should primarily validate the accessibility tree shape: landmarks,
roles, heading hierarchy, navigation semantics, and important state semantics. Keep
copy and implementation details as loose as the behavior allows. Exact text is
appropriate when it is part of the semantic contract, such as navigation link
names. Attributes and static business copy that are already checked in normal
feature tests should usually be omitted or matched with regexes here.

### Screenshot Tests

Screenshot tests validate visual regression.

Avoid full-page screenshots everywhere. Prefer scoped screenshots for:

- App shell
- Main content
- Complex layouts
- Component states
- Mobile menu states
- Important visual regions

Full-page screenshots can be useful on a small number of representative pages, but should not be the default for every page.

## App Shell

The project frontend has a `blocks` folder containing header and footer components. These components form the app shell in the application entry point.

Recommended app-shell files:

```txt
app-shell.smoke.spec.ts
app-shell.spec.ts
app-shell.axe.spec.ts
app-shell.aria-snapshot.spec.ts
app-shell.screenshot.spec.ts
```

The app-shell tests are responsible for:

- Header rendering
- Footer rendering
- Main navigation
- Mobile navigation
- Shell-level landmarks
- Shell-level Axe checks
- Shell-level screenshots

## Page Test Scope

Page tests should primarily focus on the page-specific content area.

For page-level Axe, ARIA snapshot, and screenshot tests, prefer testing the `main`/content region instead of the whole page.

Reason:

- The app shell is already tested centrally.
- Repeated header/footer checks create duplicate failures.
- Header/footer screenshot diffs would otherwise affect many page screenshots.
- Axe violations in shared shell regions would be reported repeatedly.

Page-level focus:

| File                         | Scope                                  |
| ---------------------------- | -------------------------------------- |
| `home.axe.spec.ts`           | `main` or page-content region only     |
| `home.aria-snapshot.spec.ts` | `main` or page-content region only     |
| `home.screenshot.spec.ts`    | `main` or another relevant page region |
| `home.spec.ts`               | Page-specific content and interactions |

Page tests may still check shell-related page effects when the page changes shell state.

Examples:

- Active navigation item
- Breadcrumb state
- Header title
- Route-dependent shell variant
- Footer context

If the shell is mostly static, these checks can be kept minimal.

## Layout Tests

Test layouts separately only when they contain meaningful reusable layout responsibility.

If viewport-based page screenshots already cover the layout sufficiently, dedicated layout tests can be introduced later.

Do test separately:

- Complex detail-page layout
- Reusable responsive grid layout
- Master-detail layout
- Sidebar/content layout
- Layouts with complex responsive behavior
- Layouts used across several pages where failures should be localized

Do not test separately:

- Thin default wrappers
- Simple container components
- Layouts already sufficiently covered by page screenshots

For this project:

- The default layout does not need dedicated tests.
- The complex detail-page layout can receive dedicated screenshot and/or ARIA snapshot tests.

## Playwright Projects

Playwright projects should primarily partition tests through `testDir`, `testMatch`, and `testIgnore`. Tags are still useful, but they should be a secondary filter for local workflows and Playwright UI navigation.

The file split carries architectural meaning:

- `testDir` separates runtime domains such as browser tests and request-level tests.
- `testMatch` selects explicit filename markers such as `.smoke`, `.axe`, `.aria-snapshot`, `.screenshot`, and `.request`.
- `testIgnore` keeps the broad feature project from accidentally running specialized tests that also end in `.spec.ts`.

This is preferable to relying only on `grep` and `grepInvert`. Tags filter individual tests, but they do not make the file-level responsibility obvious and they are a weaker fit for project-level runtime tuning. Screenshot and Axe files are usually slower and can benefit from fully parallel execution. Normal feature files and small ARIA snapshot files are often much faster; running many small tests fully parallel can add overhead without improving feedback time. Keeping these concerns in separate files allows each project to choose the right browser channel, parallelism, timeout, and snapshot behavior.

Tests should still receive matching tags from `TAGS`. Tags make ad-hoc local runs easy, for example `--grep '@screenshot'`, and they improve discoverability in Playwright tooling. The source of truth for suite architecture remains the directory and filename convention.

Non-screenshot projects should use the faster Chromium headless-shell setup where possible. Screenshot projects should use full Chromium through `channel: 'chromium'` so visual snapshots are generated with the same rendering path each time.

Filtering:

Because normal feature tests use plain `*.spec.ts`, specialized test files must be excluded when running the general feature project.

Rationale:

- Smoke tests should fail early if the app is basically broken.
- Feature tests validate real user flows.
- Request tests validate server/routing/rendering behavior.
- Axe, ARIA snapshots, and screenshots are valuable but more specialized.
- ARIA snapshots should be tested before Axe in order to better differentiate between expected accessible structure and general accessibility violations.

E2E Test Order:

<!-- prettier-ignore -->
| Order | Test group | Browser/runtime | Notes |
| --- | --- | --- | --- |
| 1 | Smoke tests | Chromium headless shell | Fail early when the app is basically broken. |
| 2 | Feature tests | Chromium headless shell | Validate normal user-visible behavior. |
| 3 | Request tests | Request-level runtime | Validate server, routing, and render modes. |
| 4 | ARIA snapshot tests | Chromium headless shell | Validate expected accessible structure first. |
| 5 | Axe tests | Chromium headless shell | Validate accessibility rule compliance. |
| 6 | Screenshot tests | Chromium | Validate visual regression. |
| 7 | Cross-browser feature and screenshot tests | Firefox, WebKit | Later expansion for browser compatibility. |
| 8 | Multi-viewport/responsive screenshot tests | Chromium | Later expansion for responsive coverage. |

## For Later: Component E2E Tests

Dedicated component E2E tests are a future extension.

They are useful for complex reusable components where all behavior should be tested once in isolation-like conditions.

Good candidates:

- Image slider
- Complex navigation components
- Interactive cards
- Search/filter controls
- Dialogs
- Error/loading/empty state components
- Responsive UI components

The intended model:

- Component E2E tests:
  - test the component extensively with controlled inputs and states
- Page tests:
  - only verify that the component appears in the expected initial state
  - verify correct integration/data wiring when relevant

Example:

1. Image slider component test:
   - previous/next controls
   - keyboard interaction
   - swipe behavior
   - ARIA semantics
   - lazy-loading behavior
   - error states
   - responsive screenshots
2. Page test using image slider:
   - slider is present
   - initial slide/data is correct

Potential source structure:

- Client/Source:

  ```txt
  src/app/components/image-slider/
    image-slider.component.ts
    image-slider.e2e.ts
  ```

  The `*.e2e.ts` files are not Playwright test files. They are component render helpers used by dedicated E2E routes.

- E2E:

  ```txt
  tests/
    browser/
      components/
        image-slider/
          image-slider.component.ts
  ```

- Server:

  Handles SSG rendering and routing. Eventually a dedicated package could be better, than securing routes or deleting pluggable resources after success full testing (or rendering those pluggable only for E2E testing) - not sure yet.
