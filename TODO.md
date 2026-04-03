# Demnächst

- TODO: @defer statt IntersectionObserver directive
- TODO: Incremental Hydration

---

- TODO: Github Pages CSR fixen
- TODO: Update readme & move to new Repository

---

- TODO: Verschiedene ports für server in development | production mode
- TODO: Frontend ports per env setzen
- TODO: Server start sollte dist verwenden und per default production output mode wählen
- TODO: vscode launch config updaten für debugging workflow
- TODO: evtl. vscode tasks welche taskfile tasks ausführen für standard und komplexe Workflows, vorher noch mal taskfile extension ausprobieren
- TODO: Dann noch mal readme updaten
- TODO: tsconfig.typecheck (stashed)
- TODO: Warnings (browser console) untersuchen: NgOptimizedImage aspect ratio (slider images), unused preloaded resources

---

- TODO: SVG Sprite Sheet generation: Lösung zur automatisierten Generierung und Verwendung von SVG Spritesheet(s) mit guter DX. Dafür evtl. `jannicz/ng-svg-icon-sprite` oder `ngneat/svg-icon` verwenden.

---

- TODO: Image Fallback
- TODO: Page-Global CSS Cursor + use during image slider drag
- TODO: Link List Component fertigstellen

---

- TODO: a11y
- TODO: Automated a11y Testing

---

- TODO: Fix Unit Tests, add browser API mocks, extend some tests
- TODO: E2E Tests
- TODO: Integration Tests
- TODO: Git hooks (`push`, evtl.: `clone`, `commit`)

---

- TODO: Cookie based client side feature detection for Firefox & Safari

# Später

- TODO: Hosting & Deployment
- TODO: Logging
- TODO: Monitoring

---

- TODO: Angular App Shell ausprobieren
- TODO: Create vite plugin for 'vite-plugin-angular-in-monorepo' with automatic resolution
- TODO: Verbessern der Taskfile `generates` / `sources`
- TODO: Verbessern der DeviceService API
- TODO: Alerting

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
