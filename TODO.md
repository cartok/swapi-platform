# Demnächst

- TODO: @defer statt IntersectionObserver directive
- TODO: Incremental Hydration
- TODO: Github Pages CSR fixen
- TODO: Update readme & move to new Repository

---

- TODO: SVG Sprite Sheet generation: Lösung zur automatisierten Generierung und Verwendung von SVG Spritesheet(s) mit guter DX. Dafür evtl. `jannicz/ng-svg-icon-sprite` oder `ngneat/svg-icon` verwenden.

---

- TODO: Image Fallback
- TODO: Page-Global CSS Cursor + use during image slider drag
- TODO: Link List Component fertigstellen

---

- TODO: a11y

---

- TODO: Fix Unit Tests, add browser API mocks, extend some tests
- TODO: Automated a11y Testing
- TODO: E2E Tests
- TODO: Git hooks (clone & push)
- TODO: Cookie based client side feature detection for Firefox & Safari

# Später

- HOSTING & DEPLOYMENT
- ROBUST AUTOMATED TESTING
- MONITORING, ALERTING, LOGGIN

## Optional

- TODO: Ggf. Angular App Shell ausprobieren
- TODO: Create vite plugin for 'vite-plugin-angular-in-monorepo' with automatic resolution
- TODO: Verbessern der Taskfile `generates` / `sources`
- TODO: Verbessern der DeviceService API
-

## Weitere Ideen

- NEUE IDEE FÜR DATEN INCL. GRAPHQL IN QUARKUS BACKEND
- AUTH PER KEYCLOAK
- KI-FEATURE

---

- OFFLINE CACHING
- TAB COMMUNICATION
- TRACKING

### Hosting

Grobe Richtung:

1. Eine Kubernetes Variante (Plattform: Fly.io oder Cloudflare Containers)
   - Sehr gut vollständig automatisiert testbar: Lokal (Docker/compose/k3s) ^= CI ^= Prod
   - Monitoring, Logging, Alerting braucht mehr Arbeit, ist dann aber klarer und flexibler
   - Ich könnte mit Quarkus Microservices arbeiten z. B. als BFF für API, die Auth. benötig, für OCID, für die Device Detection Story.
   - Alles Mögliche
2. Eine Serverless Function Variante (Plattform: Vercel oder Netlify)
   - Minimalistischer
