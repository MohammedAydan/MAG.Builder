# Data Model Overview

## Core tables/collections

- users
- roles
- permissions
- sessions/tokens
- audit_logs
- settings
- installation_state
- modules
- plugins
- themes
- media
- pages
- posts
- content_types
- content_entries
- builder_documents
- reusable_sections
- redirects
- menus
- api_keys
- webhooks
- mcp_tool_calls

## Commerce tables/collections through adapter

- products
- variants
- carts
- orders
- customers
- payments
- shipping/tax regions
- discounts

## Migration rule

Every schema change must include a migration, test seed, rollback/forward notes, and backup compatibility note.
