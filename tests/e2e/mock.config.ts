import { defineConfig } from "@playwright/test";
import base from "../../playwright.config";

// Focused mock-service run using the same configurable port as the full pipeline.
export default defineConfig({
  ...base,
  testDir: ".",
  testMatch: "mock-api.spec.ts",
});
