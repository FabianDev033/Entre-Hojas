---
name: incremental-implementation
description: Plan and implement a feature or multi-file change in small, understandable, verifiable increments. Use when a request spans multiple components or layers; do not use for simple explanations or tiny isolated edits.
---

# Incremental implementation

Deliver working software in reviewable slices while keeping the developer informed and in control.

## Workflow

1. Confirm the expected behavior and acceptance criteria from the request and existing product behavior. Do not invent requirements.
2. Inspect the relevant code and Git state. Reuse the project's established patterns unless there is concrete evidence they are unsuitable.
3. Identify dependencies between layers and choose the smallest vertical slice that produces a meaningful result.
4. Briefly state the implementation sequence for medium or large work. Avoid lengthy planning for a straightforward change.
5. Implement one coherent slice. Keep unrelated cleanup and speculative improvements out of the diff.
6. Verify the slice using the narrowest relevant checks, then inspect the diff for accidental changes and edge cases.
7. Continue to the next slice when it is clearly implied and safe. Pause only for a consequential product, architecture, security, or data decision that cannot be inferred.
8. Finish with a concise report of behavior changed, key decisions, checks run, and remaining work.

## Quality rules

- Prefer vertical, user-visible progress over broad scaffolding that does not work end to end.
- Keep types, API contracts, validation, error handling, and UI states consistent across layers.
- Avoid introducing abstractions before a real repeated need exists.
- Do not silently change existing behavior outside the requested scope.
- Do not claim completion while relevant tests, builds, or migrations remain broken or unverified.

## Collaboration

Explain non-obvious decisions and useful concepts, but do not turn each edit into a tutorial. When multiple approaches are valid, recommend one and state the meaningful trade-off. Let the developer review and understand the change instead of overwhelming them with a large code dump.
