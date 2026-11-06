import { defineConfig } from "@playwright/test";
import base from "../../playwright.config";

// Explicit isolated verification when another worktree owns the shared default port.
export default defineConfig({
  ...base,
  testDir: ".",
  testMatch: "mock-api.spec.ts",
  use: { ...base.use, baseURL: "http://127.0.0.1:3107" },
  webServer: {
    command: "npm run start -- -p 3107",
    url: "http://127.0.0.1:3107",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
