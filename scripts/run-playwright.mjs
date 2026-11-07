import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

export async function findAvailablePort(start) {
  if (
    !Number.isInteger(start) ||
    start < 1 ||
    start > 65535
  ) {
    throw new Error(
      "E2E port must be an integer between 1 and 65535.",
    );
  }
  for (let port = start; port <= 65535; port++) {
    const available = await new Promise(
      (resolve, reject) => {
        const server = createServer();
        server.once("error", (error) => {
          if (error.code === "EADDRINUSE") resolve(false);
          else reject(error);
        });
        server.listen(port, "127.0.0.1", () =>
          server.close(() => resolve(true)),
        );
      },
    );
    if (available) return port;
  }
  throw new Error(
    `No available E2E port from ${start} to 65535.`,
  );
}

export function isPortConflict(output, port) {
  if (/Running \d+ tests? using/.test(output)) return false;
  return (
    output.includes(
      `http://127.0.0.1:${port} is already used`,
    ) ||
    (output.includes("EADDRINUSE") &&
      output.includes(`127.0.0.1:${port}`))
  );
}

async function run(port, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        fileURLToPath(
          import.meta.resolve("@playwright/test/cli"),
        ),
        "test",
        ...args,
      ],
      {
        env: {
          ...process.env,
          PLAYWRIGHT_PORT: String(port),
        },
        stdio: ["inherit", "pipe", "pipe"],
      },
    );
    let output = "";
    let started = false;
    const capture = (chunk, stream) => {
      stream.write(chunk);
      output = (output + chunk.toString()).slice(-65536);
      started ||= /Running \d+ tests? using/.test(output);
    };
    child.stdout.on("data", (chunk) =>
      capture(chunk, process.stdout),
    );
    child.stderr.on("data", (chunk) =>
      capture(chunk, process.stderr),
    );
    const interrupt = () => child.kill("SIGINT");
    const terminate = () => child.kill("SIGTERM");
    process.once("SIGINT", interrupt);
    process.once("SIGTERM", terminate);
    const cleanup = () => {
      process.off("SIGINT", interrupt);
      process.off("SIGTERM", terminate);
    };
    child.once("error", (error) => {
      cleanup();
      reject(error);
    });
    child.once("close", (code, signal) => {
      cleanup();
      resolve({
        code: code ?? (signal === "SIGINT" ? 130 : 1),
        conflict:
          !signal &&
          !started &&
          isPortConflict(output, port),
      });
    });
  });
}

async function main() {
  let start = Number(
    process.env.PLAYWRIGHT_PORT ??
      process.env.E2E_PORT ??
      "3107",
  );
  while (true) {
    const port = await findAvailablePort(start);
    console.log(`[E2E] requested ${start}, using ${port}`);
    const result = await run(port, process.argv.slice(2));
    if (
      result.code !== 0 &&
      result.conflict &&
      port < 65535
    ) {
      // Another process may acquire the selected port while Next builds.
      start = port + 1;
      continue;
    }
    process.exitCode = result.code;
    return;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
