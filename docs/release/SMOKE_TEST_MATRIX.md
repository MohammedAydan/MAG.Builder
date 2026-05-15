# Final Smoke Test Matrix

This matrix is the Phase 27 release-candidate sanity baseline. It documents the expected behavior of the current route surface without claiming full browser E2E automation.

## Public Route Sanity

| Route | Expected result | Notes |
|---|---|---|
| `/` | 200 | Public homepage renders with public shell. |
| `/[slug]` | 200 for published public pages, 404 otherwise | Drafts and unauthorized members-only pages must not render anonymously. |
| `/journal/[slug]` | 200 for published visible posts, 404 otherwise | Sitemap/search should stay aligned with visibility. |
| `/login` | 200 | Public member login page renders. |
| `/signup` | 200 | Public member signup page renders without admin role assignment. |
| `/account` | 200 for authenticated members, redirect or denial for anonymous users | Member-only route. |
| `/install` | 200 before install or guarded after install | Must not leak secrets or bypass install checks. |
| `/robots.txt` | 200 | Static machine-readable response. |
| `/sitemap.xml` | 200 | Must omit private or draft content. |

## Admin and Dashboard Sanity

| Route | Expected result | Notes |
|---|---|---|
| `/admin` | 200 for authenticated dashboard/admin users, auth challenge otherwise | Payload admin entrypoint remains protected. |
| `/dashboard` | 200 for authorized dashboard users, redirect or denial otherwise | Project-owned shell must stay server-guarded. |
| `/dashboard/settings` | 200 for authorized users | Settings shell remains protected. |
| `/dashboard/pages` | 200 for authorized users | Page listing must remain protected. |
| `/dashboard/pages/[id]/builder` | 200 for authorized users | Builder editor route remains draft/editor-only. |
| `/dashboard/pages/[id]/preview` | 200 for authorized users | Preview route must not publish drafts publicly. |

## API Route Sanity

| Route | Method | Expected result | Notes |
|---|---|---|---|
| `/api/health` | `GET` | 200 | Simple health response. |
| `/api/readiness` | `GET` | 200 or 503 | No secrets in body; readiness must be non-cacheable. |
| `/api/openapi.json` | `GET` | 200 | OpenAPI stays aligned with current JSON API subset. |
| `/api/search` | `GET` | 200 | Must exclude drafts, private content, and cross-site leakage. |
| `/api/analytics/summary` | `GET` | 401/403 for anonymous, 200 for authorized admins | Admin-only aggregate endpoint. |
| `/api/mcp` | `POST` | 401 for anonymous, 200 for authorized scoped users | Safe bounded tool surface only. |
| `/api/webhooks/inbound` | `POST` | 400/401/404 on invalid requests, 200 on valid signed requests | Must not expose webhook secrets. |
| `/api/forms/[formId]/public` | `GET` | 200 or 404 | Safe public form schema only. |
| `/api/forms/[formId]/submit` | `POST` | 200/422/429 | Validates payload and rate limits requests. |
| `/api/commerce/products` | `GET` | 200 | Public safe product projections only. |
| `/api/commerce/cart` | `POST` | 201 for authenticated members when enabled, fail closed otherwise | Creates a member cart. |
| `/api/marketplace/packages` | `GET` | 401/403 for unauthorized users, 200 for authorized admins | Read-only local allowlist catalog. |
| `/api/marketplace/plans` | `POST` | 401/403/400 or 200 | Dry-run only; no mutation side effects. |

## Auth and Membership Boundary Sanity

| Check | Expected result |
|---|---|
| Public members cannot access `/admin` or `/dashboard` | Enforced server-side |
| Public signup cannot assign admin/editor/super-admin roles | Enforced server-side |
| Anonymous users cannot access members-only content | Enforced in public content filters |
| Draft content is not public | Enforced in public content rendering and route helpers |
| Member profile updates use authenticated member context only | Enforced by server-side member session checks |

## Multi-site Sanity

| Check | Expected result |
|---|---|
| Hostname resolution stays server-side | `host` or trusted `x-forwarded-host` only when enabled |
| Unknown mapped production hosts fail closed | No accidental fallback across configured production domains |
| Default-site fallback is limited to allowed scenarios | Legacy/default behavior only |
| Search, analytics, automation, forms, members, commerce, and content reads remain site-aware | No cross-site leakage |

## Performance and Accessibility Review Targets

| Area | Release-candidate expectation |
|---|---|
| Performance | Capture homepage and key route timings in the target environment before GA; this repo does not claim final production Web Vitals from local verification alone. |
| Accessibility | Run automated scans plus manual keyboard and auth-flow checks in the target environment before GA. |
