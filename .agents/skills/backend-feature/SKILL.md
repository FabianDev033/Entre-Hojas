---
name: backend-feature
description: Add or modify backend behavior involving APIs, controllers, services, domain rules, persistence, integrations, or database changes. Use for end-to-end backend work, especially when multiple records or layers are involved.
---

# Backend feature workflow

Implement backend behavior as a consistent contract from the HTTP boundary through business rules to persistence.

## Workflow

1. Inspect the existing backend structure, conventions, schema/models, migrations, routes, tests, and applicable instructions. Do not impose a new architecture on an established project.
2. Trace the current request/data flow and identify the correct ownership of each responsibility.
3. Define the externally visible contract: request shape, response shape, status codes, validation failures, authorization, and relevant error behavior.
4. Place responsibilities appropriately for the existing architecture:
   - Routes define endpoint wiring.
   - Controllers/adapters handle transport concerns and map inputs/outputs.
   - Services/use cases coordinate application behavior.
   - Domain logic enforces business invariants where the project has a domain layer.
   - Repositories/adapters handle persistence and external systems.
5. Validate input at the boundary and enforce business rules on the server. Never rely on client-side checks for correctness or authorization.
6. Check consistency and failure cases. If multiple writes must succeed or fail together, use the project's transaction mechanism. Consider duplicate requests, concurrent updates, missing records, and rollback behavior when relevant.
7. Make schema changes through the established migration process. Inspect existing data and migration conventions; do not run destructive or production migrations without explicit authorization.
8. Add focused tests for success, validation, authorization, not-found, conflict, and transaction/rollback paths as relevant.
9. Run the narrowest tests first, then type checks/lint/build or the relevant integration suite. Inspect the final diff.

## Design guidance

- Keep controllers thin and avoid putting business rules in route handlers or ORM hooks unless that is the established, justified design.
- Avoid N+1 queries and unnecessary database round trips. Prefer explicit, appropriately scoped queries and joins when they improve the actual access pattern.
- Do not leak ORM models or internal exceptions through public API contracts without a deliberate project convention.
- Keep response and error shapes consistent with neighboring endpoints.
- Do not introduce generic repository/service layers just for architectural appearance.

## Report

Summarize the endpoint or behavior, the layers touched, data-integrity implications, tests run, and any migration or deployment steps that remain.
