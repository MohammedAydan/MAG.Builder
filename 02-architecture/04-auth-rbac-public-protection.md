# Auth, RBAC, and Public Route Protection

## Admin auth

Admin/content users use Payload Auth integration. NexPress wraps it with a permission engine.

## Permission model

- role-based permissions;
- scoped API keys;
- module capability checks;
- route-level server checks;
- action-level checks for mutations.

## Public users

Public members/customers are separate from admin users where necessary. Public route protection must never reuse admin-only assumptions.

## Rules

- Never authorize only in client components.
- Never trust hidden buttons.
- Always validate current user/session on the server.
