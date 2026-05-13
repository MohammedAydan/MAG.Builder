# Module Activation Matrix

| Module | Depends on | Can disable? | Notes |
|---|---|---:|---|
| Kernel | none | no | Always on |
| CMS | Kernel | no for v1 | Core product capability |
| Builder | CMS | no for v1 | Public renderer is core |
| SEO | CMS | yes | Should be enabled by default |
| Forms | CMS + Builder | yes | Optional pack |
| Membership | Kernel | yes | Required for protected public routes |
| Commerce | Kernel + CMS + Builder | yes | Optional NexCommerce pack |
| API | Kernel | yes for public API | Internal APIs remain |
| MCP | Kernel + API scopes | yes | Disabled by default |
| Analytics | Kernel | yes | Adapter-based |
