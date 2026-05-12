# Phase 0 Research - User Authentication System

## Decision 1: API framework and runtime stack

- Decision: Use Express.js on Node.js 20 with TypeScript strict mode.
- Rationale: Express is mature, well supported, and fits a lean auth API. TypeScript strict mode aligns with constitution requirements and reduces auth-path defects.
- Alternatives considered: Fastify (better raw performance but unnecessary complexity for initial scope), NestJS (strong structure but higher framework overhead for a focused auth service).

## Decision 2: Password hashing strategy

- Decision: Use `bcrypt` with a calibrated cost factor (start at 12, tune by environment benchmark).
- Rationale: `bcrypt` is explicitly required, battle-tested, and resistant to offline brute-force with adaptive work factor.
- Alternatives considered: Argon2id (excellent modern choice but conflicts with explicit bcrypt requirement), PBKDF2 (broad support but typically less ergonomic in Node auth stacks).

## Decision 3: Token and session revocation model

- Decision: Use JWT access tokens with 24-hour expiry and include `tokenVersion` claim validated against per-user `token_version` in database.
- Rationale: Meets FR-004, FR-005, and FR-015 while enabling immediate revocation after password reset without centralized token blacklist.
- Alternatives considered: Opaque server-side sessions only (simple revocation but diverges from JWT requirement), JWT denylist table (works but introduces high churn and cleanup burden).

## Decision 4: Password reset flow design

- Decision: Persist hashed reset tokens in PostgreSQL with `expires_at` (15 minutes), `used_at`, and one-time-use validation; always return generic success on request endpoint.
- Rationale: Hashing reset tokens protects against DB leakage; metadata supports FR-008, FR-013, FR-014 and auditability.
- Alternatives considered: Plain token storage (security risk), stateless reset JWT without persistence (harder one-time-use guarantees and replay prevention).

## Decision 5: Progressive backoff for failed logins

- Decision: Track failed attempts by composite key (`normalized_email`, `ip_address`) in a dedicated throttle table with exponential or tiered delay windows.
- Rationale: Satisfies FR-011 with deterministic enforcement and allows independent reset/decay policies.
- Alternatives considered: In-memory counters (not durable across instances), account-only keying (weaker against distributed probing), IP-only keying (poor for shared networks).

## Decision 6: PostgreSQL schema approach

- Decision: Use normalized tables for `users`, `auth_sessions`, `password_reset_tokens`, and `login_attempt_backoff`, with strong indexing on lookup paths.
- Rationale: Supports required auth invariants, observability, and future compliance reporting.
- Alternatives considered: Single denormalized user table (simpler start but poor lifecycle tracking), NoSQL store (not requested and less natural for relational constraints).

## Decision 7: Test strategy and quality gates

- Decision: Use Jest with unit-heavy tests for domain logic, focused integration tests via Supertest for auth endpoints, and minimal contract tests for response shape and status codes.
- Rationale: Conforms to constitution testing pyramid and enables 80%+ business-logic coverage gate.
- Alternatives considered: Integration-only tests (slower and brittle), E2E-heavy strategy (high maintenance and slow feedback).

## Decision 8: Email integration boundary

- Decision: Define a mail provider interface (`sendPasswordResetEmail`) and implement a provider adapter; use fake/stub provider in tests.
- Rationale: Keeps core auth logic decoupled and testable while meeting FR-006.
- Alternatives considered: Direct SMTP calls from route handlers (tight coupling), no abstraction (hard to mock and evolve).
