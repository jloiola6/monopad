import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";
import { spawn } from "node:child_process";
import { getConfig } from "./config.js";
import { MonoCodeClient } from "./monocode-client.js";

const config = getConfig();
const publicDir = resolve(fileURLToPath(new URL("../public", import.meta.url)));
const client = new MonoCodeClient({ baseUrl: config.monoUrl, token: config.monoToken, demo: config.demo });
const sockets = new Set();
const socketIds = new WeakMap();
let nextSocketId = 1;
const terminals = new Map();
const nativePty = await import("node-pty").then((module) => module.default).catch(() => null);
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2" };

function json(response, status, value) {
  response.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  response.end(JSON.stringify(value));
}

function tailscaleIdentity(request) {
  const value = request.headers["tailscale-user-login"];
  return typeof value === "string" && value.length > 0 ? value : null;
}
function authenticated(request) {
  const header = request.headers.authorization;
  return Boolean(tailscaleIdentity(request) || (config.accessToken && header === `Bearer ${config.accessToken}`));
}

async function serveStatic(request, response) {
  const url = new URL(request.url, "http://localhost");
  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  const file = normalize(join(publicDir, requested));
  if (!file.startsWith(publicDir)) return json(response, 404, { error: "Not found" });
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error("not a file");
    const cache = requested === "/sw.js" || requested.endsWith(".html") ? "no-cache" : "public, max-age=3600";
    response.writeHead(200, { "Content-Type": mime[extname(file)] || "application/octet-stream", "Cache-Control": cache, "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'self'; connect-src 'self' ws: wss:; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'; base-uri 'none'" });
    response.end(await readFile(file));
  } catch { json(response, 404, { error: "Not found" }); }
}

const server = createServer(async (request, response) => {
  if (request.url === "/api/session") {
    const identity = tailscaleIdentity(request);
    return json(response, 200, { authenticated: authenticated(request), mode: identity ? "tailscale" : "token", identity });
  }
  if (request.url === "/api/health") {
    try {
      const environment = await client.describe();
      return json(response, 200, { ok: true, mode: config.demo ? "demo" : "monocode", environment: environment.name });
    } catch (error) { return json(response, 503, { ok: false, error: error.message }); }
  }
  if (request.url === "/api/bootstrap") {
    if (!authenticated(request)) return json(response, 401, { error: "Unauthorized" });
    try { return json(response, 200, await client.bootstrap()); }
    catch (error) { return json(response, 502, { error: error.message }); }
  }
  if (request.url.startsWith("/api/")) return json(response, 404, { error: "Not found" });
  await serveStatic(request, response);
});

const wss = new WebSocketServer({ noServer: true });
server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url, "http://localhost");
  const tokenMatches = Boolean(config.accessToken && url.searchParams.get("token") === config.accessToken);
  if (url.pathname !== "/ws" || (!tailscaleIdentity(request) && !tokenMatches)) return socket.destroy();
  wss.handleUpgrade(request, socket, head, (ws) => wss.emit("connection", ws));
});

function send(ws, value) { if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(value)); }
function terminalKey(ws, id) { return `${socketIds.get(ws)}:${id}`; }
function openPty(shell, cwd, cols, rows) {
  if (nativePty) return nativePty.spawn(shell, ["-l"], { cwd, cols, rows, env: { ...process.env, TERM: "xterm-256color", COLORTERM: "truecolor" } });
  const child = spawn(shell, ["-l"], { cwd, env: { ...process.env, TERM: "xterm-256color", COLORTERM: "truecolor", COLUMNS: String(cols), LINES: String(rows) }, stdio: ["pipe", "pipe", "pipe"] });
  return { pid: child.pid, write: (data) => child.stdin.write(data), resize: () => {}, kill: () => child.kill("SIGTERM"), onData: (handler) => { child.stdout.on("data", (data) => handler(data.toString())); child.stderr.on("data", (data) => handler(data.toString())); }, onExit: (handler) => { child.on("exit", (exitCode) => handler({ exitCode: exitCode ?? 0 })); child.on("error", () => handler({ exitCode: 127 })); } };
}

wss.on("connection", (ws) => {
  sockets.add(ws);
  socketIds.set(ws, nextSocketId++);
  send(ws, { type: "connected", demo: config.demo });
  ws.on("message", async (raw) => {
    let message;
    try { message = JSON.parse(raw.toString()); } catch { return send(ws, { type: "error", error: "Invalid message" }); }
    try {
      if (message.type === "rpc") {
        const result = await client.rpc(message.method, message.params || {});
        return send(ws, { type: "rpc.result", id: message.id, result });
      }
      if (message.type === "command") {
        const result = await client.command(message.command, message.params || {});
        return send(ws, { type: "command.result", id: message.id, result });
      }
      if (message.type === "terminal.open") {
        const id = String(message.id || "main");
        const requestedCwd = typeof message.cwd === "string" && message.cwd.startsWith("/") ? message.cwd : process.cwd();
        const cwd = existsSync(requestedCwd) ? requestedCwd : process.cwd();
        const shell = process.env.SHELL || "/bin/bash";
        const proc = openPty(shell, cwd, Number(message.cols) || 100, Number(message.rows) || 30);
        terminals.set(terminalKey(ws, id), proc);
        proc.onData((data) => send(ws, { type: "terminal.data", id, data }));
        proc.onExit(({ exitCode }) => { terminals.delete(terminalKey(ws, id)); send(ws, { type: "terminal.exit", id, exitCode }); });
        return send(ws, { type: "terminal.opened", id, pid: proc.pid });
      }
      const proc = terminals.get(terminalKey(ws, String(message.id || "main")));
      if (message.type === "terminal.input" && proc) proc.write(String(message.data || ""));
      if (message.type === "terminal.resize" && proc) proc.resize(Math.max(20, Number(message.cols) || 80), Math.max(5, Number(message.rows) || 24));
      if (message.type === "terminal.kill" && proc) proc.kill();
    } catch (error) { send(ws, { type: "error", id: message.id, error: error.message }); }
  });
  ws.on("close", () => {
    for (const [key, proc] of terminals) if (key.startsWith(`${socketIds.get(ws)}:`)) { proc.kill(); terminals.delete(key); }
    sockets.delete(ws);
  });
});

if (!config.accessToken) console.error("MonoPad refuses remote access until MONOPAD_ACCESS_TOKEN is set in .env");
server.listen(config.port, config.host, () => console.log(`MonoPad listening on http://${config.host}:${config.port}${config.demo ? " (demo mode)" : ""}`));
