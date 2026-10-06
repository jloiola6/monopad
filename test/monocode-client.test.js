import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { MonoCodeClient } from "../server/monocode-client.js";

test("bootstraps live projects and filters deleted worktrees", async () => {
  const calls=[];
  const cwd=process.cwd();
  const fetchImpl=async(_url,options)=>{const body=JSON.parse(options.body);calls.push(body);let result;if(body.method==="environment.describe")result={protocolVersion:1,environmentId:"host-1",name:"PC",providers:["codex"],capabilities:["sessions"]};else if(body.method==="projects.list")result=[{id:"p1",name:"app",cwd},{id:"stale",name:"old",cwd:"/definitely/not/there"}];else if(body.method==="sessions.list")result=body.params.projectId==="p1"?[{id:"s1",title:"Task",status:"idle",cwd},{id:"deleted",title:"Deleted",status:"idle",cwd:"/definitely/not/there"}]:[];return {ok:true,json:async()=>({result})};};
  const client=new MonoCodeClient({baseUrl:"http://127.0.0.1:3774",token:"x".repeat(43),fetchImpl,projectDiscovery:()=>[]});
  const value=await client.bootstrap();
  assert.equal(value.environment.name,"PC");
  assert.deepEqual(value.projects.map((project)=>project.id),["p1"]);
  assert.deepEqual(value.sessions.p1.map((session)=>session.id),["s1"]);
  assert.equal(calls[1].environmentId,"host-1");
});

test("registers a project created after the first host refresh", async () => {
  const cwd=process.cwd();
  let opened=false;
  const calls=[];
  const fetchImpl=async(_url,options)=>{
    const body=JSON.parse(options.body);calls.push(body);
    let result;
    if(body.method==="environment.describe") result={protocolVersion:1,environmentId:"host-1",name:"PC",providers:["codex"],capabilities:["sessions"]};
    else if(body.method==="projects.list") result=opened?[{id:"new",name:"new-project",cwd}]:[];
    else if(body.method==="projects.open"){assert.equal(body.params.cwd,cwd);opened=true;result={id:"new",name:"new-project",cwd};}
    else if(body.method==="sessions.list") result=[];
    return {ok:true,json:async()=>({result})};
  };
  const client=new MonoCodeClient({baseUrl:"http://127.0.0.1:3774",token:"x".repeat(43),fetchImpl,projectDiscovery:()=>[cwd]});
  const value=await client.bootstrap();
  assert.deepEqual(value.projects.map((project)=>project.name),["new-project"]);
  assert.ok(calls.some((call)=>call.method==="projects.open"));
});

test("demo mode provides an immediately usable dashboard", async()=>{const client=new MonoCodeClient({baseUrl:"",token:"",demo:true});const value=await client.bootstrap();assert.ok(value.projects.length>=1);assert.ok(value.sessions[value.projects[0].id].length>=1);});


test("discovers project skills and expands slash prompts on the host", async () => {
  const cwd = mkdtempSync(join(tmpdir(), "monopad-skills-"));
  const skillDir = join(cwd, ".agents", "skills", "review");
  const nestedSkillDir = join(cwd, ".claude", "skills", "synced", "bundle", "speckit-plan");
  mkdirSync(skillDir, { recursive: true });
  mkdirSync(nestedSkillDir, { recursive: true });
  writeFileSync(join(skillDir, "SKILL.md"), "---\nname: review\ndescription: Revisar com checklist\n---\nLeia os arquivos alterados e devolva um checklist objetivo.");
  writeFileSync(join(nestedSkillDir, "SKILL.md"), "---\nname: speckit-plan\ndescription: Planejar uma feature\n---\nOrganize a implementação em etapas verificáveis.");
  const calls = [];
  const fetchImpl = async (_url, options) => {
    const body = JSON.parse(options.body); calls.push(body);
    return { ok: true, json: async () => ({ result: { commandId: body.params.commandId, sessionId: body.params.sessionId, revision: 2 } }) };
  };
  try {
    const client = new MonoCodeClient({ baseUrl: "http://127.0.0.1:3774", token: "x".repeat(43), fetchImpl, projectDiscovery: () => [] });
    const catalog = await client.rpc("skills.list", { cwd });
    assert.equal(catalog.find((skill) => skill.invocation === "review")?.description, "Revisar com checklist");
    assert.equal(catalog.find((skill) => skill.invocation === "speckit-plan")?.scope, "project");
    await client.command("send", { sessionId: "s1", cwd, harness: "codex", text: "/review avalie este diff" });
    const dispatched = calls.find((call) => call.method === "commands.dispatch");
    assert.match(dispatched.params.text, /Follow every instruction/);
    assert.match(dispatched.params.text, /Leia os arquivos alterados/);
    assert.equal(dispatched.params.cwd, undefined);
    assert.equal(dispatched.params.harness, undefined);
    await client.command("cancel", { sessionId: "s1", runId: "run-1" });
    const cancelled = calls.find((call) => call.params?.runId === "run-1");
    assert.equal(cancelled.params.type, "cancel");
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});


test("uploads browser attachments in host-sized chunks before dispatching a turn", async () => {
  const calls = [];
  const bytes = Buffer.from("conteúdo do arquivo\n", "utf8");
  const data = "data:text/markdown;base64," + bytes.toString("base64");
  const fetchImpl = async (_url, options) => {
    const body = JSON.parse(options.body);
    calls.push(body);
    if (body.method === "attachments.upload") return { ok: true, json: async () => ({ result: { offset: body.params.offset + Buffer.from(body.params.data, "base64").length } }) };
    return { ok: true, json: async () => ({ result: { commandId: body.params.commandId, sessionId: body.params.sessionId, revision: 2 } }) };
  };
  const client = new MonoCodeClient({ baseUrl: "http://127.0.0.1:3774", token: "x".repeat(43), fetchImpl, projectDiscovery: () => [] });
  await client.command("send", {
    sessionId: "s1",
    text: "Leia o anexo",
    attachments: [{ id: "not-a-uuid", name: "notas.md", type: "text/markdown", size: bytes.length, data }],
  });
  const uploads = calls.filter((call) => call.method === "attachments.upload");
  assert.equal(uploads.length, 1);
  assert.equal(uploads[0].params.size, bytes.length);
  const dispatched = calls.find((call) => call.method === "commands.dispatch");
  assert.equal(dispatched.params.attachments.length, 1);
  assert.equal(dispatched.params.attachments[0].name, "notas.md");
  assert.equal(dispatched.params.attachments[0].mimeType, "text/markdown");
  assert.equal(dispatched.params.attachments[0].kind, "file");
  assert.equal("data" in dispatched.params.attachments[0], false);
});
