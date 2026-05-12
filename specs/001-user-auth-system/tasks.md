# Tasks: User Authentication System

**Input**: Design documents from `/specs/001-user-auth-system/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Testing tasks are REQUIRED for business logic. Generated tasks reflect the Testing Pyramid and include coverage enforcement for the 80% business-logic gate.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and baseline TypeScript service scaffolding.

- [X] T001 Initialize Node.js + TypeScript project metadata and scripts in package.json
- [X] T002 [P] Configure strict TypeScript compiler options in tsconfig.json
- [X] T003 [P] Configure Jest + ts-jest + Supertest test runner in jest.config.ts
- [X] T004 [P] Add environment variable template for auth runtime settings in .env.example
- [X] T005 Create application bootstrap and server wiring in src/app.ts
- [X] T006 [P] Create shared configuration loader and validators in src/config/env.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core auth infrastructure that MUST be complete before any user story implementation.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 Create initial PostgreSQL migration for auth core tables in src/db/migrations/001_init_auth_schema.sql
- [X] T008 [P] Implement PostgreSQL client and transaction helpers in src/db/client.ts
- [X] T009 [P] Implement JWT issue/verify utilities with tokenVersion claim support in src/security/jwt.ts
- [X] T010 [P] Implement password hashing and comparison helpers in src/security/password.ts
- [X] T011 [P] Implement shared Zod validation error middleware in src/api/middleware/validation-error.middleware.ts
- [X] T012 Implement centralized API error handling and auth-safe error mapping in src/api/middleware/error-handler.middleware.ts
- [X] T013 [P] Implement auth guard middleware for bearer token validation in src/api/middleware/auth.middleware.ts
- [X] T014 [P] Implement base repositories for users and auth sessions in src/db/repositories/user.repository.ts
- [X] T015 [P] Implement base repositories for reset tokens and backoff records in src/db/repositories/password-reset.repository.ts
- [X] T016 Configure business-logic coverage threshold (>=80%) in jest.config.ts

**Checkpoint**: Foundation ready; user story work can proceed.

---

## Phase 3: User Story 1 - Register Account (Priority: P1) 🎯 MVP

**Goal**: Allow a new user to register with valid email/password and prevent duplicate registration.

**Independent Test**: Create a user via `POST /auth/register`, verify `201` response for unique email and `409` for duplicate email.

### Tests for User Story 1 (REQUIRED)

- [X] T017 [P] [US1] Add registration service unit tests in tests/unit/services/register.service.test.ts
- [X] T018 [P] [US1] Add registration API integration tests for success/duplicate/validation in tests/integration/api/register.integration.test.ts
- [X] T019 [P] [US1] Add contract conformance test for POST /auth/register in tests/contract/auth-register.contract.test.ts

### Implementation for User Story 1

- [X] T020 [P] [US1] Add User domain model and mapping helpers in src/models/user.model.ts
- [X] T021 [P] [US1] Add registration request/response schemas in src/validation/register.schema.ts
- [X] T022 [US1] Implement registration business logic with duplicate-email handling in src/services/register.service.ts
- [X] T023 [US1] Implement POST /auth/register route handler in src/api/routes/auth-register.route.ts
- [X] T024 [US1] Wire registration route into API router in src/api/routes/index.ts
- [X] T025 [US1] Add JSDoc and structured logging for registration flow in src/services/register.service.ts

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Login and Session Access (Priority: P2)

**Goal**: Authenticate valid users, issue 24-hour JWT sessions, enforce backoff, and protect authenticated endpoints.

**Independent Test**: Login with valid credentials to get JWT, call `GET /auth/me` successfully, verify expired/stale token access is denied.

### Tests for User Story 2 (REQUIRED)

- [X] T026 [P] [US2] Add login and backoff service unit tests in tests/unit/services/login.service.test.ts
- [X] T027 [P] [US2] Add JWT/session validation unit tests in tests/unit/security/jwt-auth.test.ts
- [X] T028 [P] [US2] Add login/auth-me integration tests including 24-hour expiry behavior in tests/integration/api/login-session.integration.test.ts
- [X] T029 [P] [US2] Add contract conformance tests for POST /auth/login and GET /auth/me in tests/contract/auth-login-me.contract.test.ts

### Implementation for User Story 2

- [X] T030 [P] [US2] Add AuthSession and LoginAttemptBackoff domain models in src/models/session.model.ts
- [X] T031 [P] [US2] Add login/auth schema validation in src/validation/login.schema.ts
- [X] T032 [US2] Implement progressive backoff policy logic (account + IP) in src/services/login-backoff.service.ts
- [X] T033 [US2] Implement login orchestration (credential check, session persist, JWT issue) in src/services/login.service.ts
- [X] T034 [US2] Implement authenticated profile lookup in src/services/me.service.ts
- [X] T035 [US2] Implement POST /auth/login and GET /auth/me routes in src/api/routes/auth-login.route.ts
- [X] T036 [US2] Add session persistence and revocation-aware queries in src/db/repositories/auth-session.repository.ts
- [X] T037 [US2] Wire login/me routes and middleware protections in src/api/routes/index.ts

**Checkpoint**: User Stories 1 and 2 are independently functional and testable.

---

## Phase 5: User Story 3 - Reset Forgotten Password (Priority: P3)

**Goal**: Provide secure reset request/confirm flow with 15-minute tokens, generic request responses, and immediate global session revocation.

**Independent Test**: Request reset returns generic success for any email, confirm valid token updates password, old sessions are denied afterward.

### Tests for User Story 3 (REQUIRED)

- [X] T038 [P] [US3] Add password reset service unit tests (request/confirm/token TTL) in tests/unit/services/password-reset.service.test.ts
- [X] T039 [P] [US3] Add token lifecycle unit tests for used/expired/invalidated behavior in tests/unit/security/password-reset-token.test.ts
- [X] T040 [P] [US3] Add reset request/confirm integration tests including session revocation in tests/integration/api/password-reset.integration.test.ts
- [X] T041 [P] [US3] Add contract conformance tests for reset endpoints in tests/contract/auth-password-reset.contract.test.ts

### Implementation for User Story 3

- [X] T042 [P] [US3] Add PasswordResetToken domain model in src/models/password-reset-token.model.ts
- [X] T043 [P] [US3] Add password reset request/confirm schemas in src/validation/password-reset.schema.ts
- [X] T044 [P] [US3] Add mail provider interface and adapter for reset email delivery in src/services/mail.provider.ts
- [X] T045 [US3] Implement reset token generation, hashing, and persistence in src/services/password-reset-request.service.ts
- [X] T046 [US3] Implement reset confirmation logic (password update, token use, sibling invalidation) in src/services/password-reset-confirm.service.ts
- [X] T047 [US3] Implement global session revocation via user tokenVersion increment in src/services/session-revocation.service.ts
- [X] T048 [US3] Implement POST /auth/password-reset/request and POST /auth/password-reset/confirm routes in src/api/routes/auth-password-reset.route.ts
- [X] T049 [US3] Wire password reset routes and generic-response behavior in src/api/routes/index.ts

**Checkpoint**: All user stories are independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening across stories, docs, and release-readiness checks.

- [X] T050 [P] Add authentication observability logging and correlation IDs in src/api/middleware/request-context.middleware.ts
- [X] T051 [P] Add API contract and flow documentation updates in specs/001-user-auth-system/quickstart.md
- [X] T052 Add security review fixes for auth error message consistency and enumeration safety in src/services/
- [X] T053 [P] Add additional coverage gap tests to keep business logic >=80% in tests/unit/services/auth-coverage-gap.test.ts
- [X] T054 Run full test suite and coverage verification command updates in package.json

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories.
- **Phase 3+ (User Stories)**: Depend on Phase 2 completion.
- **Phase 6 (Polish)**: Depends on all selected user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2; no dependency on US2/US3.
- **US2 (P2)**: Starts after Phase 2; uses foundational auth and user components from earlier phases.
- **US3 (P3)**: Starts after Phase 2; relies on user/session infrastructure and revocation semantics.

### Story Completion Order

- **MVP order**: US1
- **Incremental order**: US1 -> US2 -> US3
- **Parallel option after Phase 2**: US1, US2, and US3 can be staffed concurrently if coordination is available.

### Within Each User Story

- Write and run failing tests first.
- Implement models/schemas before service orchestration.
- Implement services before route handlers.
- Integrate routes and middleware last.

### Parallel Opportunities

- Setup tasks: T002, T003, T004, T006 in parallel.
- Foundational tasks: T008, T009, T010, T011, T013, T014, T015 in parallel.
- US1 parallel: T017, T018, T019, T020, T021.
- US2 parallel: T026, T027, T028, T029, T030, T031.
- US3 parallel: T038, T039, T040, T041, T042, T043, T044.
- Polish parallel: T050, T051, T053.

---

## Parallel Example: User Story 1

```bash
# Run US1 tests in parallel workstreams
T017 tests/unit/services/register.service.test.ts
T018 tests/integration/api/register.integration.test.ts
T019 tests/contract/auth-register.contract.test.ts

# Implement independent US1 artifacts in parallel
T020 src/models/user.model.ts
T021 src/validation/register.schema.ts
```

## Parallel Example: User Story 2

```bash
# Run US2 tests in parallel
T026 tests/unit/services/login.service.test.ts
T027 tests/unit/security/jwt-auth.test.ts
T028 tests/integration/api/login-session.integration.test.ts
T029 tests/contract/auth-login-me.contract.test.ts

# Implement independent US2 artifacts in parallel
T030 src/models/session.model.ts
T031 src/validation/login.schema.ts
```

## Parallel Example: User Story 3

```bash
# Run US3 tests in parallel
T038 tests/unit/services/password-reset.service.test.ts
T039 tests/unit/security/password-reset-token.test.ts
T040 tests/integration/api/password-reset.integration.test.ts
T041 tests/contract/auth-password-reset.contract.test.ts

# Implement independent US3 artifacts in parallel
T042 src/models/password-reset-token.model.ts
T043 src/validation/password-reset.schema.ts
T044 src/services/mail.provider.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete US1 (Phase 3).
3. Validate US1 independently via registration contract and integration tests.
4. Demo/deploy MVP.

### Incremental Delivery

1. Deliver US1 (registration) after foundation.
2. Deliver US2 (login/session/auth access).
3. Deliver US3 (password reset + global revocation).
4. Finish with cross-cutting polish and coverage hardening.

### Parallel Team Strategy

1. Team aligns on Setup + Foundational tasks.
2. After foundation, assign separate owners per story stream.
3. Merge via contract tests and shared middleware integration checkpoints.

---

## Notes

- [P] tasks are isolated by file and dependency boundaries.
- [US#] labels map each task to a user story for traceability.
- Every story has independent tests and acceptance validation criteria.
- Coverage and strict TypeScript/JSDoc constraints are explicitly tracked in setup/foundational/polish tasks.
