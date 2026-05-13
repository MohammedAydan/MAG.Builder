import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  test: {
    environment: "node",
    include: [
      "src/**/*.test.ts"
    ],
    env: {
      NODE_ENV: "test",
      PAYLOAD_SECRET: "vitest-test-secret",
      DATABASE_URL: "postgres://localhost:5432/nexpress_test",
      NEXPRESS_INSTALLATION_MODE: "wizard",
      NEXPRESS_DEFAULT_SITE_NAME: "NexPress Test",
      SEED_ADMIN_EMAIL: "test-admin@example.com",
      SEED_ADMIN_PASSWORD: "test-password-123",
    }
  }
});
