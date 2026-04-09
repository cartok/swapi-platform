# Device Context

## Topics / Decisions

### Why should breakpoints be defined in a generic data format (JSON/YAML)?

> Because this allows cleaner separation between the SSR server and frontend. In production this could become something other than the current Node server.

### On vanilla-extract vs PostCSS | Lightning CSS in the context of CSS media queries

> **Update:** I now use Lightning CSS instead of PostCSS and avoid CSS-in-JS via vanilla-extract, because it introduces more complexity and a higher entry barrier for developers not familiar with vanilla-extract-css. The goal is to build a highly performant, clean, **simple**, and secure template project. The analysis below is therefore outdated.

First, why generate anything at all?

- Breakpoints should be type-safe when used in JavaScript via `DeviceService`.
- Breakpoints should not be defined in two places (CSS and JavaScript).

#### vanilla-extract

##### Pros

- Both CSS and JavaScript would be type-safe.
- Clean autocomplete for values like breakpoints, without special tooling.

##### Cons

- `ng update|(add)`: integration would require giving up Angular version updates through Angular CLI in the standard way; see: https://angular.dev/ecosystem/custom-build-pipeline#what-are-the-options
- Additional `<component>.css.ts` files unless the structure is broken by putting CSS-in-JS directly into `<component>.ts` component classes. This usually leads to editing `<component>.css.ts`, `<component>.css`, and `<component>.html` in parallel, which argues for replacing CSS entirely.
- More complexity.

#### PostCSS

##### Pros

- `ng update|(add)`: fundamentally possible without ejecting (`@analogjs/vite-plugin-angular`).
  - This would still be acceptable even without automatic rebuilds after changes to the breakpoint source file.
- Styles can remain close to components, as before.

##### Cons

- At least in VSCode, there is no solid PostCSS plugin. You lose autocomplete for media queries and must allow unknown `@` rules in project `settings.json`.
- By default, CSS has no linting for whether referenced tokens/variables actually exist. For example, after removing a breakpoint, no linter warning is raised if the old one is still used.
- ~~Media query tokens cannot be combined with other queries. This would require generating tokens for all possible media query combinations as a Cartesian product, which is unrealistic. At that point, dropping `custom-media` and even PostCSS entirely could be better, but then there is no single source of truth for breakpoints. This clearly needed a different preprocessor or CSS-in-JS.~~
  I likely tested this incorrectly. `@custom-media` tokens can be combined, probably just not with each other in all forms. With standard `@media`, combinations like `@media (--foo) and (--bar) {}` work.

### Determining the Device Context

#### Low-entropy headers

Sent directly by the browser unless blocked.
https://wicg.github.io/client-hints-infrastructure/#low-entropy-hint-table

**Selection:**

- `Sec-CH-UA-Mobile`: `?1|?0`
  Refers to device form factor rather than browser capabilities, but does not distinguish mobile and tablet. Therefore `?0` can also be a tablet.

#### High-entropy headers

Can be requested by the server via `Accept-CH` and are then sent on subsequent requests, unless blocked.

**Selection:**

- `Sec-CH-Form-Factors`: "Desktop", "Automotive", "Mobile", "Tablet", "XR", "EInk", "Watch"
  Support is not broad, but when available it is useful, especially to distinguish tablets.
- `Sec-CH-Viewport-Width`
- `Sec-CH-Viewport-Height`

#### Fallbacks

Client-side detection with minimal payload and redirect after `POST /device-cookie` via `303`.

- `Sec-CH-UA-Mobile`: `(pointer: fine) AND (hover: hover)`
- `Sec-CH-Viewport-Width`: `window.innerWidth`
- `Sec-CH-Viewport-Height`: `window.innerHeight`

#### General Additions

| pointer | hover | Device type      |
| ------- | ----- | ---------------- |
| fine    | hover | Desktop / Laptop |
| coarse  | none  | Smartphone       |
| coarse  | hover | rare (hybrid)    |

**Eventually usable Media Queries:**

- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/height
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/width
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/aspect-ratio
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/orientation
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/resolution
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/pointer
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/any-pointer
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/display-mode
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/hover

### SSG, SSR, CSR Variant Page Routing

Decision: use prefix routes.
