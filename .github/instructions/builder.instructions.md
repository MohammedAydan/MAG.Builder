---
applyTo: "packages/builder-*/**/*.{ts,tsx},apps/web/**/*builder*.{ts,tsx}"
---

# Builder Instructions

The builder-core schema is the source of truth. Puck is an editor adapter only. Public rendering must accept validated NexPress builder documents and must not depend on editor-only state.
