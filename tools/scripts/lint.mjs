import { statSync } from "node:fs";

const requiredPaths = [
  "package.json",
  "pnpm-workspace.yaml",
  "turbo.json",
  "tsconfig.base.json",
  "apps/web",
  "packages/cms",
  "packages/builder-core",
  "packages/commerce",
  "IMPLEMENTATION_STATUS.md"
];

for (const path of requiredPaths) {
  statSync(path);
}

console.log("lint: bootstrap structure verified");
