# API Platform

## Requirements

- REST APIs through route handlers;
- OpenAPI 3.1 source of truth;
- Zod validation;
- scoped API keys;
- consistent error shape;
- pagination/filtering conventions;
- rate limiting;
- webhook signing;
- SDK generation later.

## Error shape

All public API errors use:

```json
{ "error": { "code": "STRING_CODE", "message": "Human readable", "details": {} } }
```
