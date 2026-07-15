# Pawnshop Pledge/Redeem Test Assignment

## Project Goal

Build a production-like monorepo implementing a simplified pawnshop management system.

The project must demonstrate:

- backend architecture
- frontend architecture
- database design
- business logic
- automated setup
- reproducible environment
- automated testing

This is NOT a prototype.

The project should look like a small production service.

---

# Tech Stack

Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Docker

Frontend

- React
- TypeScript
- Vite
- Material UI

Testing

- Jest
- Supertest
- e2e tests

---

# Repository Structure

apps/
    backend/
    frontend/

docker/

README.md

package.json

---

# General Principles

Every task must stay within its scope.

Never implement functionality that belongs to future stages.

If something is not explicitly requested by the current task, do not implement it.

Do not create placeholder code "for later".

---

# Architecture

Backend follows simplified Domain Driven Design.

Layers:

- domain
- application
- infrastructure
- presentation

Business rules belong only inside the domain layer.

Controllers must contain no business logic.

Repositories must contain no calculations.

---

# Domain

Use Entities for domain models.

Use Value Objects where they improve the model.

Expected examples:

- Money
- PhoneNumber (optional)
- PledgeStatus

Business calculations must be implemented as domain services.

---

# Frontend

Keep architecture simple.

Suggested folders:

src/

    api/

    components/

    features/

    pages/

    shared/

Business calculations must NEVER happen in React.

Frontend displays data returned by backend.

---

# UI

Use Material UI components.

No custom design system.

No CSS frameworks.

Simple layout.

Functionality is more important than appearance.

---

# Database

Database is code.

Never create tables manually.

Everything must be reproducible using:

- migrations
- seed scripts

---

# Docker

Docker must start PostgreSQL.

Application must run against Docker database.

---

# Setup

The repository must support automated setup.

Typical workflow:

npm install

docker compose up -d

npm run db:migrate

npm run db:seed

npm run build

---

# CRUD

Simple CRUD endpoints may be generated using Nest CLI.

Do not manually write repetitive CRUD unless customization is required.

---

# Code Quality

Prefer readable code over clever code.

Prefer explicit naming.

Avoid magic numbers.

Keep methods small.

Keep files focused.

---

# Testing

Business logic must be testable.

Redeem calculation will be tested through real HTTP endpoints.

Do not put business logic inside controllers.

---

# README

README must explain:

- setup
- build
- run
- migrations
- seeds
- architecture
- project structure
- assumptions
- overdue calculation decision

---

# Definition of Done

A task is complete only if:

- project builds
- lint passes
- types compile
- no unrelated code was added
- no future stage was implemented
- code matches requested architecture

# Forbidden

The agent MUST NOT:

- implement future stages
- change project architecture
- replace selected libraries
- introduce additional frameworks
- create undocumented abstractions
- simplify requirements
- skip migrations
- skip seed scripts
- move business logic into controllers
- calculate business rules on the frontend
- manually edit generated CRUD unless required
- modify unrelated files
- perform large refactorings outside the current stage