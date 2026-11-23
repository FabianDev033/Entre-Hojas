---
name: responsive-interface
description: Create or modify frontend pages, components, layouts, forms, and interactions with responsive behavior and accessibility considered from the start. Use for UI implementation; not for backend-only work.
---

# Responsive interface workflow

Build an interface that fits the existing product, works on small screens first, and remains usable at larger sizes.

## Workflow

1. Inspect the current page, component tree, routing, shared layout, design tokens, and nearby UI patterns. Check whether the project already has a component library or styling conventions.
2. Identify the user task and the information hierarchy. Decide what matters most, what can move or collapse on small screens, and what must remain immediately accessible.
3. Implement the narrow/mobile layout first. Add larger breakpoints to improve the composition rather than simply stretching the mobile screen.
4. Reuse existing components and tokens. Keep spacing, typography, color, radius, and interaction patterns consistent with the project.
5. Include relevant states: loading, empty, error, disabled, success, validation, and long-content behavior.
6. Check accessibility: semantic elements, labels, keyboard access, visible focus, contrast, touch target size, and meaningful feedback. Do not make color the only signal.
7. Verify at narrow and wide viewport sizes using available browser tools, screenshots, or tests. If visual verification is unavailable, state that clearly and still run relevant code checks.
8. Inspect the diff for brittle fixed widths, overflow, duplicated styles, unnecessary dependencies, and desktop-only assumptions.

## Design defaults

- Favor clear hierarchy, restrained visual styling, and purposeful details over decoration.
- Prefer content-driven sizing and flexible layouts. Use fixed dimensions only when the design genuinely requires them.
- Keep important actions reachable on mobile. Do not hide critical functionality behind hover-only interactions.
- Handle long labels, empty content, large numbers, and validation messages without breaking the layout.
- Respect the project's existing visual identity. Do not introduce a new palette, font system, or component library without a reason.

## Report

State which screens/components changed, the responsive behavior considered, accessibility details worth noting, and which viewport or visual checks were actually performed.
