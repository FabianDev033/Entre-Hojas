---
name: systematic-debugging
description: Diagnose and fix a bug, runtime failure, failing test, incorrect output, or unexpected behavior using evidence and controlled experiments. Use instead of guessing or applying broad speculative fixes.
---

# Systematic debugging

Find the cause before changing the code. Make the smallest fix that addresses the demonstrated failure.

## Workflow

1. **Capture the symptom.** Record the exact error, reproduction steps, expected behavior, actual behavior, and affected environment when available.
2. **Reproduce or trace it.** Run the narrowest relevant test or command. Inspect the stack trace, logs, network response, database state, and call path as appropriate.
3. **Form ranked hypotheses.** Tie each hypothesis to evidence. Identify the next low-cost observation or experiment that can distinguish them.
4. **Test one hypothesis at a time.** Avoid changing several unrelated things at once. Do not shotgun-edit configuration, dependencies, or multiple layers.
5. **Identify the root cause.** Distinguish the original failure from downstream symptoms and incidental warnings.
6. **Apply a focused fix.** Preserve existing architecture and behavior outside the affected path.
7. **Add or update a regression test** when practical. Re-run the reproduction and relevant broader checks.
8. **Report evidence.** Explain the root cause, what changed, the checks performed, and anything that remains uncertain.

## Guardrails

- Do not delete data, reset environments, regenerate lockfiles, or change dependency versions as a first diagnostic step.
- Do not weaken validation, authentication, typing, or tests merely to make an error disappear.
- Do not label a guess as a root cause. If the issue cannot be reproduced, state what evidence supports the proposed fix and what remains unverified.
