# Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Scope too large | High | Phase gates, MVP levels, one phase per session |
| Builder complexity | High | Own schema, use Puck as adapter, test renderer early |
| Plugin security | High | No runtime JS in v1, manifest validation, signed marketplace later |
| Commerce complexity | High | Adapter/service boundary, spike before MVP |
| Agent drift | High | Tool-specific instruction files, status file, phase prompts |
| Next.js/Payload changes | Medium | Agents must check official docs during implementation |
| Multi-tenancy bugs | High | Do not enable SaaS until boundaries are explicit and tested |
