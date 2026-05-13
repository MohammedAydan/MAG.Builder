# Security Baseline

Security is mandatory from the first phase.

## Controls

- strict env validation;
- secure headers and CSP;
- CSRF protections where applicable;
- session hardening;
- server-side authorization;
- API scopes;
- rate limits;
- audit logs;
- webhook signature verification;
- dependency scanning;
- safe file upload validation;
- secret redaction in logs.

## Rule

If a feature cannot be shipped safely, it must ship disabled or behind a feature flag.
