# MCP Gateway

## Purpose

Expose safe business-level actions to AI agents and automation tools.

## v1 tools

Start read-only:

- get_site_summary
- list_pages
- get_page
- list_plugins
- list_themes
- list_products
- get_order_summary

Mutation tools require explicit approval policies and audit logs.

## Forbidden tools

- raw shell;
- raw SQL;
- arbitrary filesystem;
- arbitrary HTTP proxy;
- unrestricted admin impersonation.
