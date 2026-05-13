# Testing Strategy

## Test layers

- Unit: schema validators, permission helpers, builder renderer.
- Integration: Payload collections, DB migrations, API route handlers.
- Contract: OpenAPI schema and API responses.
- E2E: install wizard, admin login, page creation, builder render, checkout test mode.
- Security: authorization bypass tests, upload validation, rate limit tests.

## Rule

No phase is done if its acceptance criteria are untested or manually verified without documentation.
