# MCP Tools Matrix

| Tool | Phase | Default | Required scope | Mutates? | Notes |
|---|---:|---|---|---:|---|
| get_site_summary | 21 | enabled when MCP enabled | mcp:read | no | Safe overview |
| list_pages | 21 | enabled when MCP enabled | mcp:read content:read | no | Respects permissions |
| get_page | 21 | enabled when MCP enabled | mcp:read content:read | no | No drafts without permission |
| list_plugins | 21 | enabled when MCP enabled | mcp:read | no | No secrets |
| list_themes | 21 | enabled when MCP enabled | mcp:read | no | No raw files |
| list_products | 21 | if commerce active | mcp:read commerce:read | no | Public product fields only |
| create_draft_page | later | disabled | mcp:write content:write | yes | Approval required |
| publish_page | later | disabled | mcp:write content:write | yes | Approval required |
