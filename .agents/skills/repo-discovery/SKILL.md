---
name: repo-discovery
description: Inspect and understand a codebase before making a non-trivial change, when entering an unfamiliar repository, or when prior context may be stale. Use this to map architecture and current state; do not use it for a trivial one-file edit whose context is already clear.
---

# Repository discovery

Build a concise, evidence-based understanding of the repository before proposing implementation changes.

## Workflow

1. Read applicable `AGENTS.md` files from the repository root down to the target area. Follow the closest relevant instructions.
2. Inspect `git status --short` and the current branch. Preserve all existing changes; never assume the working tree is clean.
3. Identify the stack and entry points from actual files: package/build manifests, application bootstrap, routes, configuration, and test setup.
4. Trace the part of the application relevant to the request. Follow the real call path rather than inferring architecture from folder names alone.
5. Identify established patterns for state, API access, validation, errors, persistence, styling, and tests.
6. Find existing tests and the appropriate verification commands. Note missing or unreliable checks.
7. Separate confirmed facts from assumptions and unknowns.

## Report

Give a compact map containing:

- Stack and important scripts/commands.
- Relevant files and the real execution/data flow.
- Existing conventions worth preserving.
- Relevant tests and checks.
- Git state or pre-existing changes that constrain the edit.
- The smallest sensible next implementation step.

Do not produce a generic architecture essay. Do not edit files during pure discovery. If the user requested implementation as well, finish discovery and proceed with the smallest appropriate next step without asking for confirmation unless a material decision is unresolved.
