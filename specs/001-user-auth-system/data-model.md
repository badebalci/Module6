# Data Model - User Authentication System

## Entity: User

- Purpose: Registered account identity used for authentication.
- Fields:
  - `id` (uuid, primary key)
  - `email` (citext/varchar, unique, normalized lowercase)
  - `password_hash` (text, bcrypt hash)
  - `token_version` (integer, default 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `last_login_at` (timestamptz, nullable)
- Validation Rules:
  - Email must be valid format and normalized.
  - Password must meet policy minimums before hashing.
  - `token_version` increments on revocation events (password reset).
- Relationships:
  - One-to-many with `AuthSession`.
  - One-to-many with `PasswordResetToken`.

## Entity: AuthSession

- Purpose: Tracks issued login session metadata for 24-hour JWT lifecycle and auditing.
- Fields:
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key -> User.id)
  - `jwt_id` (uuid/text, unique token identifier claim)
  - `issued_at` (timestamptz)
  - `expires_at` (timestamptz, issued_at + 24 hours)
  - `revoked_at` (timestamptz, nullable)
  - `revoke_reason` (text, nullable)
  - `created_ip` (inet/text)
  - `created_user_agent` (text, nullable)
- Validation Rules:
  - `expires_at` must be greater than `issued_at`.
  - Session is valid only when now < `expires_at`, `revoked_at` is null, and tokenVersion matches current user value.
- Relationships:
  - Many-to-one with `User`.

## Entity: PasswordResetToken

- Purpose: One-time, time-limited credential to authorize password change.
- Fields:
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key -> User.id)
  - `token_hash` (text, hashed secret)
  - `expires_at` (timestamptz, issued_at + 15 minutes)
  - `used_at` (timestamptz, nullable)
  - `invalidated_at` (timestamptz, nullable)
  - `created_at` (timestamptz)
  - `request_ip` (inet/text, nullable)
- Validation Rules:
  - Token accepted only when hash matches, now <= `expires_at`, and `used_at`/`invalidated_at` are null.
  - Successful reset sets `used_at` and invalidates sibling active tokens for same user.
- Relationships:
  - Many-to-one with `User`.

## Entity: LoginAttemptBackoff

- Purpose: Enforces progressive delay after repeated failed logins by account + IP.
- Fields:
  - `id` (uuid, primary key)
  - `email_key` (text, normalized email or opaque key)
  - `ip_address` (inet/text)
  - `failure_count` (integer)
  - `next_allowed_at` (timestamptz)
  - `last_failed_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
- Validation Rules:
  - Composite uniqueness on (`email_key`, `ip_address`).
  - Delay schedule increases with `failure_count`, with optional capped maximum.
  - Successful login resets or decays counters.

## State Transitions

## User authentication lifecycle

- `Unregistered` -> `Registered`: successful `POST /auth/register`.
- `Registered` -> `Authenticated`: successful `POST /auth/login` issues JWT + session metadata.
- `Authenticated` -> `Expired`: session reaches `expires_at`.
- `Authenticated` -> `Revoked`: password reset success increments `token_version` and marks active sessions revoked.

## Password reset lifecycle

- `Issued` -> `Used`: valid reset token consumed by `POST /auth/password-reset/confirm`.
- `Issued` -> `Expired`: current time exceeds `expires_at`.
- `Issued` -> `Invalidated`: superseded or revoked by newer reset event.

## Backoff lifecycle

- `NoPenalty` -> `Delayed`: failed login threshold reached.
- `Delayed` -> `IncreasedDelay`: additional consecutive failures.
- `Delayed` -> `NoPenalty`: successful login or decay policy elapsed.
