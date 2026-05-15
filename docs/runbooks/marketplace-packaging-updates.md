# Marketplace, Packaging, and Updates Runbook

## Overview

Phase 24 adds the first safe marketplace, packaging, and update-planning foundation for NexPress.

This phase introduces:

- a typed `@nexpress/marketplace` workspace package
- a versioned local package manifest schema
- a local allowlisted catalog with plugin, theme, and template package metadata
- compatibility checks for platform version, package type, capabilities, dependencies, and conflicts
- integrity metadata validation for checksums, signatures, provenance placeholders, and SBOM references
- dry-run install, update, enable, and disable planning
- admin-only package catalog and plan route handlers

This phase does not add remote marketplace fetches, runtime package installs, npm/pnpm execution, auto-update execution, package payments, public publishing, arbitrary code loading, or MCP mutation tools.

## Local package model

- Only local allowlisted package metadata is registered in `packages/marketplace/src/local-catalog.ts`
- Package ids are normalized kebab-case strings and are type-prefixed to reduce collisions
- Package types are allowlisted:
  - `plugin`
  - `theme`
  - `template`
  - `integration`
- Manifest data is metadata only and rejects:
  - scripts
  - shell commands
  - remote URLs
  - unsafe HTML/script markers
  - secrets and protected config keys

## Manifest schema

- Schema id: `nexpress-package-manifest`
- Manifest version: `1`
- Compatibility requires:
  - `platform: "nexpress"`
  - `packageApiVersion: 1`
  - `platformVersionRange`
  - `scopeMode`
- Integrity requires:
  - at least one declared artifact
  - an allowlisted checksum algorithm
  - local registry metadata
  - installable flag

Supported integrity metadata:

- checksums: `sha256`, `sha384`, `sha512`
- signature metadata: `catalog-attestation`, `cosign`, `minisign`
- SBOM metadata: `spdx-json`, `cyclonedx-json`
- provenance placeholders: `builderId`, `buildType`, `sourceRepository`

Install planning rejects artifacts that are unsigned, unverified, or missing required integrity metadata.

## Catalog foundation

- The catalog is local-only and built in-process from allowlisted metadata
- The initial catalog includes:
  - plugin package entries derived from local plugin manifests
  - a default theme package entry
  - a starter template package entry
- The catalog exposes read-only listing and version selection helpers
- No remote registry fetch, package-manager execution, or file writes occur in Phase 24

## Compatibility and planning

`@nexpress/marketplace` exposes:

- `evaluatePackageCompatibility()`
- `assessPackageIntegrity()`
- `createMarketplacePlan()`

The planner is dry-run only and supports:

- `install`
- `update`
- `enable`
- `disable`

Planner guarantees:

- no code execution
- no package-manager commands
- no file writes
- no database writes
- dependency/conflict checks before a plan is considered ready

## Web API surface

Admin-only route handlers:

- `GET /api/marketplace/packages`
- `POST /api/marketplace/plans`

Behavior:

- both routes require a dashboard-authenticated admin-capable user
- listing returns only safe catalog metadata plus installed/enabled status where known
- plan generation always returns a dry-run response
- plan generation writes an audit log entry with safe package identifiers only

## RBAC and audit

Phase 24 adds:

- `marketplace:read`
- `marketplace:manage`

Audit action added:

- `marketplace.package.plan.created`

Audit metadata records only:

- action
- package id
- requested channel
- dry-run flag
- plan status
- target version

## Payload, migrations, and types

- Phase 24 adds no Payload collections
- No Payload type regeneration was required
- No live database migration file was required

## OpenAPI and MCP

- OpenAPI now documents the admin-only marketplace list and dry-run planning endpoints
- No MCP tools were added or changed in Phase 24

## Known gaps

- signature verification is metadata-driven only; no external trust-root or key-management flow exists yet
- provenance and SBOM checks validate presence and shape, not artifact contents
- package planning is local-only and does not execute install, update, enable, or disable operations
- no dedicated dashboard marketplace UI was added
- plugin installation remains local/allowlisted and activation remains a separate plugin-management flow
