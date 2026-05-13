import { readFileSync } from "node:fs";

const tsconfig = JSON.parse(readFileSync("tsconfig.base.json", "utf8"));

if (tsconfig.compilerOptions?.strict !== true) {
  throw new Error("typecheck: tsconfig.base.json must enable strict mode");
}

console.log("typecheck: bootstrap TypeScript configuration verified");
