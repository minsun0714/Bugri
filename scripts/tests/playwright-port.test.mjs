import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:net";
import {
  findAvailablePort,
  isPortConflict,
} from "../run-playwright.mjs";

async function listen(port) {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
  return server;
}

const close = (server) =>
  new Promise((resolve) => server.close(resolve));

test("increments occupied ports without reusing or stopping their servers", async () => {
  let start = await findAvailablePort(43107);
  while ((await findAvailablePort(start + 1)) !== start + 1)
    start = await findAvailablePort(start + 2);
  const first = await listen(start);
  const second = await listen(start + 1);
  try {
    const selected = await findAvailablePort(start);
    assert.equal(
      selected,
      await findAvailablePort(start + 2),
    );
    assert.ok(selected >= start + 2);
    assert.equal(first.listening, true);
    assert.equal(second.listening, true);
    const reserved = await listen(selected);
    await close(reserved);
  } finally {
    await close(first);
    await close(second);
  }
});

test("rejects invalid port input", async () => {
  for (const port of [0, -1, 65536, 1.5, NaN])
    await assert.rejects(findAvailablePort(port), /port/i);
});

test("only retries a server startup conflict, never a failed test", () => {
  assert.equal(
    isPortConflict(
      "Error: http://127.0.0.1:3107 is already used",
      3107,
    ),
    true,
  );
  assert.equal(
    isPortConflict(
      "Error: http://127.0.0.1:3108 is already used",
      3107,
    ),
    false,
  );
  assert.equal(
    isPortConflict(
      "Running 1 test using 1 worker\nError: http://127.0.0.1:3107 is already used",
      3107,
    ),
    false,
  );
  assert.equal(
    isPortConflict(
      "1 failed\nExpected 3, received 2",
      3107,
    ),
    false,
  );
});
