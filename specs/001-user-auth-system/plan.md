# Implementation Plan: User Authentication System

**Branch**: `001-add-user-auth` | **Date**: 2026-05-13 | **Spec**: `/specs/001-user-auth-system/spec.md`

**Input**: Feature specification from `/specs/001-user-auth-system/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement an Express.js + TypeScript authentication web service backed by PostgreSQL, supporting registration, login with 24-hour JWT sessions, password reset by email with 15-minute reset tokens, progressive login backoff (per account + IP), and immediate global session revocation after password reset via per-user `tokenVersion` checks.

## Technical Context

**Language/Version**: TypeScript (Node.js 20 LTS)

**Primary Dependencies**: Express.js, `pg`, `bcrypt`, `jsonwebtoken`, `zod`

**Storage**: PostgreSQL

**Testing**: Jest (`ts-jest`) with Supertest for HTTP integration tests

**Target Platform**: Linux container/server runtime (Node.js API service)

**Project Type**: Web service (REST API)

**Performance Goals**: Login response for valid credentials under 10 seconds, reliable registration completion, and guaranteed denial after session expiry

**Constraints**: Strict TypeScript mode, generic auth failure/reset responses, reset token TTL 15 minutes, session TTL 24 hours, JWT revocation via `tokenVersion`

**Scale/Scope**: Initial release scope is a single auth service for core identity flows with expected usage up to tens of thousands of users

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Clean Code First: design keeps modules single-purpose, names intention-revealing, and avoids speculative abstractions.
- TypeScript Strict Mode: `tsconfig` includes `"strict": true`; any strict-mode exception is documented with owner and expiry.
- JSDoc Required: all exported and non-trivial business-logic symbols are planned with JSDoc updates.
- Testing Pyramid: test strategy includes primarily unit tests, with fewer integration tests and minimal critical-path end-to-end tests.
- Business Logic Coverage Gate: plan includes automation to enforce >=80% line coverage for business-logic code in CI.

Initial gate assessment: PASS. No constitutional violations are required for this feature plan.

Post-design gate assessment (after Phase 1 artifacts): PASS. Design and contracts remain compliant with all constitutional principles.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── api/
│   ├── middleware/
│   └── routes/
├── config/
├── db/
│   ├── migrations/
│   └── repositories/
├── models/
├── security/
├── services/
├── validation/
└── app.ts

tests/
├── unit/
│   ├── services/
│   └── security/
├── integration/
│   └── api/
└── contract/
```

**Structure Decision**: Use a single backend web-service project rooted at `src/` with layered modules (`api`, `services`, `security`, `db`) and a testing pyramid-aligned `tests/` split (unit-heavy, focused integration, minimal contract coverage).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |
