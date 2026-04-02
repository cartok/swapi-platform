# Angular Signals-based SWAPI Frontend

Live Demo (GitHub Pages, only CSR, currently broken):

- [https://cartok.github.io/assecor-assessment-frontend/](https://cartok.github.io/assecor-assessment-frontend/)

Frontend-Implementierung einer ehemaligen erfolgreichen Bewerbungsaufgabe.

- [UI Mockups / Design](https://xd.adobe.com/view/b3c98134-11a8-44c2-5dd2-477b8550307f-c5f8/)

## Aktueller Funktionsumfang

- SPA mit lazy geladenen Routen
- Seiten für `movies`, `movie/:id`, `characters`, `character/:id`, `planets`, `planet/:id`
- API-Integration für SWAPI-Ressourcen (Films, People, Planets)
- Robustes DTO-zu-Model-Mapping und Retry-Interception auf HTTP-Ebene
- Eigene UI-Bausteine und Layouts für Listen- und Detailseiten
- Device Feature Detection via Client Hints
- Saubere Trennung von SSR Server und App Code in erweiterbarer Monorepo Architektur

## Setup

Voraussetzungen:

- Node.js `24.14.1`
- Bun: per `bunx bun` einheitliche Version nutzbar
- Taskfile: per `bunx go-task` Version ohne cli completion nutzbar

Installation und Start:

```bash
bun i
# Frontend dev server
go-task client:dev
# Frontend dev server (production mode)
go-task client:start
# SSR + SSG server, incl. device detection
go-task server:dev
# SSR + SSG server, incl. device detection (production mode)
go-task server:start
```

App lokal:

- Frontend dev server: `http://localhost:4200`
- Frontend dev server (production mode): `http://localhost:4300`
- SSR + SSG server: `http://localhost:50000`

## Anfägliche Dokumentation

- [Technische Entscheidungen und Trade-offs](docs/entscheidungen.md)
- [SWAPI-Analyse, API-Probleme und Integrationsnotizen](docs/swapi.md)
