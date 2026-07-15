# Implementation Plan


## Stage 1

Repository setup

Goal:

Create monorepo.

Deliverables:

- npm workspaces
- backend app
- frontend app
- root scripts

STOP.

Do not create Docker.

Do not create database.

Do not create business logic.

---

## Stage 2

Infrastructure

Goal:

Create Docker Compose.

Configure PostgreSQL.

Backend connects successfully.

Deliverables:

- docker compose
- env files
- connection verified

STOP.

No entities.

No migrations.

No endpoints.

---

## Stage 3

Prisma

Goal:

Configure Prisma.

Deliverables:

- schema
- migrations
- initial seed infrastructure

STOP.

No business entities.

No services.

---

## Stage 4

Database model

Goal:

Implement all required database models.

Deliverables:

- Prisma schema
- migrations
- relationships

STOP.

No controllers.

No services.

No frontend.

---

## Stage 5

Seed

Goal:

Populate database.

Deliverables:

- tariffs
- categories

STOP.

No API.

---

## Stage 6

Nest modules

Goal:

Generate CRUD modules.

Deliverables:

Client

Tariff

Category

Pledge

STOP.

No business logic.

No calculations.

---

## Stage 7

DDD structure

Goal:

Refactor backend architecture.

Deliverables:

domain

application

infrastructure

presentation

STOP.

Do not implement calculations.

---

## Stage 8

Create Pledge business logic

Goal:

Implement pledge creation.

STOP.

No redeem.

---

## Stage 9

Redeem calculation

Goal:

Implement redeem calculation.

STOP.

No frontend.

---

## Stage 10

Frontend foundation

Goal:

Setup React architecture.

STOP.

No pages.

---

## Stage 11

Create Pledge page

Goal:

Implement pledge form.

STOP.

No redeem page.

---

## Stage 12

Redeem page

Goal:

Implement redeem UI.

STOP.

---

## Stage 13

E2E

Goal:

Implement tests.

STOP.

---

## Stage 14

README

Goal:

Documentation.

STOP.