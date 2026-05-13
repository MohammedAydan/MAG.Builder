# Greenfield Bootstrap Guide

## Phase 00 target

Create the workspace with zero product feature implementation.

## Expected commands

```bash
pnpm init
pnpm add -D turbo typescript eslint prettier vitest
```

Use the current recommended create-next-app flow for `apps/web`. If package versions have changed, check official docs during implementation.

## Required scripts

Root package should eventually expose:

```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "format": "prettier --write ."
  }
}
```
