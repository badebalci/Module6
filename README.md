# User Authentication Service (Day 6)

TypeScript + Express authentication API with PostgreSQL persistence.

This project implements:
- User registration
- Login with JWT sessions
- Authenticated profile lookup
- Password reset request/confirm flow
- Session revocation via token versioning
- Progressive login backoff (email + IP)

## Tech Stack

- Node.js 20+
- TypeScript
- Express 5
- PostgreSQL
- Zod validation
- JWT (`jsonwebtoken`)
- Password hashing (`bcrypt`)
- Jest + Supertest

## Project Structure

```text
src/
  api/
    middleware/
    routes/
  config/
  db/
    migrations/
    repositories/
  models/
  security/
  services/
  validation/
  app.ts

tests/
  unit/
  integration/
  contract/
```

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 15+

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create environment file from template:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Update `.env` values for your local setup.

4. Create database and run schema migration.

Example (PowerShell + psql):

```powershell
createdb auth_db
psql -d auth_db -f src/db/migrations/001_init_auth_schema.sql
```

Note: `npm run db:migrate` is currently a placeholder script and does not execute migrations yet.

5. Start development server:

```bash
npm run dev
```

Server default: `http://localhost:3000`

## Environment Variables

Required settings are listed in `.env.example`:

```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/auth_db
JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
PASSWORD_RESET_TOKEN_TTL_MINUTES=15
```

## Available Scripts

- `npm run dev` - Run the app with `ts-node`
- `npm run build` - Compile TypeScript to `dist/`
- `npm run start` - Start compiled app from `dist/app.js`
- `npm run test` - Run all tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run typecheck` - Type-check without emitting files
- `npm run db:migrate` - Placeholder migration command

## API Endpoints

Base URL: `http://localhost:3000`

- `POST /auth/register` - Register a new account
- `POST /auth/login` - Authenticate and receive JWT access token
- `GET /auth/me` - Get current authenticated user (Bearer token required)
- `POST /auth/password-reset/request` - Request password reset (generic success response)
- `POST /auth/password-reset/confirm` - Confirm password reset with token

Full API contract: `specs/001-user-auth-system/contracts/auth-api.yaml`

## Quick Smoke Test

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPass123!"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPass123!"}'

# Request password reset
curl -X POST http://localhost:3000/auth/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

## Testing

Run all tests:

```bash
npm test
```

Run with coverage:

```bash
npm run test:coverage
```

Coverage artifacts are generated in `coverage/`.

## Notes

- The default mail provider logs reset tokens to the console for local development.
- JWT validation uses token version checks, so password reset can invalidate older sessions.