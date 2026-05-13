<!--
Sync Impact Report
- Version change: 1.0.0 -> 1.1.0
- Modified principles:
	- Principle slot 5 -> V. Business Logic Coverage Gate (refined wording)
	- Added new principle -> VI. Comprehensive Testing Framework
- Added sections:
	- Testing Framework (8 subsections: Philosophy, Coverage, Types & Org, Naming, Anatomy, Mocking, Quality Criteria, Tools & Frameworks)
- Removed sections:
	- None
- Templates requiring updates:
	- .specify/templates/plan-template.md ⚠ pending (add Testing Framework validation)
	- .specify/templates/spec-template.md ⚠ pending (add testing requirements section)
	- .specify/templates/tasks-template.md ⚠ pending (add test task categorization)
- Follow-up TODOs:
	- Align CI/CD templates with new mutation testing gate
	- Document Stryker configuration for project
-->

# Day5 Task Constitution

## Core Principles

### I. Clean Code First

All production code MUST prioritize readability, maintainability, and simplicity.
Functions and modules MUST have single, explicit responsibilities, names MUST be
intention-revealing, and dead code or speculative abstractions MUST NOT be merged.
Rationale: clean code reduces defects, onboarding time, and maintenance cost.

### II. TypeScript Strict Mode Mandatory

All TypeScript projects and packages MUST compile with strict mode enabled
(`"strict": true`) and MUST keep strict sub-checks active unless a documented,
time-bound exception is approved. Use of `any` is prohibited unless accompanied by
an explicit justification and tracking issue.
Rationale: strict typing catches classes of defects before runtime.

### III. JSDoc Documentation Required

All exported functions, classes, interfaces, type aliases, and non-trivial internal
business-logic functions MUST include accurate JSDoc covering purpose, parameters,
return values, thrown errors, and side effects where relevant.
Rationale: consistent documentation improves correctness, review quality, and reuse.

### IV. Testing Pyramid Enforcement

Test suites MUST follow the Testing Pyramid: many unit tests, fewer integration
tests, and minimal end-to-end tests focused on critical flows. Business logic
changes MUST include or update unit tests first; integration and end-to-end tests
MUST validate boundaries and user-critical journeys.
Rationale: pyramid-aligned testing gives fast feedback and robust confidence.

### V. Business Logic Coverage Gate

Automated test coverage for business-logic code MUST remain at or above 80% line
coverage and 75% branch coverage. Pull requests that reduce coverage below these
thresholds MUST NOT be merged without explicit exception approval documented in the PR.
Rationale: a minimum coverage gate protects core behavior against regressions.

### VI. Comprehensive Testing Framework

All code changes MUST include corresponding tests at appropriate pyramid levels
(unit, integration, E2E) before merge. Testing MUST follow a structured framework
encompassing philosophy, organization, naming, anatomy, isolation, quality criteria,
and tooling standards. Mutation testing MUST validate that test suites detect real
defects; mutation scores MUST remain at or above 75%.
Rationale: structured testing discipline ensures tests are maintainable, reliable,
and actually protect against defects.

## Testing Framework

### 1. Testing Philosophy

All test suites MUST follow Test-Driven Development (TDD) principles with the
RED-GREEN-REFACTOR cycle. Write tests FIRST before implementation. Generate tests
from specifications and acceptance criteria, never from implementation details.
This approach ensures specifications drive code, tests serve as living documentation,
and refactoring confidence is maximized.

### 2. Coverage Requirements

Test suites MUST follow the Testing Pyramid distribution:

- **70% Unit Tests**: Services, utilities, business logic, pure functions.
- **20% Integration Tests**: API endpoints, database operations, cross-component interactions.
- **10% E2E Tests**: Critical user workflows and happy-path journeys only.

Coverage targets (enforced by CI):

- **Line coverage**: 80% minimum
- **Branch coverage**: 75% minimum
- **Mutation score**: 75% minimum (Stryker)

Static analysis MUST include TypeScript strict mode and ESLint (zero warnings on main).

### 3. Test Types & Organization

- **Unit tests**: `tests/unit/**/*.test.ts` (mirror `src/` directory structure)
- **Integration tests**: `tests/integration/**/*.test.ts` (group by feature/endpoint)
- **E2E tests**: `tests/e2e/**/*.spec.ts` (group by user journey)

Maintain one test file per source file for unit tests. Use descriptive directory names
that correspond to the modules being tested.

### 4. Naming Conventions

- **Test files**: `ComponentName.test.ts` for unit and integration tests.
- **E2E files**: `user-journey-name.spec.ts` (kebab-case for file names).
- **Test suites**: `describe('ComponentName', ...)` or `describe('Feature: User Login', ...)`.
- **Test cases**: `it('should do X when Y happens', ...)` (clear, behavior-focused).

All names MUST be intention-revealing and describe the expected behavior, not the
test implementation.

### 5. Test Anatomy

Tests MUST follow the **Arrange-Act-Assert (AAA)** pattern:

- **Arrange**: Set up test data, mocks, and initial state.
- **Act**: Execute the code under test.
- **Assert**: Verify the result against expected behavior.

Test setup MUST use `beforeEach` (not `beforeAll`) to ensure test isolation and
independence. Each test MUST run in isolation; tests MUST be runnable in any order
and produce identical results. Global mutable state MUST NOT be shared between tests.

test value and increases brittleness. Use real implementations for your own code.

### 6. Mocking & Test Data

- **Mock**: External services (email, payment gateways, third-party APIs). Use Jest mocks or MSW for HTTP APIs.
- **Stub**: Time-dependent functions (`Date.now()`, timers, random generators) to ensure deterministic results.
- **Fake**: In-memory databases for unit and integration tests (e.g., sqlite-memory, in-memory MongoDB).
- Use test fixtures for complex or repeated data setup.
- Extract reusable helpers such as `createTestUser()`, `setupMockAPI()`, `setupMockEmailService()`.
- DO NOT mock code you own, simple utilities, or pure functions—prefer real implementations for your own code to maximize test value and minimize brittleness.

All mocks, stubs, and fakes MUST be reset between tests to ensure isolation. Prefer factory functions for test data. Avoid global state in test helpers.

### 7. Quality Criteria (CRITICAL)

### 8. Tools & Frameworks

**Static Analysis:**

- **TypeScript**: Strict mode MUST be enabled (`"strict": true` in `tsconfig.json`).
- **ESLint**: Airbnb config required; zero warnings on main branch; auto-fix in CI.

**Unit & Integration Testing:**

- **Framework**: Jest 29.x with ts-jest for TypeScript support.
- **Assertion Library**: Jest's built-in `expect()` API.
- **Mocking**: Jest mocks and MSW (Mock Service Worker) for HTTP mocking.

**E2E Testing:**

- **Framework**: Playwright 1.40+ (Chromium as primary browser).
- **Optional**: Stagehand for AI-native browser automation (for complex flows).

**Coverage & Quality:**

- **Coverage Tool**: Jest built-in coverage reporter (80% line, 75% branch targets).
- **Mutation Testing**: Stryker (75% score minimum; validates test effectiveness).

**Execution Commands (npm):**

```
npm run typecheck        # Run TypeScript type checking
npm run lint             # Run ESLint (zero warnings required)
npm test                 # Run all tests (unit + integration + E2E)
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:e2e         # E2E tests only
npm run test:coverage    # Generate coverage report (80% gate)
npm run test:mutation    # Run Stryker mutation testing (75% gate)
```

**Pre-commit Hook:** MUST run `typecheck`, `lint`, and `test:unit` before allowing commits.

**CI/CD Pipeline (main branch):** MUST run all checks (typecheck, lint, all tests, coverage validation, mutation testing) and MUST NOT merge if any gate fails.

**What makes a good test:**

- Tests observable behavior (inputs, outputs, side effects), NOT implementation details
- Has meaningful assertions—never tautological (e.g., `expect(x).toBe(x)`)
- Tests ONE thing (single responsibility); avoid multi-purpose or "god" tests
- Is FAST: <1 second for unit tests, <5 seconds for integration tests
- Is DETERMINISTIC: produces identical results on every run, never flaky

**Quality gates (enforced in CI):**

- Mutation score: 75% minimum (use Stryker for TypeScript/Node.js)
- No always-true (tautological) assertions; code review MUST reject meaningless assertions
- All expected values (test oracles) MUST be validated by a human (no copy-paste of outputs)
- Coverage: 80% line, 75% branch (Jest coverage reporter)

**Anti-patterns to avoid:**

- Testing private methods or internal state (tests should be decoupled from implementation)
- Interdependent tests (test order MUST NOT matter)
- Brittle tests (break on harmless refactoring)
- Flaky tests (intermittent failures due to timing, randomness, or ordering)
- Tests without assertions (pointless test runs)
- Copy-pasted test logic (extract reusable helpers instead)

**Mutation Testing Tool:**

- Use Stryker for mutation testing in TypeScript/Node.js projects. Mutation score MUST be tracked in CI and PRs. Low mutation scores indicate weak or untrustworthy tests and MUST be addressed before merge.

### 8. Tools & Frameworks

**Static Analysis:**

- **TypeScript**: Strict mode MUST be enabled (`"strict": true`).
- **ESLint**: Zero warnings on main branch; auto-fix in CI.

**Unit & Integration Testing:**

- **Framework**: Jest 29.x with ts-jest for TypeScript support.
- **Assertion Library**: Jest's built-in `expect()` API.
- **Mocking**: Jest mocks + MSW (Mock Service Worker) for HTTP mocking.

**E2E Testing:**

- **Framework**: Playwright 1.40+ (Chromium as primary browser).
- **Optional**: Stagehand for AI-native browser automation (for complex flows).

**Coverage & Quality:**

- **Coverage Tool**: Jest built-in coverage reporter (80% line, 75% branch targets).
- **Mutation Testing**: Stryker (75% score minimum; validates test effectiveness).

**Execution Commands:**

```
npm run typecheck        # Run TypeScript type checking
npm run lint             # Run ESLint (zero warnings required)
npm test                 # Run all tests (unit + integration + E2E)
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:e2e         # E2E tests only
npm run test:coverage    # Generate coverage report (80% gate)
npm run test:mutation    # Run Stryker mutation testing (75% gate)
```

**Pre-commit Hook:** MUST run `typecheck`, `lint`, and `test:unit` before allowing commits.

**CI/CD Pipeline (main branch):** MUST run all checks (typecheck, lint, all tests,
coverage validation, mutation testing) and MUST NOT merge if any gate fails.

## Engineering Standards

- Preferred stack is TypeScript for application and domain logic.
- `tsconfig` MUST enforce strict mode and disallow unchecked typed escapes.
- Linting and formatting rules MUST be automated in CI.
- Every code change touching business logic MUST include corresponding test updates.
- Public API and domain-level symbols MUST remain JSDoc-complete.
- All testing MUST follow the Testing Framework specification above.

## Workflow and Quality Gates

- Plan phase MUST include a Constitution Check that evaluates all six principles
  (Clean Code, Strict Mode, Documentation, Testing Pyramid, Coverage Gate, Testing Framework).
- Specification phase MUST define quality requirements for strict typing,
  documentation, and comprehensive testing (coverage, pyramid layers, mutation gates).
- Task generation MUST include explicit tasks for strict-mode configuration,
  JSDoc updates, test implementation across pyramid layers, coverage validation,
  mutation testing setup, and tool configuration.
- Code review MUST reject changes that violate any constitutional MUST unless an
  approved exception is recorded with owner, scope, and expiration date. All testing
  MUST conform to the Testing Framework specification.

## Governance

This constitution is the highest authority for engineering process in this
repository. If other documents conflict, this constitution takes precedence.

Amendment process:

- Propose changes in a pull request that explains intent, impact, and migration.
- Obtain approval from repository maintainers.
- Update dependent templates and guidance files in the same change.

Versioning policy:

- MAJOR for backward-incompatible governance changes or principle removals.
- MINOR for new principles/sections or materially expanded obligations.
- PATCH for clarifications, wording improvements, and typo fixes.

Compliance review expectations:

- Every plan, spec, task list, and pull request MUST include constitution compliance
  evidence (all six principles).
- Exceptions MUST include rationale, owner, and expiry date.
- Quarterly audits SHOULD verify that strict mode, JSDoc coverage, testing pyramid,
  coverage gates, and mutation testing remain enforced and effective.

**Version**: 1.1.0 | **Ratified**: 2026-05-12 | **Last Amended**: 2026-05-13
