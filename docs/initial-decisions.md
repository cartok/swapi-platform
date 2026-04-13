# Technical Decisions

## Context

The implementation was intentionally iterative: first establish a reliable technical baseline, then deepen functional and non-functional aspects step by step.

Starting point for this task:

- No classic web frontend work with DOM/CSS since November 2024
- From February 2025 to August 2025, work focused mainly on React Native
- No permanently maintained one-size-fits-all frontend stack

The goal was therefore to make clear, defensible architecture decisions that quickly lead to a clean and extensible result.

## 1. Angular as the Framework

Why:

- Strong separation of concerns
- Mature and stable stack with clear conventions
- Good technical and domain fit for the challenge
- Since the API is public and requires no auth, no extra backend was needed for secret handling, so pure CSR was initially fine

Alternatives:

- Vue (+ Nuxt), especially interesting with Vapor
- Solid (+ SolidStart)
- React (+ Next/Remix)

Trade-off:

- Not the absolute top benchmark performer for rendering, but more than sufficient in this context

Status:

- Core architecture is stable

Next step:

- See README for the current roadmap

## 2. Angular CLI instead of Nx or Analog

Why:

- Lowest possible onboarding complexity
- Fast project start with minimal tooling friction

Alternatives:

- Nx
- Analog

Trade-off:

- Some tooling details had to be added manually

Status:

- Appropriate for this challenge context and stable from a DX perspective

Next step:

- No short-term change planned

## 3. State and rendering: Signals + Zoneless + CSR

Why:

- Signals provide direct, simple, and performant local state handling
- Zoneless reduces unnecessary change detection overhead
- CSR was the fastest and most practical starting point for this project phase

Alternatives:

- RxJS-centric state approach
- Add SSR/SSG/hybrid earlier

Trade-off:

- Without SSR, SEO and initial rendering are not maximized
- Route-specific prefetching remains limited without additional infrastructure

Status:

- Architecture works well and intentionally stays simple

Next step:

- Re-evaluate SSR/hybrid options later after all core requirements are complete

## 4. Native CSS instead of Tailwind/SCSS

Why:

- Focus on simplicity and readability
- Modern CSS features are largely sufficient for the current scope
- Avoids extra tooling complexity in an early project phase

Alternatives:

- Tailwind
- SCSS
- PostCSS

Trade-off:

- A preprocessing layer would help for media query organization and specific compatibility details
- Provided mockups were sufficient, but some spacing fine-tuning required manual approximation in the existing inspect workflow

Status:

- Works for the current scope, but with clear limits

Next step:

- See README for current follow-up steps

## 5. SVG asset strategy with a manually maintained sprite sheet

Why:

- SVG sprites are flexible, cacheable, and technically clean
- For this scope, a manual sprite sheet was faster than introducing additional build tooling

Alternatives:

- `jannicz/ng-svg-icon-sprite`
- `ngneat/svg-icon`

Trade-off:

- Less automation and slightly worse developer experience

Status:

- Sufficient for the current scope

Next step:

- If the project continues: introduce automated sprite generation

## 6. Store strategy: Signals and simple singleton services

Why:

- API domain and scope are manageable
- Direct, easy-to-maintain solution without additional store abstraction

Alternative:

- `@ngrx/signals`

Trade-off:

- A formal store could become beneficial if complexity grows significantly

Status:

- Fits the current scope

Next step:

- Reevaluate only when complexity clearly increases

## 7. Testing approach

Current status:

- Unit test coverage is currently limited

Rationale:

- For the scope of this application challenge, focus was on architecture, functionality, and a clean integration baseline
- A large unit-test volume would have been disproportionate at this stage

Planned approach:

- Targeted unit tests for isolated, critical logic with clear inputs/outputs
- E2E tests for critical user flows (navigation, core use cases)
- No redundant assertions across multiple testing layers
- Complement with integration, deployment, and when needed contract tests, in pragmatic scope

## 8. Accessibility strategy and open items

Current status:

- Accessibility is partly implemented, but not yet complete
- Functional and non-functional gaps remain across multiple components

Prioritized follow-up:

1. Manually validate and fix keyboard navigation and focus behavior
2. Systematically refine semantics, ARIA attributes, and textual metadata
3. Extend with manual checks via browser tools/plugins
4. Then add automated accessibility checks to the E2E pipeline

Note:

- SWAPI-specific integration risks and data issues are documented separately in [swapi.md](./swapi.md).
