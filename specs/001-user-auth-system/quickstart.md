# Quickstart - User Authentication System

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm 10+

## Environment

Create `.env` with:

```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/auth_db
JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
PASSWORD_RESET_TOKEN_TTL_MINUTES=15
```

## Install dependencies

```bash
npm install express pg bcrypt jsonwebtoken zod
npm install -D typescript ts-node ts-jest jest supertest @types/express @types/bcrypt @types/jsonwebtoken @types/jest @types/supertest
```

## Database setup

```bash
# create database
createdb auth_db

# run migrations (command placeholder; align with selected migration tool)
npm run db:migrate
```

## Run the service

```bash
npm run dev
```

Expected base URL: `http://localhost:3000`

## Core API smoke checks

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPass123!"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPass123!"}'

# Request password reset (always generic success)
curl -X POST http://localhost:3000/auth/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

## Test execution

```bash
# unit + integration + contract
npm test

# coverage gate for business logic
npm run test:coverage

# login performance threshold check (<10s)
npm run perf:login
```

Coverage expectation: >=80% line coverage for business-logic modules.

## Notes for implementation

- Ensure JWT payload includes `sub`, `jti`, `exp`, and `tokenVersion`.
- Protect reset and login responses from account enumeration.
- Revoke all active sessions and increment `token_version` on successful password reset.
