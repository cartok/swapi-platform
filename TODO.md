# Demnächst

- TODO: tasks: getrennte dist pfade (für output mode & ggf. zusätzlich target)
- TODO: Dockerfile + Dockerfile.bundle, oder ähnliches, damit auch non bundling später testbar ist

---

- TODO: folder renaming: env -> .env
- TODO: Hosting bei Fly.io oder Cloudflare Containers vorbereiten
- TODO: Deployment per Github Actions konfigurieren und Docker build erweitern (env vars, build modes & targets)

---

- TODO: Fix Unit Tests, add browser API mocks, extend some tests
- TODO: Linting und unit tests in build pipeline einbauen

---

- TODO: a11y improvements
- TODO: Warnings (browser console) untersuchen: NgOptimizedImage aspect ratio (slider images), unused preloaded resources

---

- TODO: E2E Tests
- TODO: Automated a11y Testing
- TODO: Integration Tests
- TODO: Git hooks (`push`, evtl.: `clone`, `commit`)

# Später

- TODO: express ersetzen
- TODO: Server build ist nicht JIT free, gucken dass ich Angular-Linker-Schritt einbaue oder ng statt rolldown zum bauen verwende.
- TODO: Angular App Shell ausprobieren
- TODO: Create vite plugin for 'vite-plugin-angular-in-monorepo' with automatic resolution
- TODO: Verbessern der DeviceService API
- TODO: i18n
- TODO: Web Vitals gegen checken
- TODO: SEO gegen checken und mal etwas structured data einbauen
- TODO: Cookie based client side feature detection for Firefox & Safari

---

- TODO: tasks: server dev|prod flow weiter verbessern (watch)
- TODO: tasks: vscode launch config updaten für debugging workflow
- TODO: tasks: evtl. vscode tasks welche taskfile tasks ausführen für standard und komplexe Workflows, vorher noch mal taskfile extension ausprobieren

---

- TODO: SVG Sprite Sheet generation: Lösung zur automatisierten Generierung und Verwendung von SVG Spritesheet(s) mit guter DX. Dafür evtl. `jannicz/ng-svg-icon-sprite` oder `ngneat/svg-icon` verwenden.
- TODO: Image Fallback
- TODO: Page-Global CSS Cursor + use during image slider drag
- TODO: Link List Component fertigstellen

---

- TODO: Logging
- TODO: Monitoring
- TODO: Alerting

---

### Hosting

Grobe Richtung:

1. Eine Kubernetes Variante (Plattform: Fly.io oder Cloudflare Containers)
   - Sehr gut vollständig automatisiert testbar: Lokal (Docker/compose/k3s) ^= CI ^= Prod
   - Monitoring, Logging, Alerting braucht mehr Arbeit, ist dann aber klarer und flexibler
   - Ich könnte mit Quarkus Microservices arbeiten z. B. als BFF für API, die Auth. benötig, für OCID, für die Device Detection Story.
   - Alles Mögliche
2. Eine Serverless Function Variante (Plattform: Vercel oder Netlify)
   - Minimalistischer

### Weitere Ideen

- TODO: Neue Idee für Datengrundlage, ggf. Daten in eigenes Quarkus backend migrieren, säubern, GraphQL, Bilder. Ansonsten etwas anderes ausdenken. Zudem sollte user authentication eine Rolle spielen, so dass ich Keycloak per Quarkus Microservice einbauen kann.
- TODO: Irgend ein KI-Feature überlegen und einbauen.
- TODO: Falls das mit der Fallback device detection gut geworden ist für die Kubernetes Version des deployments möglichst alle Kommunikation in einen Quarkus Microservice oder anders performant / per best practices einbauen.
