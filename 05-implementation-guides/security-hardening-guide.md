# Security Hardening Guide

## Mandatory controls

- Strict TypeScript.
- Input validation with Zod.
- Server-side permission checks.
- Secure headers/CSP.
- CSRF protection for cookie-based mutations.
- Rate limiting on public APIs and auth endpoints.
- Upload MIME/size validation.
- Webhook signature verification.
- Audit critical writes.
- Dependency scanning.

## Dangerous patterns

- raw SQL from request body;
- direct filesystem path from user input;
- plugin code execution from admin upload;
- MCP tools that proxy arbitrary commands;
- trusting client-side role values.
