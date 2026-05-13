---
applyTo: "packages/commerce/**/*.{ts,tsx},plugins/commerce-pack/**/*.{ts,tsx}"
---

# Commerce Instructions

Commerce must remain optional and isolated behind adapters. Do not couple the CMS kernel directly to Medusa internals. Test with commerce disabled.
