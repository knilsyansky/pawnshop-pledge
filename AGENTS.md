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
- Stage 8 includes e2e coverage for pledge creation logic, verifying amount calculation and due date generation

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

# Business Domain

This project models a pawnshop.

Customers leave one or more items as collateral.

The pawnshop creates a pledge.

The pledge references:

- one client
- one tariff
- one or more pledged items

Each pledged item has:

- category
- dynamic characteristics
- estimated value

The total pledge amount is the sum of all pledged items.

Later the customer redeems exactly one pledge.

Redeeming changes pledge status and stores redemption information.

Use Entities for domain models.

Use Value Objects where they improve the model.

Expected examples:

- Money
- PhoneNumber (optional)
- PledgeStatus

Business calculations must be implemented as domain services.

---

Business Rules

Creating a pledge

1.

User selects tariff.

The system calculates

dueDate = createdAt + basePeriodDays.

2.

User selects or creates a client.

3.

User adds one or more pledge items.

4.

Each item contributes estimatedValue.

5.

Total pledge amount is the sum of all items.

6.

Status becomes ACTIVE.

---

Redeeming

User selects client.

System loads ACTIVE pledges only.

User chooses one pledge.

System calculates redemption amount.

Status changes to REDEEMED.

Store

- redeemedAt
- redeemedAmount

Redeemed pledges never appear again.

# Interest Calculation

Base interest

If today <= dueDate

interest =

amount * basePeriodRate / 100

total = amount + interest

---

Overdue

If today > dueDate

overdueDays =

today - dueDate

interest =

amount * basePeriodRate / 100

+

amount * overdueRate / 100 * overdueDays

total =

amount + interest

Assume overdueRate is a DAILY percentage.

Document this decision in README.

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

# Database Model

Client

Fields

- id
- fullName
- phone

Relationships

1 Client

↓

Many Pledges

---

Tariff

Fields

- id
- basePeriodDays
- basePeriodRate
- overdueRate
- overduePeriodDays

Notes

- `id` is a string label and also the tariff name, for example: "Техника 5 дней 2,158%"
- `overduePeriodDays` is nullable; when null, overdue is unlimited.

Relationships

1 Tariff

↓

Many Pledges

---

ItemCategory

Fields

- id
- specification schema

Notes

- `id` is a unique string label and also the category name.
- The specification schema defines dynamic form fields.

Store as JSON.

Example

Smartphone

- model
- memory
- screenCondition

Monitor

- diagonal
- resolution
- scratches

---

Pledge

Fields

- id
- tariffId
- clientId
- createdAt
- dueDate
- amount
- redeemedAmount
- redeemedAt
- status

Notes

- `amount` is the total value of all pledged items at creation.
- `redeemedAmount` is the amount actually paid when the pledge is redeemed; it can include interest and fees.

Relationships

One pledge

↓

Many pledge items

---

PledgeItem

Fields

- id
- pledgeId
- categoryId
- name
- estimatedValue
- specifications

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