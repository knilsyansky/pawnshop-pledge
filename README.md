# Pawnshop Pledge

## Repository scaffold

This repository is a monorepo scaffold for a pawnshop pledge/redeem application.

## Structure

- `apps/backend` - backend application workspace
- `apps/frontend` - frontend application workspace
- `docker/docker-compose.yml` - PostgreSQL service definition
- `.env.example` - environment variable example

## Setup

1. Install dependencies

   ```bash
   npm run bootstrap
   ```

2. Start PostgreSQL

   ```bash
   npm run db:up
   ```

3. Stop PostgreSQL

   ```bash
   npm run db:down
   ```

4. Check Docker status

   ```bash
   npm run db:ps
   ```

5. Verify backend can connect to PostgreSQL

   ```bash
   npm run env:copy
   npm run db:verify
   ```

6. Tail PostgreSQL logs

   ```bash
   npm run db:logs
   ```

## Notes

- No business logic or application startup is configured yet.
- Backend and frontend packages are initialized as workspaces and can be extended in later stages.
- Use `.env.example` as a reference when adding environment configuration.
