# ADR 0001 — Greenfield Next.js + Payload + Owned Builder Schema

## Status

Accepted.

## Context

NexPress needs CMS, admin, builder, commerce, APIs, and AI automation without inheriting WordPress-style runtime plugin risks.

## Decision

Use Next.js App Router, Payload CMS, and an owned builder schema. Use Puck as editor adapter. Use commerce behind an adapter/service boundary.

## Consequences

- More upfront architecture work.
- Safer long-term extensibility.
- Less vendor lock-in for builder data.
