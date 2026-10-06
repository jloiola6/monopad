import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv(path = resolve(process.cwd(), ".env")) {
  try {
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match || process.env[match[1]] !== undefined) continue;
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

export function getConfig() {
  loadEnv();
  const port = Number(process.env.MONOPAD_PORT || 8787);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("MONOPAD_PORT is invalid");
  return {
    host: process.env.MONOPAD_HOST || "127.0.0.1",
    port,
    accessToken: process.env.MONOPAD_ACCESS_TOKEN || "",
    monoUrl: (process.env.MONOCODE_HOST_URL || "http://127.0.0.1:3774").replace(/\/$/, ""),
    monoToken: process.env.MONOCODE_DEVICE_TOKEN || "",
    demo: process.env.MONOPAD_DEMO === "true"
  };
}
