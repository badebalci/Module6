<!--
Sync Impact Report
- Version change: template-initial -> 1.0.0
- Modified principles:
	- Principle slot 1 -> I. Clean Code First
	- Principle slot 2 -> II. TypeScript Strict Mode Mandatory
	- Principle slot 3 -> III. JSDoc Documentation Required
	- Principle slot 4 -> IV. Testing Pyramid Enforcement
	- Principle slot 5 -> V. Business Logic Coverage Gate
- Added sections:
	- Engineering Standards
	- Workflow and Quality Gates
- Removed sections:
	- None
- Templates requiring updates:
	- .specify/templates/plan-template.md ✅ updated
	- .specify/templates/spec-template.md ✅ updated
	- .specify/templates/tasks-template.md ✅ updated
	- .specify/templates/commands/*.md ⚠ pending (directory not present)
- Follow-up TODOs:
	- None
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
coverage. Pull requests that reduce coverage below this threshold MUST NOT be
merged without explicit exception approval documented in the PR.
Rationale: a minimum coverage gate protects core behavior against regressions.

## Engineering Standards

- Preferred stack is TypeScript for application and domain logic.
- `tsconfig` MUST enforce strict mode and disallow unchecked typed escapes.
- Linting and formatting rules MUST be automated in CI.
- Every code change touching business logic MUST include corresponding test updates.
- Public API and domain-level symbols MUST remain JSDoc-complete.

## Workflow and Quality Gates

- Plan phase MUST include a Constitution Check that evaluates all five principles.
- Specification phase MUST define quality requirements for strict typing,
  documentation, and testing obligations.
- Task generation MUST include explicit tasks for strict-mode configuration,
  JSDoc updates, test implementation across pyramid layers, and coverage validation.
- Code review MUST reject changes that violate any constitutional MUST unless an
  approved exception is recorded with owner, scope, and expiration date.

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
  evidence.
- Exceptions MUST include rationale, owner, and expiry date.
- Quarterly audits SHOULD verify that strict mode, JSDoc coverage, and the testing
  pyramid remain enforced.

**Version**: 1.0.0 | **Ratified**: 2026-05-12 | **Last Amended**: 2026-05-12
