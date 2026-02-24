# API Migration Plan by Page (Single Endpoint Strategy)

## Objective

Move UI pages from in-memory mocks to backend API calls without creating many endpoints.

## Endpoint Strategy

Use one Lambda endpoint (`POST /api`) with action dispatch:

- Request shape: `{ "resource": "...", "action": "...", "payload": {...} }`
- Response shape: `{ "success": true, "data": ... }` or `{ "success": false, "error": { ... } }`

This keeps route count small while still allowing page-level growth.

## Phase 1 (Implemented)

### Login page

- Actions:
  - `auth.profiles`
  - `auth.login`
  - `auth.oauthLogin`
- UI impact:
  - Login screen now requests profiles from API.
  - Profile login and OAuth login call API instead of local timeouts.

### `/test-data` page

- Actions:
  - `testData.list`
  - `testData.create`
  - `testData.update`
  - `testData.delete`
  - `testData.bulkDelete`
  - `testData.recondition`
- UI impact:
  - Initial inventory load comes from API mock dataset.
  - Create/edit/delete/recondition flows call API first, then sync UI store.

## Phase 2 (Next)

### `/tests` page

- Add `tests.*` actions for list/detail/create/update/delete.
- Keep existing filters and pagination client-side first; move server-side later if needed.

### `/execution` page

- Add `execution.*` actions for cart operations, run estimation, and YAML generation metadata.
- Keep long-running execution as async job model in a future step.

## Phase 3 (Admin/Settings)

### `/settings/system`

- Add `config.*` actions for catalog and runtime configuration.

### `/settings/users`

- Add `users.*` and `permissions.*` actions.

## Guardrails

- Keep one endpoint (`/api`) and grow by action namespaces.
- Keep action payloads typed in both UI and API packages.
- When replacing mocks, keep response contracts stable to avoid UI regressions.
