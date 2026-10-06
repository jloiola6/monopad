import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";
import { basename, join } from "node:path";
import { homedir } from "node:os";
import { randomUUID } from "node:crypto";

const desktopPath = process.env.MONOCODE_DESKTOP_DB || join(homedir(), ".local", "share", "com.monocode.desktop", "monocode.db");
const hostPath = process.env.MONOCODE_HOST_DB || "/host-monocode/host.db";
const deleteIndex = process.argv.indexOf("--delete-session");
const removeSessionId = deleteIndex >= 0 ? String(process.argv[deleteIndex + 1] || "") : "";
if (!existsSync(desktopPath)) process.exit(0);

const desktop = new DatabaseSync(desktopPath);
const host = new DatabaseSync(hostPath);
for (const db of [desktop, host]) {
  try { db.exec("PRAGMA busy_timeout=5000;"); } catch {}
}
host.exec(`PRAGMA journal_mode=WAL;
  CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, cwd TEXT NOT NULL UNIQUE, name TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id), snapshot TEXT NOT NULL, summary TEXT);
  CREATE TABLE IF NOT EXISTS receipts (id TEXT PRIMARY KEY, signature TEXT NOT NULL, receipt TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS events (session_id TEXT NOT NULL REFERENCES sessions(id), revision INTEGER NOT NULL, payload TEXT NOT NULL, PRIMARY KEY(session_id, revision));
  CREATE TABLE IF NOT EXISTS devices (id TEXT PRIMARY KEY, name TEXT NOT NULL, hash TEXT NOT NULL UNIQUE);`);

const columns = host.prepare("PRAGMA table_info(sessions)").all();
if (!columns.some((column) => column.name === "summary")) host.exec("ALTER TABLE sessions ADD COLUMN summary TEXT");
const sessions = desktop.prepare(`SELECT id,cwd,harness,model,model_settings,runtime_mode,title,
  provider_session_id,blocks_json,created_at,updated_at,branch,worktree_cwd,archived,pinned,
  is_draft,provider_account_id FROM sessions WHERE cwd IS NOT NULL ORDER BY updated_at DESC`).all();
const active = new Set(desktop.prepare("SELECT session_id FROM in_flight_sessions").all().map((row) => String(row.session_id)));
const getProject = host.prepare("SELECT id FROM projects WHERE cwd=?");
const insertProject = host.prepare("INSERT OR IGNORE INTO projects VALUES (?, ?, ?)");
const insertSession = host.prepare("INSERT OR IGNORE INTO sessions (id, project_id, snapshot, summary) VALUES (?, ?, ?, NULL)");
const getSession = host.prepare("SELECT snapshot FROM sessions WHERE id=?");
const updateSession = host.prepare("UPDATE sessions SET project_id=?, snapshot=?, summary=NULL WHERE id=?");
let imported = 0;
host.exec("BEGIN IMMEDIATE");
try {
  for (const row of sessions) {
    if (!row.provider_session_id) continue;
    const cwd = String(row.worktree_cwd || row.cwd);
    let project = getProject.get(String(row.cwd));
    if (!project) {
      insertProject.run(randomUUID(), String(row.cwd), basename(String(row.cwd)));
      project = getProject.get(String(row.cwd));
    }
    if (!project) continue;
    let blocks;
    try { blocks = JSON.parse(String(row.blocks_json || "[]")); } catch { blocks = []; }
    let modelSettings;
    try { modelSettings = JSON.parse(String(row.model_settings || "{}")); } catch { modelSettings = {}; }
    const updatedAt = Number(row.updated_at) || Date.now();
    const snapshot = {
      projectId: String(project.id),
      revision: 0,
      status: active.has(String(row.id)) ? "running" : "idle",
      createdAt: Number(row.created_at) || updatedAt,
      updatedAt,
      archived: Boolean(row.archived),
      pinned: Boolean(row.pinned),
      blockRevisions: Object.fromEntries(blocks.map((block) => [String(block.id), 0])),
      session: {
        id: String(row.id), cwd, harness: String(row.harness), model: String(row.model),
        modelSettings, runtimeMode: String(row.runtime_mode || "supervised"),
        title: String(row.title || "Sessão MonoCode"), providerSessionId: String(row.provider_session_id),
        blocks, ...(row.branch ? { branch: String(row.branch) } : {}),
        ...(row.worktree_cwd ? { worktreeCwd: String(row.worktree_cwd) } : {}),
        ...(row.provider_account_id ? { providerAccountId: String(row.provider_account_id) } : {}),
      },
    };
    const serialized = JSON.stringify(snapshot);
    const existing = getSession.get(String(row.id));
    if (!existing) {
      const result = insertSession.run(String(row.id), String(project.id), serialized);
      if (result.changes) imported += 1;
    } else {
      try {
        const current = JSON.parse(String(existing.snapshot));
        if (!current.blockRevisions) { updateSession.run(String(project.id), serialized, String(row.id)); imported += 1; }
      } catch { updateSession.run(String(project.id), serialized, String(row.id)); imported += 1; }
    }
  }
  host.exec("COMMIT");
} catch (error) {
  try { host.exec("ROLLBACK"); } catch {}
  throw error;
}

// Mirror Host-created sessions into the desktop database. The Host is authoritative
// for sessions created remotely; existing desktop sessions are updated only when the
// Host snapshot is newer and the desktop is not actively running that session.
let mirrored = 0;
try {
  const projects = new Map(host.prepare("SELECT id,cwd FROM projects").all().map((row) => [String(row.id), row]));
  const hostRows = host.prepare("SELECT id,project_id,snapshot FROM sessions").all();
  const existingDesktop = desktop.prepare("SELECT id,updated_at,provider_session_id FROM sessions WHERE id=?");
  const insertDesktop = desktop.prepare(`INSERT INTO sessions (
    id,cwd,harness,model,model_settings,runtime_mode,title,provider_session_id,blocks_json,
    created_at,updated_at,branch,context_used,context_window,archived,worktree_cwd,
    has_user_message,pinned,linked_work_item_json,provider_account_id,worktree_removed,
    is_draft,automation_id,inbox_ask
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const updateDesktop = desktop.prepare(`UPDATE sessions SET
    cwd=?,harness=?,model=?,model_settings=?,runtime_mode=?,title=?,provider_session_id=?,blocks_json=?,
    created_at=?,updated_at=?,branch=?,context_used=?,context_window=?,archived=?,worktree_cwd=?,
    has_user_message=?,pinned=?,linked_work_item_json=?,provider_account_id=?,worktree_removed=?,
    is_draft=?,automation_id=?,inbox_ask=? WHERE id=?`);

  desktop.exec("BEGIN IMMEDIATE");
  try {
    for (const row of hostRows) {
      let snapshot;
      try { snapshot = JSON.parse(String(row.snapshot || "{}")); } catch { continue; }
      const session = snapshot?.session;
      const project = projects.get(String(row.project_id));
      if (!session || !project || !session.id || !project.cwd) continue;
      const blocks = Array.isArray(session.blocks) ? session.blocks : [];
      const updatedAt = Number(snapshot.updatedAt || session.updatedAt || Date.now());
      const createdAt = Number(snapshot.createdAt || session.createdAt || updatedAt);
      const existing = existingDesktop.get(String(session.id));
      const providerSessionId = session.providerSessionId == null ? (existing?.provider_session_id ?? null) : String(session.providerSessionId);
      const values = [
        String(project.cwd), String(session.harness || "codex"), String(session.model || ""), JSON.stringify(session.modelSettings || {}),
        String(session.runtimeMode || "supervised"), String(session.title || "Sessão MonoCode"), providerSessionId, JSON.stringify(blocks),
        createdAt, updatedAt, session.branch == null ? null : String(session.branch), Number(session.contextUsed ?? snapshot.contextUsed) || null,
        Number(session.contextWindow ?? snapshot.contextWindow) || null, snapshot.archived ? 1 : 0,
        session.worktreeCwd == null ? null : String(session.worktreeCwd), blocks.some((block) => String(block.role || block.kind || "").toLowerCase().includes("user")) ? 1 : 0,
        snapshot.pinned ? 1 : 0, session.linkedWorkItem == null ? null : JSON.stringify(session.linkedWorkItem), session.providerAccountId == null ? null : String(session.providerAccountId),
        session.worktreeRemoved || snapshot.worktreeRemoved ? 1 : 0, session.isDraft ? 1 : 0, session.automationId == null ? null : String(session.automationId),
        session.inboxAsk == null ? null : String(session.inboxAsk),
      ];
      if (!existing) {
        insertDesktop.run(String(session.id), ...values);
        mirrored += 1;
        continue;
      }
      if (active.has(String(session.id)) || Number(existing.updated_at || 0) >= updatedAt) continue;
      updateDesktop.run(...values, String(session.id));
      mirrored += 1;
    }
    desktop.exec("COMMIT");
  } catch (error) {
    try { desktop.exec("ROLLBACK"); } catch {}
    throw error;
  }
} catch (error) {
  console.error(`MonoPad: desktop session mirror skipped: ${error.message}`);
}

let removed = 0;
if (removeSessionId) {
  try {
    desktop.exec("BEGIN IMMEDIATE");
    removed = Number(desktop.prepare("DELETE FROM sessions WHERE id=?").run(removeSessionId).changes || 0);
    desktop.exec("COMMIT");
  } catch (error) {
    try { desktop.exec("ROLLBACK"); } catch {}
    console.error(`MonoPad: desktop session deletion skipped: ${error.message}`);
  }
}

if (imported || mirrored || removed) console.log(`Synced MonoCode sessions: imported ${imported}, mirrored ${mirrored}, removed ${removed}`);
desktop.close();
host.close();
