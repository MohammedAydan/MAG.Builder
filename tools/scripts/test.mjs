import { existsSync, readFileSync } from "node:fs";

const implementationStatus = readFileSync("IMPLEMENTATION_STATUS.md", "utf8");

if (!existsSync("plans/context.md")) {
  throw new Error("test: plans/context.md is missing");
}

if (!implementationStatus.includes("Phase 00")) {
  throw new Error("test: IMPLEMENTATION_STATUS.md is missing Phase 00 tracking");
}

if (!implementationStatus.includes("No product features implemented yet")) {
  throw new Error("test: Phase 00 guardrail text is missing");
}

console.log("test: bootstrap status artifacts verified");
