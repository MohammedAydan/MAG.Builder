import { readFileSync } from "node:fs";

const workspace = readFileSync("pnpm-workspace.yaml", "utf8");

for (const entry of ["apps/*", "packages/*", "templates/*", "plugins/*"]) {
  if (!workspace.includes(entry)) {
    throw new Error(`build: workspace missing ${entry}`);
  }
}

console.log("build: workspace manifest verified");
