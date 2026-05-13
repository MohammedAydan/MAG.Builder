#!/usr/bin/env bash
set -euo pipefail

mkdir -p apps/web packages/{config,db,auth,cms,builder-core,builder-editor,themes,plugins,commerce,api-contracts,mcp-gateway,observability,security,shared} plugins/{blog-pack,forms-pack,seo-pack,commerce-pack,membership-pack} templates/{starter-site,ecommerce-site,blog-site} docs/{product,architecture,decisions,runbooks,api,mcp} tools/{scripts,generators,seed}

touch apps/web/.gitkeep packages/config/.gitkeep packages/db/.gitkeep packages/auth/.gitkeep packages/cms/.gitkeep packages/builder-core/.gitkeep packages/builder-editor/.gitkeep packages/themes/.gitkeep packages/plugins/.gitkeep packages/commerce/.gitkeep packages/api-contracts/.gitkeep packages/mcp-gateway/.gitkeep packages/observability/.gitkeep packages/security/.gitkeep packages/shared/.gitkeep
