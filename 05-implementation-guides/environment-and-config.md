# Environment and Config

## Required env classes

- database URL;
- app URL;
- auth/session secrets;
- storage provider;
- email provider;
- queue provider;
- observability provider;
- MCP enablement flag;
- commerce service URL/token if commerce service is separated.

## Rules

- `.env.example` must contain placeholders only.
- Secrets must be validated at boot.
- Logs must redact secrets.
- Never commit `.env`.
