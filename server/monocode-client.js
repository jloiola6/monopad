import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const SUPPORTED_PROVIDERS = ["codex", "claude", "cursor", "grok", "opencode", "pi", "omp", "fx", "hermes", "antigravity"];
const SKILL_PROVIDERS = ["claude", "cursor", "codex", "opencode", "pi", "omp", "fx", "grok", "hermes", "antigravity"];
const NATIVE_SKILL_HARNESSES = new Set(["pi", "omp"]);
const CREATE_SKILL_BODY = `Create a new reusable skill following the MonoCode skill conventions. Ask for the intended name and scope when they are missing, write a concise SKILL.md with YAML frontmatter, and validate the result before finishing.`;
const execFileAsync = promisify(execFile);
const MAX_REMOTE_ATTACHMENT_BYTES = 20 * 1024 * 1024;
const MAX_ATTACHMENT_CHUNK_BYTES = 512 * 1024;
// Keep each host RPC comfortably below its JSON payload limit.
const ATTACHMENT_CHUNK_CHARS = 4 * Math.floor(MAX_ATTACHMENT_CHUNK_BYTES / 3);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function attachmentKind(mimeType) {
  if (String(mimeType).toLowerCase().startsWith("image/")) return "image";
  if (String(mimeType).toLowerCase().startsWith("audio/")) return "audio";
  return "file";
}

function dataUrlPayload(value) {
  const match = String(value || "").match(/^data:([^,]*?),(.*)$/s);
  if (!match || !/;base64(?:;|$)/i.test(match[1])) throw new Error("O arquivo não pôde ser preparado para o host");
  const encoded = match[2].replace(/\s/g, "");
  if (encoded && (!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded) || encoded.length % 4)) throw new Error("O arquivo enviado está inválido");
  return { mimeType: (match[1].split(";")[0] || "application/octet-stream").toLowerCase(), encoded };
}


async function syncDesktopSessions(removedSessionId = "") {
  if (!existsSync("/host-monocode/host.db")) return;
  try {
    const args = ["scripts/import-desktop-sessions.mjs"];
    if (removedSessionId) args.push("--delete-session", String(removedSessionId));
    await execFileAsync(process.execPath, args, { cwd: process.cwd(), timeout: 8_000 });
  } catch { /* the host remains usable when the desktop database is locked */ }
}



function isDirectory(cwd) {
  try { return Boolean(cwd) && statSync(String(cwd)).isDirectory(); } catch { return false; }
}

function parseSkillDocument(file, scope, source) {
  try {
    const text = readFileSync(file, "utf8");
    const frontmatter = text.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
    const metadata = {};
    for (const line of (frontmatter?.[1] || "").split("\n")) {
      const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*)\s*:\s*(.*?)\s*$/);
      if (!match) continue;
      metadata[match[1].toLowerCase()] = match[2].replace(/^(["'])(.*)\1$/, "$2");
    }
    const folder = file.split("/").slice(-2, -1)[0] || "skill";
    const name = String(metadata.name || folder).trim().toLowerCase();
    if (!/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(name)) return null;
    const body = text.replace(/^---\s*\n[\s\S]*?\n---\s*(?:\n|$)/, "").trim();
    return { name, description: String(metadata.description || `Skill local ${name}`).trim(), invocation: name, kind: "file", scope, source, path: file, body };
  } catch { return null; }
}

function skillDirectories(root, scope) {
  const directories = [{ path: join(root, ".agents", "skills"), source: ".agents" }];
  for (const provider of SKILL_PROVIDERS) directories.push({ path: join(root, `.${provider}`, "skills"), source: provider });
  const found = [];
  for (const directory of directories) {
    const pending = [{ path: directory.path, depth: 0 }];
    while (pending.length) {
      const current = pending.shift();
      let entries;
      try { entries = readdirSync(current.path, { withFileTypes: true }); } catch { continue; }
      for (const entry of entries) {
        const file = join(current.path, entry.name);
        if (entry.isFile() && entry.name.toLowerCase() === "skill.md") {
          const skill = parseSkillDocument(file, scope, directory.source);
          if (skill) found.push(skill);
          continue;
        }
        if (current.depth >= 3 || !isDirectory(file)) continue;
        pending.push({ path: file, depth: current.depth + 1 });
      }
    }
  }
  return found;
}

function discoverSkillRecords(cwd) {
  const records = [];
  if (isDirectory(cwd)) records.push(...skillDirectories(cwd, "project"));
  records.push(...skillDirectories(homedir(), "user"));
  const unique = new Map();
  for (const skill of records) if (!unique.has(skill.invocation)) unique.set(skill.invocation, skill);
  const builtin = { name: "create-skill", description: "Criar ou atualizar uma skill reutilizável", invocation: "create-skill", kind: "builtin", scope: "MonoCode", source: "builtin", body: CREATE_SKILL_BODY };
  if (!unique.has(builtin.invocation)) unique.set(builtin.invocation, builtin);
  return [...unique.values()];
}

function publicSkill(skill) {
  const { path, body, ...descriptor } = skill;
  return descriptor;
}

function skillNamesInText(text) {
  const names = [];
  const seen = new Set();
  const pattern = /(?:^|\s)\/([a-z0-9]+(?:[-_][a-z0-9]+)*)/gi;
  for (const match of String(text || "").matchAll(pattern)) {
    const name = match[1].toLowerCase();
    if (!seen.has(name)) { seen.add(name); names.push(name); }
  }
  return names;
}

function injectSkillPrompt(text, skills) {
  if (!skills.length) return text;
  const header = `The user invoked skill(s) with /${skills.map((skill) => skill.invocation).join(", /")}. Follow every instruction in each skill body.`;
  const bodies = skills.map((skill) => `## /${skill.invocation}\n\n${skill.body}`).join("\n\n---\n\n");
  return `${header}\n\n${bodies}\n\n---\n\n${text}`;
}

function discoverLocalProjects() {
  const found = new Set();
  const home = homedir();
  const roots = [join(home, "Documentos", "Projetos"), join(home, "Documents", "Projects"), join(home, "Projects")];
  for (const root of roots) {
    try {
      for (const entry of readdirSync(root, { withFileTypes: true })) {
        if (entry.isDirectory()) found.add(join(root, entry.name));
      }
    } catch { /* optional folder */ }
  }
  const localStorage = join(home, ".local", "share", "com.monocode.desktop", "localstorage", "tauri_localhost_0.localstorage");
  try {
    const text = readFileSync(localStorage).toString("utf16le");
    for (const match of text.matchAll(/\/home\/[^"\0]+/g)) {
      const cwd = match[0].replace(/[}\]]+$/, "");
      if (cwd.includes("/Projetos/") || cwd.includes("/Projects/")) found.add(cwd);
    }
  } catch { /* desktop storage is optional */ }
  return [...found].filter((cwd) => {
    try { return existsSync(cwd) && statSync(cwd).isDirectory(); } catch { return false; }
  });
}

export class MonoCodeClient {
  constructor({ baseUrl, token, demo = false, fetchImpl = fetch, projectDiscovery = discoverLocalProjects }) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.fetch = fetchImpl;
    this.demo = demo;
    this.projectDiscovery = projectDiscovery;
    this.environmentId = null;
    this.demoSessions = new Map();
  }

  async rpc(method, params = {}) {
    if (method === "skills.list") return this.demo ? this.demoRpc(method, params) : discoverSkillRecords(params.cwd).map(publicSkill);
    if (method === "skills.read") {
      const skill = discoverSkillRecords(params.cwd).find((item) => item.invocation === String(params.name || "").toLowerCase());
      if (!skill) throw new Error("Skill não encontrada neste projeto");
      return { ...publicSkill(skill), body: skill.body };
    }
    if (this.demo) return this.demoRpc(method, params);
    if (!this.token) throw new Error("MONOCODE_DEVICE_TOKEN is not configured");
    const body = { version: 1, environmentId: this.environmentId, method, params };
    const response = await this.fetch(`${this.baseUrl}/rpc`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20_000)
    });
    const payload = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    if (!response.ok || payload.error) throw new Error(payload.error || `MonoCode Host returned HTTP ${response.status}`);
    if (method === "sessions.delete" && params.sessionId) await syncDesktopSessions(params.sessionId);
    return payload.result;
  }

  async describe() {
    const descriptor = await this.rpc("environment.describe", { supportedProviders: SUPPORTED_PROVIDERS });
    this.environmentId = descriptor.environmentId;
    return descriptor;
  }

  async uploadAttachment(input) {
    const parsed = dataUrlPayload(input.data);
    const mimeType = String(input.type || input.mimeType || parsed.mimeType || "application/octet-stream").trim().slice(0, 128);
    const name = String(input.name || "anexo").trim().slice(0, 255);
    const size = Number(input.size);
    if (!name || !mimeType || !Number.isSafeInteger(size) || size < 0 || size > MAX_REMOTE_ATTACHMENT_BYTES)
      throw new Error("Arquivo " + (name || "anexo") + " inválido");
    const bytes = Buffer.from(parsed.encoded, "base64");
    if (bytes.length !== size) throw new Error("O upload de " + name + " ficou incompleto");
    const id = UUID.test(String(input.id || "")) ? String(input.id) : randomUUID();
    const kind = attachmentKind(mimeType);
    let offset = 0;
    if (!parsed.encoded.length) {
      const reply = await this.rpc("attachments.upload", { id, offset: 0, size, data: "" });
      offset = Number(reply?.offset);
    } else {
      for (let index = 0; index < parsed.encoded.length; index += ATTACHMENT_CHUNK_CHARS) {
        const chunk = parsed.encoded.slice(index, index + ATTACHMENT_CHUNK_CHARS);
        const chunkBytes = Buffer.from(chunk, "base64").length;
        const reply = await this.rpc("attachments.upload", { id, offset, size, data: chunk });
        const nextOffset = Number(reply?.offset);
        if (!Number.isSafeInteger(nextOffset) || nextOffset !== offset + chunkBytes)
          throw new Error("O host não confirmou o upload de " + name);
        offset = nextOffset;
      }
    }
    if (offset !== size) throw new Error("Não foi possível concluir o upload de " + name);
    return { id, name, mimeType, kind, size };
  }

  async uploadAttachments(inputs) {
    if (!Array.isArray(inputs) || !inputs.length) return [];
    if (inputs.length > 20) throw new Error("Você pode anexar no máximo 20 arquivos");
    if (this.demo) return inputs.map((input) => ({ id: UUID.test(String(input.id || "")) ? String(input.id) : randomUUID(), name: String(input.name || "anexo"), mimeType: String(input.type || input.mimeType || "application/octet-stream"), kind: attachmentKind(input.type || input.mimeType), size: Number(input.size) || 0 }));
    return Promise.all(inputs.map((input) => this.uploadAttachment(input)));
  }

  async command(type, params = {}) {
    let outgoing = { ...params };
    if ((type === "send" || type === "draft") && Array.isArray(params.attachments)) {
      outgoing.attachments = await this.uploadAttachments(params.attachments);
    }
    if (type === "send" && typeof params.text === "string" && params.cwd) {
      const names = skillNamesInText(params.text);
      const records = discoverSkillRecords(params.cwd);
      const selected = names.map((name) => records.find((skill) => skill.invocation === name)).filter(Boolean);
      if (!NATIVE_SKILL_HARNESSES.has(String(params.harness || "").toLowerCase())) outgoing.text = injectSkillPrompt(params.text, selected.filter((skill) => skill.kind === "file" || skill.kind === "builtin"));
      delete outgoing.cwd;
      delete outgoing.harness;
    }
    const result = await this.rpc("commands.dispatch", { type, commandId: randomUUID(), ...outgoing });
    if (!this.demo) await syncDesktopSessions();
    return result;
  }

  async bootstrap() {
    await syncDesktopSessions();
    const environment = await this.describe();
    let projects = await this.rpc("projects.list");
    // The desktop keeps its project rail in local storage while the remote
    // host keeps a separate registry. Reconcile local folders on every refresh
    // so a project created after Docker started appears without a restart.
    if (!this.demo) {
      const registered = new Set(projects.map((project) => String(project.cwd || "")));
      let opened = false;
      for (const cwd of this.projectDiscovery()) {
        if (registered.has(cwd)) continue;
        try { await this.rpc("projects.open", { cwd }); registered.add(cwd); opened = true; } catch { /* stale/non-directory entry */ }
      }
      if (opened) projects = await this.rpc("projects.list");
    }
    // A deleted project/worktree can remain in the Host history by design.
    // It must not remain in the live workspace rail after a refresh.
    if (!this.demo) projects = projects.filter((project) => isDirectory(project.cwd));
    const sessions = Object.fromEntries(await Promise.all(projects.map(async (project) => {
      const listed = await this.rpc("sessions.list", { projectId: project.id });
      const current = listed.filter((session) => {
        if (session.worktreeRemoved || session.worktree_removed) return false;
        const cwd = session.worktreeCwd || session.worktree_cwd || session.cwd;
        return !cwd || isDirectory(cwd);
      });
      return [project.id, current];
    })));
    return { environment, projects, sessions };
  }


  demoRpc(method, params) {
    const now = Date.now();
    if (method === "environment.describe") return { protocolVersion: 1, environmentId: "demo", name: "Ubuntu Studio", platform: "linux", providers: ["codex", "claude", "cursor"], capabilities: ["sessions", "terminal", "diff"] };
    if (method === "projects.list") return [{ id: "demo-project", cwd: "/home/user/projects/atlas", name: "atlas" }, { id: "demo-tools", cwd: "/home/user/projects/tools", name: "tools" }];
    if (method === "sessions.list") return params.projectId === "demo-project" ? [
      { id: "session-1", title: "Refatorar autenticação", harness: "codex", status: "running", model: "gpt-5.3-codex", branch: "feature/auth", updatedAt: now, needsInput: false },
      { id: "session-2", title: "Revisar interface do painel", harness: "claude", status: "idle", model: "claude-opus", branch: "main", updatedAt: now - 420000, needsInput: true }
    ] : [{ id: "session-3", title: "Atualizar scripts", harness: "cursor", status: "interrupted", branch: "main", updatedAt: now - 720000 }];
    if (method === "sessions.sync") return { kind: "snapshot", value: { projectId: "demo-project", revision: 1, status: "running", runId: "demo-run", updatedAt: now, session: { id: params.sessionId, title: "Refatorar autenticação", harness: "codex", model: "gpt-5.3-codex", blocks: [
      { id: "b1", kind: "user", text: "Revise o fluxo de autenticação e preserve as sessões existentes." },
      { id: "b2", kind: "assistant", text: "Estou mapeando os pontos de renovação do token e os testes afetados." },
      { id: "b3", kind: "tool", name: "Busca", status: "running", text: "Verificando chamadas de refresh em 12 arquivos…" }
    ] } } };
    if (method === "commands.dispatch") return { commandId: params.commandId, sessionId: params.sessionId || "session-1", revision: 2 };
    if (method === "models.list") return { models: { codex: [{ id: "gpt-5.3-codex", name: "GPT-5.3 Codex" }], claude: [{ id: "claude-opus", name: "Claude Opus" }] }, errors: {} };
    if (method === "skills.list") return [{ name: "create-skill", description: "Criar ou atualizar uma skill reutilizável", invocation: "create-skill", kind: "builtin", scope: "MonoCode", source: "builtin" }];
    throw new Error(`Demo method not implemented: ${method}`);
  }
}
