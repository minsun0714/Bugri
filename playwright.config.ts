import { defineConfig, devices } from "@playwright/test";

const port = Number(
  process.env.PLAYWRIGHT_PORT ??
    process.env.E2E_PORT ??
    "3107",
);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(
    "PLAYWRIGHT_PORT must be an integer between 1 and 65535.",
  );
}

const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",

  use: {
    baseURL,
    locale: "ko-KR",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],

  webServer: {
    command: `BUGRI_UI_PREVIEW=1 npm run build && npm run start -- --hostname 127.0.0.1 -p ${port}`,
    wait: {
      stdout: /Ready in/,
    },
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
