# Roadmap and Final Architecture Direction

This project is intended to become a strong full-stack portfolio example. 

My goal is not to build the most complex system possible for its own sake. The goal is to build a technically strong, modern, performance-conscious, cost-aware system that demonstrates good architectural judgment across frontend, edge, backend, infrastructure, and operations.

## Core goals

This project should demonstrate:

- strong frontend engineering with Angular
- SSR and SSG experience
- edge-aware delivery and request routing
- backend engineering beyond frontend-only work
- modern Java backend skills via Quarkus / Jakarta-based APIs
- cloud and infrastructure thinking
- practical observability and monitoring
- cost-conscious architectural decision-making
- the ability to evolve a system incrementally instead of overengineering it from day one

## Architectural principles

I want the architecture to be:

- modern, but still realistic
- high-performance where it matters
- cheap enough to operate as a portfolio system
- explainable and well-structured
- incremental and maintainable
- strong enough to impress technically, but not bloated with unnecessary microservices

A key principle for this project is:

> prefer a strong and coherent core architecture over premature service fragmentation

That means I do **not** want to split everything into many microservices too early. I would rather build a smaller number of clearly justified components and evolve from there.

---

# Final target stack

## Frontend
- **Angular**
- SSR + SSG hybrid rendering
- focus on modern Angular patterns
- performance-conscious rendering strategy
- strong typing, maintainability, and clean architecture

The frontend remains the visible core of the project and the main entry point for demonstrating UI engineering, SSR/SSG, rendering strategy, and performance thinking.

## Edge and delivery layer
- **Cloudflare**
  - DNS
  - CDN
  - WAF
  - caching
  - routing rules
- **Cloudflare Workers**
  - device detection + redirect worker
  - asset / static / SSG response worker
  - possibly additional edge logic later where justified

This layer is important because it shows that I do not treat the frontend as just a client bundle. I want to demonstrate that I understand delivery architecture, caching strategy, and request steering at the edge.

## SSR / web application server
- **Hono**
- initially still usable in a container setup
- long-term direction: run SSR-related logic as close to the edge as possible where it is practical

This part acts as the web application layer that connects Angular rendering concerns with edge and backend concerns.

## Core backend
- **Quarkus**
- one main backend service
- REST API
- data access
- business logic
- auth integration
- future extension points for additional API capabilities

I currently see Quarkus as the best backend direction for this project because it helps me demonstrate:

- modern Java backend development
- Jakarta / Java-EE-adjacent backend knowledge
- performance and cloud-native thinking
- a more differentiated backend stack than default Spring Boot

Rust is still interesting to me, especially for edge and performance-heavy areas, but for the main portfolio backend I currently consider Quarkus the more market-relevant choice.

## Database
- **PostgreSQL**
- likely via a cost-efficient hosted option first
- structured relational data model
- realistic backend persistence layer
- room for migrations, indexing, query optimization, and performance tuning

## Storage / assets / backups
- **Cloudflare R2**
- media / assets
- exports
- backups
- object storage use cases

## Async processing
- optional later stage:
  - queue-based background processing
  - AI-related or import/export related tasks
  - event-based internal workflows where useful

This should only be introduced when there is a real use case.

## Auth
Authentication and authorization are important, but I do not want to introduce unnecessary infrastructure burden too early.

Current direction:
- start with a pragmatic auth approach
- keep room for stronger identity integration later
- evaluate Keycloak-related architecture only when it creates real value for the portfolio

I do find a Quarkus + Keycloak-related direction interesting, but I do **not** want to force a heavy self-hosted auth stack too early if it mostly increases complexity and cost.

## Observability
- **Sentry first**
  - exceptions
  - alerts
  - tracing / basic APM
- later optionally:
  - **Grafana**
  - broader metrics / logs / traces / dashboards as needed

My current plan is to start pragmatic:
- keep platform/server basics visible through existing hosting metrics
- add Sentry for application-level observability
- expand only when needed

## Infrastructure and operations
- **Terraform**
- **Docker Compose**
- **Kubernetes later only if justified**

### Terraform
Terraform is the long-term infrastructure-as-code layer.

I want to use it for:
- Cloudflare configuration
- routing-related edge configuration
- DNS
- infrastructure resources
- later potentially monitoring-related configuration
- generally keeping important platform configuration versioned in code

### Docker Compose
Docker Compose is the practical local and early deployment tool.

I want to use it for:
- local development
- local integration testing
- simple multi-service environments
- potentially early VPS deployment stages

### Kubernetes
Kubernetes is not an early priority.

I am interested in it, but I do not want to introduce it just for keyword value. I only want to adopt it later if:
- the architecture actually benefits from it
- I want to explicitly demonstrate cluster-oriented operations
- the extra complexity is justified

---

# Component responsibilities

## 1. Angular frontend
Responsible for:
- UI
- routing
- rendering experience
- frontend state and interaction
- consuming backend APIs
- SSR/SSG-compatible application structure

## 2. Device detection + redirect worker
Responsible for:
- request inspection
- device-related logic
- redirect or canonicalization strategy
- helping improve delivery strategy for rendering variants

This is a very interesting architectural showcase piece because it demonstrates performance-minded delivery and edge-based request handling.

## 3. Asset / SSG worker
Responsible for:
- static asset delivery
- SSG response serving
- cache-aware content delivery
- offloading work from the application server

## 4. Hono SSR / web layer
Responsible for:
- SSR-related application logic
- integration between Angular rendering and backend/edge strategy
- request handling where static/edge delivery alone is not sufficient

## 5. Quarkus backend
Responsible for:
- business logic
- API design
- persistence
- integration points
- auth-related backend concerns
- high-value backend functionality that demonstrates more than just CRUD

---

# What I explicitly do not want to do too early

I do **not** want to introduce all of the following at once:

- many microservices
- full Kubernetes operations
- self-hosted Keycloak too early
- unnecessary polyglot complexity
- too many distributed components without clear need
- observability tooling overload before the application has real behaviors worth observing

That kind of complexity can look impressive on paper, but in a portfolio context it can also signal weak prioritization and architecture discipline.

I want this project to show that I know how to make strong tradeoffs.

---

# Planned evolution path

## Phase 1 — strong frontend + delivery foundation
Focus:
- Angular app quality
- SSR + SSG architecture
- Cloudflare integration
- device detection / redirect strategy
- static / asset delivery strategy
- clean deployment pipeline
- basic Sentry integration

Outcome:
- technically strong frontend platform
- visible performance and delivery thinking
- deployable and demonstrable system

## Phase 2 — real backend foundation
Focus:
- Quarkus backend
- Postgres integration
- domain model
- real data flows
- API design
- auth strategy
- persistence and backend structure

Outcome:
- clear demonstration of modern backend capability
- stronger full-stack credibility
- move beyond frontend-centric portfolio work

## Phase 3 — operational maturity
Focus:
- better alerts
- tracing / APM improvements
- infrastructure-as-code expansion with Terraform
- stronger deployment and environment management
- backup / storage strategy
- selective async jobs if useful

Outcome:
- the project starts to look like a serious production-oriented system, not just a demo app

## Phase 4 — advanced differentiation
Optional later additions:
- Grafana
- more detailed metrics and dashboards
- selected edge optimizations
- maybe Rust in a clearly justified edge or performance-sensitive component
- possibly Kubernetes as an advanced operational branch or showcase extension

Outcome:
- additional engineering depth without forcing complexity too early

---

# Why this stack makes sense for me

This direction fits me well because it combines:

- my existing frontend strength
- my interest in SSR, SSG, and rendering architecture
- my interest in edge delivery and performance
- my desire to show meaningful backend capability
- my motivation to move further toward full-stack development
- a stack that is still relevant for the actual job market

Quarkus is especially interesting to me because it lets me demonstrate modern Java backend development in a way that feels more performance-conscious and cloud-native than a default Spring Boot choice, while still being much more job-market-relevant than going all-in on Rust for the main backend.

Rust still interests me, but right now I see it more as a possible later addition for selective performance-oriented or edge-related parts of the system, not as the first-choice core backend language for this portfolio.

---

# Cost strategy

Because this is a portfolio and marketing project, cost efficiency matters.

My hosting and architecture choices should aim for:

- cheap edge delivery
- as few always-on heavy services as possible
- minimal operational overhead
- using managed or low-cost services where reasonable
- only adding infrastructure when it creates real portfolio value

That means:
- leverage Cloudflare heavily for delivery and edge concerns
- avoid too many always-on backend services
- avoid premature microservice sprawl
- add tooling in layers instead of everything at once

The project should demonstrate strong engineering judgment, not just a large bill.

---

# Long-term portfolio value

This project is meant to communicate that I can think across the full stack:

- frontend architecture
- rendering strategy
- CDN / edge delivery
- request routing
- backend APIs
- persistence
- infrastructure
- observability
- deployment strategy
- cost/performance tradeoffs

If executed well, it should serve as a strong technical showcase for:
- freelance opportunities
- full-stack roles
- frontend roles with backend credibility
- modern web architecture discussions
- cloud / delivery / SSR-oriented consulting work

---

# Current final direction

My current preferred long-term direction is:

- **Angular** for the frontend
- **Cloudflare** for edge, delivery, routing, assets, and request steering
- **Hono** as the web / SSR integration layer
- **Quarkus** as the main backend
- **PostgreSQL** as the primary database
- **R2** for asset and object storage
- **Sentry first**, with broader observability later if needed
- **Terraform** for long-term infrastructure-as-code
- **Docker Compose** for local development and simple service orchestration
- **Kubernetes only later if there is a real reason**

This is the stack I currently consider the best balance of:
- portfolio strength
- market relevance
- technical depth
- performance orientation
- cost efficiency
- realistic maintainability