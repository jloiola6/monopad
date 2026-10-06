const $ = (selector) => document.querySelector(selector);
const UI_ICONS={
  panelLeft:'<path d="M11 3H13C18.5 3 21 5.5 21 11V13C21 18.5 18.5 21 13 21H11C5.5 21 3 18.5 3 13V11C3 5.5 5.5 3 11 3Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M16 8V16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/>',
  settings:'<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  refresh:'<path d="M20 8.5A8.5 8.5 0 1 0 21 13" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/><path d="M16 9H20V5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>',
  x:'<path d="M18 6L6 18M18 18L6 6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/>',
  search:'<circle cx="11" cy="11" r="7.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M17 17L21 21" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/>',
  terminal:'<path d="M7 8L10 10.5L7 13M12 14H16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><rect x="3" y="3" width="18" height="18" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  dashboard:'<rect x="3" y="3" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="13" y="3" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="13" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="13" y="13" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  chevronLeft:'<path d="M15 6C15 6 9 10.4 9 12S15 18 15 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>',
  chevronDown:'<path d="M6 9C6 9 10.4 15 12 15S18 9 18 9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>',
  chevronUp:'<path d="M6 15C6 15 10.4 9 12 9S18 15 18 15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>',
  plus:'<path d="M12 5V19M5 12H19" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/>',
  check:'<path d="M5 12.5L10 17L19 7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>',
  folder:'<path d="M3 7C3 4.8 4.8 3 7 3H10L12 6H17C19.2 6 21 7.8 21 10V17C21 19.2 19.2 21 17 21H7C4.8 21 3 19.2 3 17V7Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"/>',
  file:'<path d="M7 3H14L19 8V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V5C5 3.9 5.9 3 7 3Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"/><path d="M14 3V8H19M8 12H16M8 16H14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/>',
  sparkles:'<path d="M12 3L13.2 7.8L18 9L13.2 10.2L12 15L10.8 10.2L6 9L10.8 7.8L12 3Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"/>',
  dot:'<circle cx="12" cy="12" r="3" fill="currentColor"/>',
  user:'<circle cx="12" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 20C5.8 16.5 8.1 14.5 12 14.5S18.2 16.5 19 20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/>',
  claude:'<path d="M12 3L13.8 9.2L20 11L13.8 12.8L12 19L10.2 12.8L4 11L10.2 9.2L12 3Z" fill="currentColor"/>',
  codex:'<path d="M12 3L19 7V17L12 21L5 17V7L12 3Z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M9 10L12 8L15 10V14L12 16L9 14V10Z" fill="currentColor"/>',
  grok:'<path d="M6 6L18 18M18 6L6 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"/><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.2"/>',
  cursor:'<path d="M5 4L18.5 11.2L12.7 12.8L10.4 19L5 4Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"/>'
};
function uiIcon(name){return '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+(UI_ICONS[name]||UI_ICONS.dot)+'</svg>';}
function hydrateIcons(root=document){root.querySelectorAll('[data-icon]').forEach((element)=>{element.innerHTML=uiIcon(element.dataset.icon);});}
const queryToken = new URLSearchParams(location.search).get("token") || "";
if (queryToken) {
  localStorage.setItem("monopad-token", queryToken);
  sessionStorage.setItem("monopad-token", queryToken);
  history.replaceState({}, "", location.pathname + location.hash);
}
const DEFAULT_SETTINGS = { openLastSession: true, autoRefresh: true, confirmInterrupt: true, persistLogin: true, theme: "dark", density: "comfortable", reduceMotion: false };
const state = { token: localStorage.getItem("monopad-token") || sessionStorage.getItem("monopad-token") || "", data: null, project: null, session: null, snapshot: null, catalog: null, catalogProjectId: null, skills: [], skillsCwd: "", fileReferences: [], fileReferencesCwd: "", fileReferencesLoaded: false, fileReferencePromise: null, autoPicker: "", fileViewer: null, cancelling: false, parentExpanded: new Set(), projectStyleTarget: null, attachments: [], newCatalog: null, pendingNewProject: null, workspaceView: "sessions", explorerPath: "", changes: null, ws: null, rpc: new Map(), poll: null, workspacePoll: null, terminal: null, fit: null, terminalOpen: false, deferredInstall: null, qrStream: null, qrFrame: 0, settings: { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem("monopad-settings") || "{}") } };

function toast(message) { const el=$("#toast");el.textContent=message;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.hidden=true,3200); }
function persistLoginToken(){
  if(state.settings.persistLogin){localStorage.setItem("monopad-token",state.token);sessionStorage.setItem("monopad-token",state.token);}
  else{localStorage.removeItem("monopad-token");sessionStorage.setItem("monopad-token",state.token);}
}
function logout(){
  clearInterval(state.poll);clearInterval(state.workspacePoll);stopQrScanner();state.ws?.close();localStorage.removeItem("monopad-token");sessionStorage.removeItem("monopad-token");localStorage.removeItem("monopad-last-session");sessionStorage.removeItem("monopad-last-session");state.token="";location.reload();
}
function statusLabel(status) { return status === "running" ? "Executando" : status === "idle" ? "Pronto" : status === "interrupted" ? "Interrompido" : "Aguardando"; }
function relativeTime(value) { const seconds=Math.max(0,Math.round((Date.now()-value)/1000));if(seconds<60)return "agora";if(seconds<3600)return `${Math.floor(seconds/60)} min`;return `${Math.floor(seconds/3600)} h`; }
function safeText(value) { return typeof value === "string" ? value : value == null ? "" : JSON.stringify(value,null,2); }
const PROJECT_VISUALS = [
  { color: "#ffb454", mascot: "🪐" },
  { color: "#7dd3fc", mascot: "🦊" },
  { color: "#c4b5fd", mascot: "🐙" },
  { color: "#86efac", mascot: "🦉" },
  { color: "#f9a8d4", mascot: "🐝" },
  { color: "#fca5a5", mascot: "🐼" },
  { color: "#a5b4fc", mascot: "🦄" },
  { color: "#67e8f9", mascot: "🐢" }
];
function projectVisual(project){
  let custom={};
  try{custom=JSON.parse(localStorage.getItem("monopad-project-visuals")||"{}")||{};}catch{}
  const saved=custom[String(project.id||"")];
  if(saved?.color&&saved?.mascot)return saved;
  const seed=String(project.id||project.cwd||project.name||"project");
  let hash=0;for(const char of seed)hash=((hash<<5)-hash)+char.charCodeAt(0)|0;
  return PROJECT_VISUALS[Math.abs(hash)%PROJECT_VISUALS.length];
}
function blockText(block) { return block.text || block.content || block.message || block.tool?.detail || block.tool?.preview?.output || block.output || block.summary || block.tool?.title || block.title || block.name || "Atividade do agente"; }
function blockKind(block) { const kind=String(block.role || block.kind || block.type || "assistant").toLowerCase();if(kind.includes("user"))return "user";if(kind.includes("reason"))return "reasoning";if(kind.includes("tool")||kind.includes("command")||kind.includes("step")||block.tool)return "tool";if(kind.includes("plan"))return "plan";if(kind.includes("task"))return "tasks";if(kind.includes("system")||kind.includes("approval"))return "system";return "assistant"; }
function activityLabel(block,kind){if(kind==="reasoning")return block.streaming?"Pensando…":"Raciocínio";if(kind==="tool")return block.tool?.title||block.name||"Ferramenta";if(kind==="plan")return block.streaming?"Planejando…":"Plano";if(kind==="tasks")return "Tarefas";return block.notice==="interrupt"?"Interrompido":"Atividade do agente";}
function activityStatus(block,kind){if(block.streaming)return kind==="reasoning"?"analisando":"em andamento";const status=String(block.tool?.status||"").toLowerCase();if(status==="completed")return "concluído";if(status==="failed")return "falhou";if(status==="cancelled")return "cancelado";if(["running","started","in_progress","in-progress"].includes(status))return "em andamento";return block.notice==="error"?"erro":"";}
function renderActivityBlock(article,block,kind){
  article.classList.add("activity-message",kind);if(block.streaming)article.classList.add("streaming");
  const text=block.text||block.tool?.detail||block.tool?.preview?.output||block.tool?.preview?.path||block.tool?.preview?.fileName||"";const hasTasks=kind==="tasks"&&block.taskList?.items?.length;
  const card=document.createElement("div");card.className="activity-card";
  const head=document.createElement("div");head.className="activity-head";
  const icon=document.createElement("span");icon.className="activity-icon";icon.innerHTML=uiIcon(kind==="reasoning"?"sparkles":kind==="tool"?"terminal":kind==="plan"?"dashboard":"dot");const title=document.createElement("strong");title.textContent=activityLabel(block,kind);const status=document.createElement("span");status.className="activity-status";status.textContent=activityStatus(block,kind);head.append(icon,title,status);card.append(head);
  if(text){const detail=document.createElement("div");detail.className="activity-detail";detail.textContent=text;card.append(detail);}
  if(hasTasks){const list=document.createElement("ul");list.className="activity-tasks";for(const item of block.taskList.items){const row=document.createElement("li");row.dataset.status=item.status;row.textContent=`${item.status==="completed"?"✓":item.status==="in_progress"?"◌":"○"} ${item.text}`;list.append(row);}card.append(list);}
  article.append(card);
}

function agentIconName(harness){
  const key=String(harness||"").toLowerCase();
  if(key==="claude")return "claude";
  if(key==="codex")return "codex";
  if(key==="grok")return "grok";
  if(key==="cursor")return "cursor";
  return "sparkles";
}
function renderUserMessage(article,block,collapseTarget,hasExecutions){
  const collapsed=hasExecutions&&!state.parentExpanded.has(collapseTarget);
  const head=document.createElement(hasExecutions?"button":"div");head.className="message-head";
  if(hasExecutions){head.type="button";head.classList.add("message-toggle","user-collapse-toggle");head.setAttribute("aria-expanded",String(!collapsed));head.setAttribute("aria-label",collapsed?"Mostrar execuções da IA":"Ocultar execuções da IA");head.addEventListener("click",()=>{const scrollTop=$("#transcript").scrollTop;if(state.parentExpanded.has(collapseTarget))state.parentExpanded.delete(collapseTarget);else state.parentExpanded.add(collapseTarget);renderSnapshot();$("#transcript").scrollTop=scrollTop;});}
  const avatar=document.createElement("span");avatar.className="avatar user-avatar";avatar.innerHTML=uiIcon("user");const label=document.createElement("span");label.textContent="Você";head.append(avatar,label);
  if(hasExecutions){const chevron=document.createElement("span");chevron.className="message-chevron";chevron.innerHTML=uiIcon(collapsed?"chevronDown":"chevronUp");head.append(chevron);}
  const body=document.createElement("div");body.className="message-body";body.textContent=safeText(blockText(block));article.append(head,body);
}
function renderExecutionGroup(container,activities,collapseKey){
  const collapsed=!state.parentExpanded.has(String(collapseKey||""));
  const group=document.createElement("div");group.className="assistant-executions"+(collapsed?" collapsed":"");
  for(const activity of activities)renderActivityBlock(group,activity.block,activity.kind);
  container.append(group);
}
function renderAssistantBlock(article,block,activities=[],pairedWithUser=false,collapseOwnerId=""){
  article.classList.add("assistant-message");
  const text=safeText(block.text||block.content||block.message||block.output||block.summary||block.title||block.name||"");const hasText=Boolean(text.trim());const hasExecutions=activities.length>0;const collapseKey=String(collapseOwnerId||block.id||"");const collapsed=!state.parentExpanded.has(collapseKey);
  const head=document.createElement("div");head.className="message-head";const avatar=document.createElement("span");const provider=String(state.session?.harness||"agent").toLowerCase();avatar.className="avatar agent-avatar agent-"+provider;avatar.innerHTML=uiIcon(agentIconName(provider));const label=document.createElement("span");label.textContent=state.session.harness;head.append(avatar,label);
  if(hasExecutions&&!pairedWithUser){head.classList.add("message-toggle");head.setAttribute("role","button");head.setAttribute("tabindex","0");head.setAttribute("aria-expanded",String(!collapsed));head.setAttribute("aria-label",collapsed?"Mostrar execuções da IA":"Ocultar execuções da IA");const toggle=()=>{const scrollTop=$("#transcript").scrollTop;if(state.parentExpanded.has(collapseKey))state.parentExpanded.delete(collapseKey);else state.parentExpanded.add(collapseKey);renderSnapshot();$("#transcript").scrollTop=scrollTop;};head.addEventListener("click",toggle);head.addEventListener("keydown",(event)=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();toggle();}});}
  if(hasExecutions&&!pairedWithUser){const chevron=document.createElement("span");chevron.className="message-chevron";chevron.innerHTML=uiIcon(collapsed?"chevronDown":"chevronUp");head.append(chevron);}article.append(head);
  if(hasText){const body=document.createElement("div");body.className="message-body markdown-preview parent-message-body";body.innerHTML=markdownToHtml(text);article.append(body);}
  if(hasExecutions)renderExecutionGroup(article,activities,collapseKey);
}

function renderNoSessionState(project,message="Escolha um projeto e crie uma sessão para começar."){
  $("#session-provider").textContent="Nenhuma sessão";$("#session-title").textContent="Selecione uma sessão";$("#session-status").textContent="Sem sessão";$("#session-status").className="status-pill neutral";setRunningControls(false);$("#delete-session").disabled=true;$("#composer").hidden=true;setComposerDisabled(true);
  $("#transcript").innerHTML='<div class="empty-state"><div class="pulse-ring"></div><h3></h3><p></p></div>';
  $("#transcript h3").textContent=message.startsWith("O worktree")?"Worktree atualizado":"Nenhuma sessão aberta";$("#transcript p").textContent=message;
  if(project){const button=document.createElement("button");button.id="create-first-session";button.className="empty-action";button.textContent="＋ Nova sessão";button.addEventListener("click",()=>createSession(project));$("#transcript .empty-state").append(button);}
}
function clearSelectedSession(message="O worktree selecionado não existe mais no PC. O workspace foi atualizado."){
  clearInterval(state.poll);state.project=null;state.session=null;state.snapshot=null;state.catalog=null;state.catalogProjectId=null;state.explorerPath="";state.changes=null;localStorage.removeItem("monopad-last-session");sessionStorage.removeItem("monopad-last-session");
  $("#detail-project").textContent="—";$("#detail-cwd").textContent="—";$("#detail-branch").textContent="—";$("#detail-model").textContent="—";$("#detail-mode").textContent="—";$("#terminal-cwd").textContent="Terminal do host";
  renderNoSessionState(state.data?.projects?.[0],message);toast(message);
}
function startWorkspaceRefresh(){
  clearInterval(state.workspacePoll);state.workspacePoll=setInterval(()=>{if(!document.hidden)bootstrap().catch(()=>{});},5000);
}
async function bootstrap() {
  const selectedId=state.session?.id||"";
  const response=await fetch("/api/bootstrap",{headers:{Authorization:"Bearer "+state.token}});
  const payload=await response.json();
  if(!response.ok) throw new Error(payload.error || "Não foi possível conectar");
  state.data=payload;renderProjects();
  $("#host-name").textContent=payload.environment.name;$("#platform").textContent=payload.environment.platform || "host";$("#connection-dot").classList.add("online");
  const allSessions=Object.values(payload.sessions).flat();
  $("#inbox-count").textContent=String(allSessions.filter((session)=>session.needsInput).length)+" itens aguardando resposta";
  $("#archive-count").textContent=String(allSessions.filter((session)=>session.archived).length)+" sessões arquivadas";
  $("#agent-providers").textContent=(payload.environment.providers || []).join(" · ") || "Nenhum provedor detectado";
  if(selectedId){
    const nextProject=payload.projects.find((project)=>payload.sessions[project.id]?.some((session)=>session.id===selectedId));
    const nextSession=nextProject&&payload.sessions[nextProject.id].find((session)=>session.id===selectedId);
    if(!nextProject||!nextSession){clearSelectedSession();return;}
    state.project=nextProject;state.session=nextSession;$("#session-title").textContent=nextSession.title || "Sessão sem título";$("#session-provider").textContent=nextSession.harness || "Agente";setSessionStatus(nextSession.status);setRunningControls(nextSession.status==="running");$("#delete-session").disabled=false;$("#detail-project").textContent=nextProject.name;$("#detail-cwd").textContent=nextSession.worktreeCwd || nextSession.cwd || nextProject.cwd;$("#detail-branch").textContent=nextSession.branch || "—";$("#detail-model").textContent=nextSession.model || "—";$("#detail-mode").textContent=nextSession.runtimeMode || "—";$("#terminal-cwd").textContent=nextSession.worktreeCwd || nextSession.cwd || nextProject.cwd;document.querySelectorAll(".session-card").forEach((el)=>el.classList.toggle("active",el.dataset.session===selectedId));if(state.skillsCwd!==workspaceCwd()){await loadSkills();renderComposerControls();}return;
  }
  const remembered=state.settings.openLastSession && (localStorage.getItem("monopad-last-session") || sessionStorage.getItem("monopad-last-session"));const rememberedSession=remembered && allSessions.find((session)=>session.id===remembered);const firstProject=payload.projects[0];const firstSession=rememberedSession || (firstProject && payload.sessions[firstProject.id]?.[0]);const selectedProject=firstSession && payload.projects.find((project)=>payload.sessions[project.id]?.some((session)=>session.id===firstSession.id));
  if(firstSession && selectedProject) selectSession(selectedProject,firstSession);else renderNoSessionState(firstProject,payload.projects.length?"Escolha um projeto e crie uma sessão para começar.":"Nenhum projeto disponível no host.");
}
const PROJECT_STYLE_OPTIONS=[
  {value:"icon:folder",label:"Pasta",icon:"folder"},
  {value:"icon:sparkles",label:"Brilho",icon:"sparkles"},
  {value:"icon:terminal",label:"Terminal",icon:"terminal"},
  {value:"icon:dashboard",label:"Painel",icon:"dashboard"},
  {value:"icon:claude",label:"Claude",icon:"claude"},
  {value:"icon:codex",label:"Codex",icon:"codex"},
  {value:"icon:grok",label:"Grok",icon:"grok"},
  {value:"icon:cursor",label:"Cursor",icon:"cursor"},
  {value:"🪐",label:"Planeta"},
  {value:"🦊",label:"Raposa"},
  {value:"🐙",label:"Polvo"},
  {value:"🦉",label:"Coruja"},
  {value:"🐝",label:"Abelha"},
  {value:"🐼",label:"Panda"},
  {value:"🦄",label:"Unicórnio"},
  {value:"🐢",label:"Tartaruga"}
];
function renderProjectStyleOptions(selected){
  const list=$("#project-style-icons");if(!list)return;list.replaceChildren();
  for(const option of PROJECT_STYLE_OPTIONS){
    const button=document.createElement("button");button.type="button";button.className="project-style-option"+(option.value===selected?" active":"");button.dataset.projectMascot=option.value;button.setAttribute("aria-label",option.label);button.title=option.label;
    if(option.icon)button.innerHTML=uiIcon(option.icon);else button.textContent=option.value;
    button.addEventListener("click",()=>{list.querySelectorAll(".project-style-option").forEach((item)=>item.classList.remove("active"));button.classList.add("active");});
    list.append(button);
  }
}
function openProjectStyle(project){
  state.projectStyleTarget=project;const visual=projectVisual(project);$("#project-style-name").textContent=project.name+" · identidade somente no MonoPad";$("#project-style-color").value=visual.color;renderProjectStyleOptions(visual.mascot);$("#project-style-modal").hidden=false;$("#project-style-close").focus();
}
function closeProjectStyle(){state.projectStyleTarget=null;$("#project-style-modal").hidden=true;}
function saveProjectStyle(){
  const project=state.projectStyleTarget;if(!project)return;const selected=$("#project-style-icons .project-style-option.active")?.dataset.projectMascot||"icon:folder";let custom={};try{custom=JSON.parse(localStorage.getItem("monopad-project-visuals")||"{}")||{};}catch{}custom[String(project.id)]={color:$("#project-style-color").value,mascot:selected};localStorage.setItem("monopad-project-visuals",JSON.stringify(custom));closeProjectStyle();renderProjects();toast("Identidade do projeto atualizada");
}
function renderProjects() {
  const nav=$("#project-list");nav.replaceChildren();
  for(const project of state.data.projects){
    const section=document.createElement("section");section.className="project";
    const sessions=state.data.sessions[project.id] || [];
    const headingRow=document.createElement("div");headingRow.className="project-heading-row";
    const visual=projectVisual(project);
    section.style.setProperty("--project-color",visual.color);
    section.dataset.projectId=project.id;
    const heading=document.createElement("button");heading.className="project-button";heading.innerHTML="<span class=\"project-mascot\" aria-hidden=\"true\"></span><span class=\"project-icon\" data-icon=\"folder\"></span><b></b><small>"+sessions.length+"</small>";hydrateIcons(heading);const mascot=heading.querySelector(".project-mascot");if(String(visual.mascot||"").startsWith("icon:"))mascot.innerHTML=uiIcon(String(visual.mascot).slice(5));else mascot.textContent=visual.mascot;heading.querySelector("b").textContent=project.name;
    const styleButton=document.createElement("button");styleButton.className="project-style-button";styleButton.type="button";styleButton.innerHTML=uiIcon("settings");styleButton.title="Personalizar "+project.name;styleButton.setAttribute("aria-label","Personalizar "+project.name);styleButton.addEventListener("click",(event)=>{event.stopPropagation();openProjectStyle(project);});
    const createButton=document.createElement("button");createButton.className="new-session-button";createButton.innerHTML=uiIcon("plus");createButton.title="Nova sessão em "+project.name;createButton.setAttribute("aria-label","Nova sessão em "+project.name);createButton.addEventListener("click",()=>createSession(project));headingRow.append(heading,styleButton,createButton);section.append(headingRow);
    const list=document.createElement("div");list.className="project-sessions";
    for(const session of sessions){
      const button=document.createElement("button");button.className="session-card";button.dataset.session=session.id;
      const title=document.createElement("span");title.textContent=session.title || "Sessão sem título";
      const dot=document.createElement("i");dot.className=session.needsInput ? "input" : session.status;
      const meta=document.createElement("small");meta.textContent=`${session.harness || "agente"} · ${relativeTime(session.updatedAt)}`;
      button.append(title,dot,meta);button.addEventListener("click",()=>selectSession(project,session));list.append(button);
    }
    if (!sessions.length) { const empty=document.createElement("div");empty.className="project-empty";empty.textContent="Nenhuma sessão · toque + para criar";section.append(empty); }
    section.append(list);nav.append(section);
  }
}

async function createSession(project) {
  if (!state.ws || state.ws.readyState !== WebSocket.OPEN) { toast("Conectando ao host…"); return; }
  try {
    state.pendingNewProject = project;
    state.newCatalog = await rpc("models.list", { projectId: project.id });
    renderNewSessionForm();
    $("#new-session-project").textContent = `${project.name} · escolha a IA, o esforço e as permissões antes de iniciar.`;
    $("#new-session-modal").hidden = false;
    $("#new-session-provider").focus();
  } catch (error) { toast(error.message); }
}

async function submitNewSession() {
  const project = state.pendingNewProject;
  if (!project) return;
  const provider = $("#new-session-provider").value;
  const model = $("#new-session-model").value;
  if (!provider || !model) { toast("Escolha um provedor e um modelo"); return; }
  const selected = (state.newCatalog?.models?.[provider] || []).find((item) => item.id === model);
  try {
    $("#new-session-create").disabled = true;
    const receipt = await command("create", { projectId: project.id, harness: provider, model, modelSettings: collectModelSettings($("#new-session-settings")), runtimeMode: $("#new-session-mode").value });
    $("#new-session-modal").hidden = true;
    await bootstrap();
    const session = state.data.sessions[project.id]?.find((item) => item.id === receipt.sessionId);
    if (session) { await selectSession(project, session); toast(`${selected?.name || model} iniciado`); }
    else toast("Sessão criada. Toque em atualizar para carregá-la.");
  } catch (error) { toast(error.message); }
  finally { $("#new-session-create").disabled = false; }
}

async function selectSession(project,session){
  state.project=project;state.session=session;state.snapshot=null;state.catalog=null;state.catalogProjectId=null;state.skills=[];state.skillsCwd="";state.fileReferences=[];state.fileReferencesCwd="";state.fileReferencesLoaded=false;state.fileReferencePromise=null;state.autoPicker="";state.parentExpanded.clear();state.attachments=[];renderAttachments();
  localStorage.setItem("monopad-last-session",session.id);sessionStorage.setItem("monopad-last-session",session.id);
  $("#worktree-path").textContent=session.worktreeCwd || session.cwd || project.cwd || "Nenhum worktree selecionado";
  document.querySelectorAll(".session-card").forEach((el)=>el.classList.toggle("active",el.dataset.session===session.id));
  $("#session-title").textContent=session.title || "Sessão sem título";$("#session-provider").textContent=session.harness || "Agente";
  setSessionStatus(session.status);$("#composer").hidden=false;$("#prompt").disabled=false;$("#delete-session").disabled=false;setRunningControls(session.status==="running");setComposerDisabled(true);
  $("#detail-project").textContent=project.name;$("#detail-cwd").textContent=session.worktreeCwd || session.cwd || project.cwd;$("#detail-branch").textContent=session.branch || "—";$("#detail-model").textContent=session.model || "—";$("#detail-mode").textContent=session.runtimeMode || "—";$("#terminal-cwd").textContent=session.worktreeCwd || session.cwd || project.cwd;
  closeSidebar();await syncSession(true);
  await loadModelCatalog(project.id);
  await loadSkills();
  loadFileReferences();
  renderComposerControls();
  clearInterval(state.poll);if(state.settings.autoRefresh)state.poll=setInterval(()=>syncSession(false),1500);
}

const PERMISSION_LABELS = {
  supervised: "Supervised",
  "auto-accept-edits": "Auto-accept edits",
  auto: "Auto",
  "full-access": "Full access",
};
const PERMISSION_HINTS = {
  supervised: "Pergunta antes de comandos e alterações.",
  "auto-accept-edits": "Aceita edições, mas pergunta antes de outras ações.",
  auto: "Um revisor de IA aprova ou recusa ações.",
  "full-access": "Permite comandos e alterações sem prompts nos turnos normais.",
};
function workspaceCwd(){return state.session?.worktreeCwd||state.session?.cwd||state.project?.cwd||"";}
function currentSessionConfig(){return state.snapshot?.session||state.session||{};}
async function loadSkills(){
  const cwd=workspaceCwd();
  if(!cwd||!state.ws||state.ws.readyState!==WebSocket.OPEN)return;
  try{const result=await rpc("skills.list",{cwd,harness:state.session?.harness});state.skills=Array.isArray(result)?result:(result?.skills||[]);state.skillsCwd=cwd;renderSkillOptions($("#skills-search")?.value||"");}
  catch(error){state.skills=[];state.skillsCwd=cwd;toast("Skills indisponíveis: "+error.message);}
}
async function loadFileReferences(){
  const cwd=workspaceCwd();
  if(!cwd||!state.ws||state.ws.readyState!==WebSocket.OPEN)return [];
  if(state.fileReferencesLoaded&&state.fileReferencesCwd===cwd)return state.fileReferences;
  if(state.fileReferencePromise)return state.fileReferencePromise;
  state.fileReferencePromise=(async()=>{
    const found=[];const pending=[{path:"",depth:0}];const seen=new Set();const ignored=new Set([".git","node_modules","dist","build","coverage",".next",".turbo"]);
    while(pending.length&&found.length<500){
      const current=pending.shift();const key=current.path||".";
      if(seen.has(key))continue;seen.add(key);
      let entries=[];
      try{entries=await rpc("files.list",{projectId:state.project.id,cwd,path:current.path});}catch{break;}
      for(const entry of entries||[]){
        if(!entry?.name||ignored.has(entry.name))continue;
        const path=entry.path||[current.path,entry.name].filter(Boolean).join("/");
        if(entry.isDir){if(current.depth<4)pending.push({path,depth:current.depth+1});}
        else found.push({path,name:entry.name});
        if(found.length>=500)break;
      }
    }
    state.fileReferences=found.sort((a,b)=>a.path.localeCompare(b.path,"pt-BR"));state.fileReferencesCwd=cwd;state.fileReferencesLoaded=true;return state.fileReferences;
  })().catch(()=>{state.fileReferences=[];state.fileReferencesCwd=cwd;state.fileReferencesLoaded=true;return [];}).finally(()=>{state.fileReferencePromise=null;});
  return state.fileReferencePromise;
}
function renderFileOptions(query=""){
  const list=$("#file-options");if(!list)return;list.replaceChildren();
  const normalized=String(query||"").trim().toLowerCase();const entries=state.fileReferences.filter((file)=>!normalized||file.path.toLowerCase().includes(normalized));
  if(!entries.length){const note=document.createElement("p");note.className="picker-note";note.textContent=state.fileReferencesLoaded?"Nenhum arquivo corresponde à busca.":"Carregando arquivos do workspace…";list.append(note);return;}
  for(const file of entries.slice(0,80)){const button=document.createElement("button");button.type="button";button.className="picker-option file-option";button.setAttribute("role","option");button.innerHTML="<span><b></b><small></small></span><i data-icon=\"plus\"></i>";hydrateIcons(button);button.querySelector("b").textContent=file.name;button.querySelector("small").textContent=file.path;button.addEventListener("click",()=>chooseFileReference(file));list.append(button);}
  if(entries.length>80){const note=document.createElement("p");note.className="picker-note";note.textContent="Mostrando 80 de "+entries.length+" arquivos. Refine a busca.";list.append(note);}
}
async function openFilePicker(){
  closeComposerPickers();state.autoPicker="";$("#file-picker").hidden=false;renderFileOptions($("#file-search").value);$("#file-search").focus();await loadFileReferences();renderFileOptions($("#file-search").value);
}
function chooseFileReference(file){
  const input=$("#prompt");const cursor=input.selectionStart??input.value.length;const before=input.value.slice(0,cursor);const match=before.match(/(?:^|\s)@([^\s]*)$/);const start=match?before.length-match[0].length+(match[0].startsWith(" ")?1:0):cursor;input.value=input.value.slice(0,start)+"@"+file.path+" "+input.value.slice(cursor);const position=start+file.path.length+2;input.setSelectionRange(position,position);resizePrompt();$("#file-picker").hidden=true;state.autoPicker="";input.focus();}
function renderSkillOptions(query=""){
  const list=$("#skills-options");if(!list)return;list.replaceChildren();
  const normalized=String(query||"").trim().toLowerCase();
  const entries=state.skills.filter((skill)=>!normalized||`${skill.invocation} ${skill.name} ${skill.description}`.toLowerCase().includes(normalized));
  if(!entries.length){const note=document.createElement("p");note.className="picker-note";note.textContent=state.skills.length?"Nenhuma skill corresponde à busca.":"Nenhuma skill encontrada neste projeto ou no seu perfil do MonoCode.";list.append(note);return;}
  for(const skill of entries){const button=document.createElement("button");button.type="button";button.className="picker-option skill-option";button.setAttribute("role","option");button.innerHTML="<span><b></b><small></small></span><i data-icon=\"plus\"></i>";hydrateIcons(button);button.querySelector("b").textContent=`/${skill.invocation}`;button.querySelector("small").textContent=`${skill.scope||"local"} · ${skill.description||"Skill do agente"}`;button.addEventListener("click",()=>chooseSkill(skill));list.append(button);}
}
async function openSkillsPicker(){closeComposerPickers();$("#skills-picker").hidden=false;$("#skills-options").innerHTML='<p class="picker-note">Atualizando skills do host…</p>';await loadSkills();renderSkillOptions($("#skills-search").value);$("#skills-search").focus();}
function chooseSkill(skill){
  const input=$("#prompt");const cursor=input.selectionStart??input.value.length;const before=input.value.slice(0,cursor);const match=before.match(/(?:^|\s)\/([a-z0-9_-]*)$/i);const start=match?before.length-match[0].length+(match[0].startsWith(" ")?1:0):cursor;const next=input.value.slice(0,start)+`/${skill.invocation} `+input.value.slice(cursor);input.value=next;const position=start+skill.invocation.length+2;input.setSelectionRange(position,position);resizePrompt();closeComposerPickers();input.focus();}
function updateSkillSuggestions(){
  const input=$("#prompt");const before=input.value.slice(0,input.selectionStart??input.value.length);const skillMatch=before.match(/(?:^|\s)\/([a-z0-9_-]*)$/i);const fileMatch=before.match(/(?:^|\s)@([^\s]*)$/);
  if(fileMatch){
    state.autoPicker="file";$("#skills-picker").hidden=true;$("#file-picker").hidden=false;renderFileOptions(fileMatch[1]);loadFileReferences().then(()=>{if(state.autoPicker==="file"){const current=input.value.slice(0,input.selectionStart??input.value.length).match(/(?:^|\s)@([^\s]*)$/);if(current)renderFileOptions(current[1]);}});
    return;
  }
  if(skillMatch&&state.skills.length){
    state.autoPicker="skill";$("#file-picker").hidden=true;renderSkillOptions(skillMatch[1]);$("#skills-picker").hidden=false;return;
  }
  if(state.autoPicker){state.autoPicker="";$("#skills-picker").hidden=true;$("#file-picker").hidden=true;}
}
function modelForSession(){
  const session=currentSessionConfig();
  const listed=state.catalog?.models?.[session.harness]||[];
  return listed.find((model)=>model.id===session.model)||{id:session.model||"",name:String(session.model||"Modelo").replace(/^[^:]+:/,"")};
}
function settingDefinitions(model,values={}){
  const defs=[...(model?.settings||[])];
  for(const id of Object.keys(values||{}))if(!defs.some((setting)=>setting.id===id))defs.push({id,label:id,kind:"select",value:values[id],options:[{value:values[id],label:values[id]}]});
  return defs;
}
function settingOptionLabel(setting,value){return (setting.options||[]).find((option)=>option.value===value)?.label||value||setting.value||"—";}
function renderModelSettings(container,model,values={},empty="Este modelo não expõe configurações adicionais."){
  container.replaceChildren();
  const defs=settingDefinitions(model,values);
  if(!defs.length){const note=document.createElement("p");note.className="picker-note";note.textContent=empty;container.append(note);return defs;}
  for(const setting of defs){
    const row=document.createElement("label");row.className="picker-setting";
    const copy=document.createElement("span");copy.innerHTML="<b></b><small></small>";copy.querySelector("b").textContent=setting.label||setting.id;copy.querySelector("small").textContent=setting.description||"Aplicado ao próximo turno.";
    const select=document.createElement("select");select.dataset.modelSetting=setting.id;
    let options=setting.options?.length?[...setting.options]:[{value:setting.value||"",label:setting.value||"Padrão"}];
    if(setting.kind==="toggle"&&!setting.options?.length)options=[{value:"true",label:"Ativado"},{value:"false",label:"Desativado"}];
    const chosen=values[setting.id]??setting.value??options[0]?.value??"";
    for(const option of options){const item=document.createElement("option");item.value=option.value;item.textContent=option.label||option.value;item.selected=option.value===chosen;select.append(item);}
    row.append(copy,select);container.append(row);
  }
  return defs;
}
function collectModelSettings(container){return Object.fromEntries([...container.querySelectorAll("[data-model-setting]")].map((control)=>[control.dataset.modelSetting,control.value]));}
function closeComposerMenu(){const menu=$("#composer-menu");if(menu){menu.hidden=true;$("#composer-plus")?.setAttribute("aria-expanded","false");}}
function backToComposerMenu(){document.querySelectorAll(".composer-popover").forEach((popover)=>popover.hidden=true);state.autoPicker="";const menu=$("#composer-menu");if(menu){menu.hidden=false;$("#composer-plus")?.setAttribute("aria-expanded","true");}}
function toggleComposerMenu(){const menu=$("#composer-menu");if(!menu)return;closeComposerPickers();menu.hidden=!menu.hidden;$("#composer-plus")?.setAttribute("aria-expanded",String(!menu.hidden));}
function openAttachmentPicker(){const input=$("#composer-file-input");if(!input)return;input.value="";input.accept="*/*";input.removeAttribute("capture");closeComposerMenu();input.click();}
function renderAttachments(){const list=$("#attachment-list");if(!list)return;list.replaceChildren();list.hidden=!state.attachments.length;for(const attachment of state.attachments){const item=document.createElement("div");item.className="attachment-chip";if(attachment.type?.startsWith("image/")&&attachment.data){const image=document.createElement("img");image.src=attachment.data;image.alt="";item.append(image);}const name=document.createElement("span");name.textContent=attachment.name;const remove=document.createElement("button");remove.type="button";remove.className="attachment-remove";remove.innerHTML=uiIcon("x");remove.setAttribute("aria-label",`Remover ${attachment.name}`);remove.addEventListener("click",()=>{state.attachments=state.attachments.filter((entry)=>entry.id!==attachment.id);renderAttachments();});item.append(name,remove);list.append(item);}}
function fileAsDataUrl(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||""));reader.onerror=()=>reject(reader.error||new Error("Não foi possível ler o arquivo"));reader.readAsDataURL(file);});}
async function handleComposerFiles(event){const files=[...event.target.files||[]];for(const file of files){if(file.size>8*1024*1024){toast(`${file.name} é maior que 8 MB.`);continue;}try{const data=await fileAsDataUrl(file);state.attachments.push({id:requestId(),name:file.name,type:file.type||"application/octet-stream",size:file.size,data});}catch(error){toast(error.message);}}renderAttachments();}

function setComposerDisabled(disabled){["#model-button","#effort-button","#permission-button","#skills-button"].forEach((selector)=>{const element=$(selector);if(element)element.disabled=disabled||(selector==="#skills-button"&&!state.skills.length);});}
async function loadModelCatalog(projectId){
  if(!projectId||!state.ws||state.ws.readyState!==WebSocket.OPEN)return;
  try{state.catalog=await rpc("models.list",{projectId});state.catalogProjectId=projectId;}catch(error){state.catalog={models:{},errors:{}};toast("Modelos indisponíveis: "+error.message);}
}
function renderComposerControls(){
  if(!state.session)return;
  const session=currentSessionConfig();const model=modelForSession();const values=session.modelSettings||{};const defs=settingDefinitions(model,values);
  $("#model-label").textContent=model.name||String(session.model||"Modelo").replace(/^[^:]+:/,"");
  $("#effort-button").disabled=!defs.length;const primary=defs.find((setting)=>/effort|reasoning/i.test(setting.id))||defs[0];
  $("#effort-label").textContent=primary?settingOptionLabel(primary,values[primary.id]??primary.value):"Config";
  $("#permission-label").textContent=PERMISSION_LABELS[session.runtimeMode]||session.runtimeMode||"Supervised";
  renderModelSettings($("#session-model-settings"),model,values);
  setComposerDisabled(false);
}
function closeComposerPickers(){document.querySelectorAll(".composer-popover").forEach((popover)=>popover.hidden=true);state.autoPicker="";closeComposerMenu();}
function renderModelOptions(query=""){
  const list=$("#model-options");list.replaceChildren();const session=currentSessionConfig();const entries=(state.catalog?.models?.[session.harness]||[]).filter((model)=>(String(model.name||"")+" "+model.id).toLowerCase().includes(query.toLowerCase()));
  if(!entries.length){const note=document.createElement("p");note.className="picker-note";note.textContent=state.catalog?.errors?.[session.harness]||"Nenhum modelo autenticado foi encontrado para este agente.";list.append(note);return;}
  for(const model of entries){const button=document.createElement("button");button.type="button";button.className="picker-option";button.dataset.modelId=model.id;button.innerHTML="<span><b></b><small></small></span><i data-icon=\"check\"></i>";hydrateIcons(button);button.querySelector("b").textContent=model.name||model.id;button.querySelector("small").textContent=model.id;button.querySelector("i").hidden=model.id!==session.model;button.addEventListener("click",()=>chooseSessionModel(model));list.append(button);}
}
function openModelPicker(){closeComposerPickers();renderModelOptions($("#model-search").value);$("#model-picker").hidden=false;}
async function chooseSessionModel(model){
  const session=currentSessionConfig();const values=session.modelSettings||{};const next={};
  for(const setting of settingDefinitions(model,{})){const candidate=values[setting.id];next[setting.id]=(setting.options||[]).some((option)=>option.value===candidate)?candidate:(candidate??setting.value??setting.options?.[0]?.value??"");}
  await configureSession({model:model.id,modelSettings:next});
}
function openEffortPicker(){closeComposerPickers();renderModelSettings($("#session-model-settings"),modelForSession(),currentSessionConfig().modelSettings||{});$("#effort-picker").hidden=false;}
function openPermissionPicker(){
  closeComposerPickers();const list=$("#permission-options");list.replaceChildren();const current=currentSessionConfig().runtimeMode||"supervised";
  for(const value of Object.keys(PERMISSION_LABELS)){const button=document.createElement("button");button.type="button";button.className="permission-option"+(value===current?" active":"");button.innerHTML="<span><b></b><small></small></span><i></i>";button.querySelector("b").textContent=PERMISSION_LABELS[value];button.querySelector("small").textContent=PERMISSION_HINTS[value];button.querySelector("i").innerHTML=value===current?uiIcon("check"):"";button.addEventListener("click",()=>configureSession({runtimeMode:value}));list.append(button);}
  $("#permission-picker").hidden=false;
}
async function configureSession(patch){
  const session=currentSessionConfig();if(!session.id)return;
  try{await command("configure",{sessionId:session.id,model:patch.model??session.model,modelSettings:patch.modelSettings??session.modelSettings??{},runtimeMode:patch.runtimeMode??session.runtimeMode??"supervised"});closeComposerPickers();await syncSession(true);toast("Configuração salva no host");}
  catch(error){toast(error.message);}
}
function renderNewSessionForm(){
  const providers=state.data?.environment?.providers?.filter((provider)=>(state.newCatalog?.models?.[provider]||[]).length)||[];const select=$("#new-session-provider");select.replaceChildren();
  for(const provider of providers){const option=document.createElement("option");option.value=provider;option.textContent=provider[0].toUpperCase()+provider.slice(1);select.append(option);}
  if(!providers.length){const option=document.createElement("option");option.textContent="Nenhum provedor autenticado";option.disabled=true;select.append(option);}
  renderNewSessionModels();
}
function renderNewSessionModels(){
  const provider=$("#new-session-provider").value;const models=state.newCatalog?.models?.[provider]||[];const select=$("#new-session-model");select.replaceChildren();
  for(const model of models){const option=document.createElement("option");option.value=model.id;option.textContent=model.name||model.id;select.append(option);}
  renderNewSessionSettings();
}
function renderNewSessionSettings(){const provider=$("#new-session-provider").value;const modelId=$("#new-session-model").value;const model=(state.newCatalog?.models?.[provider]||[]).find((item)=>item.id===modelId);renderModelSettings($("#new-session-settings"),model,{});}
function setWorkspaceView(view){
  state.workspaceView=view;document.querySelectorAll(".workspace-nav-item").forEach((item)=>{const active=item.dataset.workspaceView===view;item.classList.toggle("active",active);item.setAttribute("aria-selected",String(active));});document.querySelectorAll(".workspace-view").forEach((panel)=>{panel.hidden=panel.dataset.workspacePanel!==view;panel.classList.toggle("active",panel.dataset.workspacePanel===view);});
  if(view==="explorer")loadExplorer();if(view==="changes")loadChanges();
}
function renderExplorer(entries){
  const list=$("#explorer-list");list.replaceChildren();$("#explorer-path").textContent=state.explorerPath||state.project?.name||"Raiz do projeto";$("#explorer-up").disabled=!state.explorerPath;
  if(!entries.length){const empty=document.createElement("div");empty.className="workspace-empty";empty.textContent="Nenhum arquivo nesta pasta.";list.append(empty);return;}
  for(const entry of entries.filter((item)=>item.name!==".git")){const button=document.createElement("button");button.type="button";button.className="file-row"+(entry.ignored?" ignored":"");button.innerHTML="<span class=\"file-icon\"></span><span class=\"file-name\"></span>";button.querySelector(".file-icon").innerHTML=uiIcon(entry.isDir?"folder":"file");button.querySelector(".file-name").textContent=entry.name;button.title=entry.path;button.addEventListener("click",()=>entry.isDir?loadExplorer(entry.path):viewFile(entry.path));list.append(button);}
}
async function loadExplorer(path=state.explorerPath){
  if(!state.project){renderExplorer([]);$("#explorer-list").innerHTML="<div class=\"workspace-empty\">Selecione uma sessão para explorar os arquivos do host.</div>";return;}
  state.explorerPath=path;$("#explorer-list").innerHTML="<div class=\"workspace-loading\">Carregando arquivos…</div>";
  try{const entries=await rpc("files.list",{projectId:state.project.id,cwd:workspaceCwd(),path});state.explorerEntries=entries;renderExplorer(entries);}catch(error){$("#explorer-list").innerHTML="<div class=\"workspace-empty\">"+safeText(error.message)+"</div>";}
}
function renderChanges(index){
  const list=$("#changes-list");list.replaceChildren();$("#changes-branch").textContent=index.branch?"Changes · "+index.branch:"Changes";$("#changes-summary").innerHTML="<span class=\"change-add\">+"+(index.additions||0)+"</span><span class=\"change-del\">−"+(index.deletions||0)+"</span><span>"+(index.files?.length||0)+" arquivos</span>";
  if(!index.files?.length){const empty=document.createElement("div");empty.className="workspace-empty";empty.textContent="Nenhuma alteração local.";list.append(empty);return;}
  for(const file of index.files){const button=document.createElement("button");button.type="button";button.className="file-row change-row";button.innerHTML="<span class=\"change-status\"></span><span class=\"file-name\"></span><small></small>";button.querySelector(".change-status").textContent=file.status[0]?.toUpperCase()||"M";button.querySelector(".file-name").textContent=file.relative;button.querySelector("small").textContent="+"+(file.additions||0)+" −"+(file.deletions||0);button.addEventListener("click",()=>viewDiff(file));list.append(button);}
}
async function loadChanges(){
  if(!state.project){$("#changes-summary").replaceChildren();$("#changes-list").innerHTML="<div class=\"workspace-empty\">Selecione uma sessão para ver as alterações.</div>";return;}
  $("#changes-list").innerHTML="<div class=\"workspace-loading\">Lendo Git…</div>";
  try{state.changes=await rpc("git.index",{projectId:state.project.id,cwd:workspaceCwd()});renderChanges(state.changes);}catch(error){$("#changes-list").innerHTML="<div class=\"workspace-empty\">"+safeText(error.message)+"</div>";}
}
function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,(character)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[character]));}
function inlineMarkdown(value){
  let html=escapeHtml(value);
  html=html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  html=html.replace(/`([^`]+)`/g,"<code>$1</code>");
  html=html.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
  html=html.replace(/__([^_]+)__/g,"<strong>$1</strong>");
  html=html.replace(/\*([^*]+)\*/g,"<em>$1</em>");
  html=html.replace(/_([^_]+)_/g,"<em>$1</em>");
  return html;
}
function splitMarkdownTableRow(value){
  let text=String(value??'').trim();
  if(text.startsWith('|'))text=text.slice(1);
  if(text.endsWith('|')&&!text.endsWith('\\|'))text=text.slice(0,-1);
  const cells=[];let cell='';let escaped=false;
  for(const character of text){
    if(escaped){cell+=character;escaped=false;continue;}
    if(character==='\\'){escaped=true;continue;}
    if(character==='|'){cells.push(cell.trim());cell='';}else cell+=character;
  }
  if(escaped)cell+='\\';
  cells.push(cell.trim());
  return cells;
}
function isMarkdownTableSeparator(value){return splitMarkdownTableRow(value).length>0&&splitMarkdownTableRow(value).every((cell)=>/^:?-{3,}:?$/.test(cell.replace(/\s+/g,'')));}
function isMarkdownTableRow(value){return typeof value==='string'&&value.trim().length>0&&value.includes('|');}
function readMarkdownTable(lines,start){
  if(start+1>=lines.length||!isMarkdownTableRow(lines[start])||!isMarkdownTableSeparator(lines[start+1]))return null;
  const headers=splitMarkdownTableRow(lines[start]);if(headers.length<2)return null;
  const rows=[];let next=start+2;
  while(next<lines.length&&isMarkdownTableRow(lines[next])){const row=splitMarkdownTableRow(lines[next]);if(row.length<2)break;rows.push(row);next+=1;}
  return {headers,rows,next};
}
function markdownToHtml(markdown){
  const lines=String(markdown??"").replace(/\r\n?/g,"\n").split("\n");const html=[];let paragraph=[];let index=0;
  const flushParagraph=()=>{if(paragraph.length){html.push(`<p>${paragraph.map(inlineMarkdown).join("<br>")}</p>`);paragraph=[];}};
  while(index<lines.length){
    const line=lines[index];
    if(/^\s*```/.test(line)){
      flushParagraph();const code=[];index+=1;while(index<lines.length&&!/^\s*```/.test(lines[index])){code.push(lines[index]);index+=1;}if(index<lines.length)index+=1;html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);continue;
    }
    const table=readMarkdownTable(lines,index);
    if(table){flushParagraph();html.push(`<div class="markdown-table-wrap"><table><thead><tr>${table.headers.map((cell)=>`<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${table.rows.map((row)=>`<tr>${table.headers.map((_,column)=>`<td>${inlineMarkdown(row[column]||"")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);index=table.next;continue;}
    const heading=line.match(/^\s*(#{1,6})\s+(.+?)\s*#*\s*$/);if(heading){flushParagraph();const level=heading[1].length;html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);index+=1;continue;}
    if(/^\s*[-*_](?:\s*[-*_]){2,}\s*$/.test(line)){flushParagraph();html.push("<hr>");index+=1;continue;}
    if(/^\s*>/.test(line)){flushParagraph();const quote=[];while(index<lines.length&&/^\s*>/.test(lines[index])){quote.push(lines[index].replace(/^\s*>\s?/,""));index+=1;}html.push(`<blockquote>${quote.map(inlineMarkdown).join("<br>")}</blockquote>`);continue;}
    const unordered=line.match(/^\s*[-*+]\s+(.+)/);const ordered=line.match(/^\s*\d+[.)]\s+(.+)/);if(unordered||ordered){flushParagraph();const orderedList=Boolean(ordered);const items=[];while(index<lines.length){const match=lines[index].match(orderedList?/^\s*\d+[.)]\s+(.+)/:/^\s*[-*+]\s+(.+)/);if(!match)break;items.push(`<li>${inlineMarkdown(match[1])}</li>`);index+=1;}html.push(`<${orderedList?"ol":"ul"}>${items.join("")}</${orderedList?"ol":"ul"}>`);continue;}
    if(!line.trim()){flushParagraph();index+=1;continue;}
    paragraph.push(line.trim());index+=1;
  }
  flushParagraph();return html.join("");
}
function fileExtension(path){return String(path||"").toLowerCase().split(/[?#]/,1)[0].split(".").pop()||"";}
function viewerLanguage(path,mode){if(mode==="diff")return "Diff";const extension=fileExtension(path);return extension?extension.toUpperCase():"Texto";}
function escapeRegExp(value){return String(value||"").replace(/[\\^$.*+?()[\]{}|]/g,"\\$&");}
function renderFileViewerSource(){
  const source=$("#file-viewer-content"),gutter=$("#file-viewer-gutter");if(!source||!gutter||!state.fileViewer)return;
  const lines=String(state.fileViewer.source||"").split("\n");const query=String(state.fileViewer.query||"").trim();const pattern=query?new RegExp(escapeRegExp(query),"gi"):null;
  gutter.innerHTML=lines.map((_,index)=>"<span>"+(index+1)+"</span>").join("");
  source.innerHTML=lines.map((line,lineIndex)=>{
    let html=escapeHtml(line)||"&nbsp;";if(pattern)html=html.replace(pattern,(match)=>"<mark>"+match+"</mark>");
    const className=state.fileViewer.mode==="diff"?(line.startsWith("+++")||line.startsWith("---")?"diff-header":line.startsWith("+")?"diff-add":line.startsWith("-")?"diff-remove":""):"";
    return '<span class="code-line '+className+'" data-line="'+(lineIndex+1)+'">'+html+'</span>';
  }).join("");
  const first=source.querySelector("mark");$("#file-viewer-position").textContent="Ln "+(first?first.closest(".code-line")?.dataset.line||1:1)+" · "+lines.length+" linhas";$("#file-viewer-language").textContent=viewerLanguage(state.fileViewer.path,state.fileViewer.mode);if(first)first.scrollIntoView({block:"center",inline:"nearest"});
}
function setFileViewerMode(showPreview){
  const source=$("#file-viewer-content"),editor=source.closest(".file-editor-pane"),preview=$("#file-viewer-preview-pane"),button=$("#file-viewer-preview");if(!state.fileViewer||button.hidden)return;
  state.fileViewer.showPreview=Boolean(showPreview);editor.hidden=state.fileViewer.showPreview;preview.hidden=!state.fileViewer.showPreview;button.textContent=state.fileViewer.showPreview?"Ver código":"Pré-visualizar";button.setAttribute("aria-pressed",String(state.fileViewer.showPreview));
}
function closeFileViewer(){state.fileViewer=null;$("#file-viewer").hidden=true;}
function showFileViewer(title,meta,content,{path=title,previewable=true,previewContent,mode="file"}={}){
  const raw=safeText(content);const previewRaw=safeText(previewContent??raw);const extension=fileExtension(path);let display=raw;let label=meta;
  if(extension==="json"){
    try{display=JSON.stringify(JSON.parse(raw),null,2);label+=" · JSON formatado";}catch{label+=" · JSON";}
  }
  const isMarkdown=previewable&&["md","markdown","mdx"].includes(extension);state.fileViewer={path,source:display,query:"",mode,showPreview:isMarkdown};const source=$("#file-viewer-content"),preview=$("#file-viewer-preview-pane"),previewButton=$("#file-viewer-preview"),search=$("#file-viewer-search");
  $("#file-viewer-title").textContent=title;$("#file-viewer-meta").textContent=label;search.value="";preview.innerHTML=isMarkdown?markdownToHtml(previewRaw):"";renderFileViewerSource();previewButton.hidden=!isMarkdown;setFileViewerMode(isMarkdown);$("#file-viewer").hidden=false;
}
function toggleFileViewerPreview(){if(!state.fileViewer)return;setFileViewerMode(!state.fileViewer.showPreview);}
async function viewFile(path){try{const content=await rpc("files.read",{projectId:state.project.id,cwd:workspaceCwd(),path});showFileViewer(path,"Explorer · somente leitura",content,{path});}catch(error){toast(error.message);}}
async function viewDiff(file){try{const diff=await rpc("git.fileDiff",{projectId:state.project.id,cwd:workspaceCwd(),path:file.relative,staged:file.staged&&!file.unstaged});const content=diff.binary?"Arquivo binário — não há prévia textual.":"--- original ("+file.status+")\n"+(diff.original||"")+"\n\n+++ atual\n"+(diff.current||"");const extension=fileExtension(file.relative);const isMarkdown=["md","markdown","mdx"].includes(extension);showFileViewer(file.relative,"Changes · "+file.status,content,{path:file.relative,previewable:isMarkdown,previewContent:isMarkdown?diff.current:"",mode:"diff"});}catch(error){toast(error.message);}}

function setSessionStatus(status){ const el=$("#session-status");el.textContent=state.cancelling&&status==="running"?"Parando…":statusLabel(status);el.className=`status-pill ${state.cancelling&&status==="running"?"running":status||"neutral"}`; }
function setRunningControls(running){
  const stopping=running&&state.cancelling;
  const interrupt=$("#interrupt");const send=$("#send");
  if(interrupt){interrupt.disabled=!running||stopping;$("#interrupt-label").textContent=stopping?"Parando…":"Parar";}
  if(send&&state.session){send.disabled=stopping;send.textContent=stopping?"Parando…":running?"Parar":"Enviar";send.classList.toggle("composer-stop-action",running);send.setAttribute("aria-label",running?"Parar agente":"Enviar instrução");}
}
async function syncSession(force){
  if(!state.session || !state.ws || state.ws.readyState!==WebSocket.OPEN)return;
  try{
    const revision=force?undefined:state.snapshot?.revision;const sync=await rpc("sessions.sync",{sessionId:state.session.id,...(revision!==undefined?{revision}:{})});
    if(sync.kind==="unchanged")return;
    if(sync.kind==="snapshot")state.snapshot=sync.value;
    else if(sync.kind==="delta"){
      if(!state.snapshot||state.snapshot.revision!==sync.base)return syncSession(true);
      const changed=new Map((sync.blocks||[]).map((block)=>[block.id,block]));const old=new Map(state.snapshot.session.blocks.map((block)=>[block.id,block]));
      state.snapshot={...sync.value,session:{...sync.value.session,blocks:sync.blockIds.map((id)=>changed.get(id)||old.get(id)).filter(Boolean)}};
    } else if(sync.kind==="chunked") { toast("Conversa longa: abra novamente para carregar o histórico completo.");return; }
    renderSnapshot();
  }catch(error){ if(force)toast(error.message); }
}

function renderSnapshot(){
  const snapshot=state.snapshot;if(!snapshot)return;const blocks=snapshot.session?.blocks || [];const transcript=$("#transcript");transcript.replaceChildren();
  const activityKinds=new Set(["reasoning","tool","plan","tasks","system"]);const entries=[];let parent=null;let userOwner=null;
  for(const block of blocks){
    const kind=blockKind(block);
    if(kind==="user"){const entry={type:"plain",block,kind,directActivities:[]};entries.push(entry);userOwner=entry;parent=null;continue;}
    if(kind==="assistant"){parent={type:"assistant",block,activities:[],pairedWithUser:Boolean(userOwner),collapseOwnerId:userOwner?.block?.id||""};entries.push(parent);userOwner=null;continue;}
    if(activityKinds.has(kind)){
      if(parent?.type==="assistant")parent.activities.push({block,kind});
      else if(userOwner)userOwner.directActivities.push({block,kind});
      else entries.push({type:"plain",block,kind});
      continue;
    }
    entries.push({type:"plain",block,kind});parent=null;userOwner=null;
  }
  for(let index=0;index<entries.length;index++){
    const entry=entries[index];
    const article=document.createElement("article");article.className="message "+(entry.kind||"assistant");
    if(entry.type==="assistant")renderAssistantBlock(article,entry.block,entry.activities,Boolean(entry.pairedWithUser),entry.collapseOwnerId);
    else if(activityKinds.has(entry.kind))renderActivityBlock(article,entry.block,entry.kind);
    else{
      const direct=entry.directActivities||[];const next=entries[index+1];const paired=entry.kind==="user"&&next?.type==="assistant"&&next.activities?.length;const collapseKey=direct.length?String(entry.block.id||""):paired?String(next.collapseOwnerId||next.block.id||""):"";
      renderUserMessage(article,entry.block,collapseKey,Boolean(direct.length||paired));
      transcript.append(article);
      if(direct.length)renderExecutionGroup(transcript,direct,collapseKey);
      continue;
    }
    transcript.append(article);
  }
  if(!blocks.length)transcript.innerHTML='<div class="empty-state"><div class="pulse-ring"></div><h3>Sessão vazia</h3><p>Envie a primeira instrução abaixo.</p></div>';
  const liveIds=new Set(blocks.map((block)=>block.id));for(const id of state.parentExpanded)if(!liveIds.has(id))state.parentExpanded.delete(id);
  if(snapshot.status!=="running")state.cancelling=false;setSessionStatus(snapshot.status);setRunningControls(snapshot.status==="running");$("#detail-model").textContent=snapshot.session?.model || "—";$("#detail-mode").textContent=snapshot.session?.runtimeMode || "—";renderComposerControls();transcript.scrollTop=transcript.scrollHeight;
}

function connectSocket(){
  if(state.ws)state.ws.close();const protocol=location.protocol==="https:"?"wss":"ws";const ws=new WebSocket(`${protocol}://${location.host}/ws?token=${encodeURIComponent(state.token)}`);state.ws=ws;
  ws.addEventListener("open",()=>{$("#connection-dot").classList.add("online");if(state.session)syncSession(true);});
  ws.addEventListener("close",()=>{$("#connection-dot").classList.remove("online");setTimeout(()=>{if(state.token||!$("#app").hidden)connectSocket();},1800);});
  ws.addEventListener("message",(event)=>{const message=JSON.parse(event.data);if(message.type==="rpc.result"||message.type==="command.result"||message.type==="error"){const pending=state.rpc.get(message.id);if(pending){state.rpc.delete(message.id);message.error?pending.reject(new Error(message.error)):pending.resolve(message.result);}}
    if(message.type==="terminal.data"&&state.terminal)state.terminal.write(message.data);if(message.type==="terminal.exit"){state.terminalOpen=false;state.terminal?.writeln(`\r\n[processo encerrado: ${message.exitCode}]`);}
  });
}
function waitForSocket(){
  if(state.ws?.readyState===WebSocket.OPEN)return Promise.resolve();
  const ws=state.ws;if(!ws)return Promise.reject(new Error("Conexão com o host não foi iniciada"));
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>finish(new Error("Não foi possível conectar ao host")),8000);
    const finish=(error)=>{clearTimeout(timer);ws.removeEventListener("open",onOpen);ws.removeEventListener("error",onError);ws.removeEventListener("close",onClose);error?reject(error):resolve();};
    const onOpen=()=>finish();const onError=()=>finish(new Error("Não foi possível conectar ao host"));const onClose=()=>finish(new Error("Conexão com o host foi encerrada"));
    ws.addEventListener("open",onOpen,{once:true});ws.addEventListener("error",onError,{once:true});ws.addEventListener("close",onClose,{once:true});
  });
}

function requestId(){
  if(globalThis.crypto?.randomUUID)return globalThis.crypto.randomUUID();
  if(globalThis.crypto?.getRandomValues){const values=new Uint32Array(4);globalThis.crypto.getRandomValues(values);return Array.from(values,(value)=>value.toString(16)).join("-");}
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function socketRequest(type,payload){return new Promise((resolve,reject)=>{if(!state.ws||state.ws.readyState!==WebSocket.OPEN){reject(new Error("Conexão com o host ainda não está pronta"));return;}const id=requestId();state.rpc.set(id,{resolve,reject});state.ws.send(JSON.stringify({type,id,...payload}));setTimeout(()=>{if(state.rpc.delete(id))reject(new Error("Tempo de resposta esgotado"));},22000);});}
const rpc=(method,params)=>socketRequest("rpc",{method,params});
const command=(name,params)=>socketRequest("command",{command:name,params});

async function sendPrompt(event){event.preventDefault();if(state.snapshot?.status==="running"){await interrupt();return;}const text=$("#prompt").value.trim();if((!text&&!state.attachments.length)||!state.session)return;$("#send").disabled=true;try{await command("send",{sessionId:state.session.id,text:text||"Analise os arquivos anexados.",attachments:state.attachments.map(({id,name,type,size,data})=>({id,name,type,size,data})),cwd:workspaceCwd(),harness:state.session.harness});$("#prompt").value="";state.attachments=[];renderAttachments();resizePrompt();await syncSession(true);}catch(error){toast(error.message);}finally{setRunningControls(state.snapshot?.status==="running");}}
async function interrupt(){
  if(!state.session)return;
  if(state.settings.confirmInterrupt && !confirm("Parar este agente agora?"))return;
  try{
    let runId=state.snapshot?.runId;
    if(!runId){await syncSession(true);runId=state.snapshot?.runId;}
    if(!runId){toast("O host ainda não informou um turno ativo.");return;}
    state.cancelling=true;setSessionStatus("running");setRunningControls(true);
    await command("cancel",{sessionId:state.session.id,runId});toast("Parada solicitada");await syncSession(true);
  }catch(error){state.cancelling=false;setRunningControls(state.snapshot?.status==="running");toast(error.message);}
}
async function deleteSession(){
  if(!state.session||!state.project)return;
  const sessionId=state.session.id;const title=state.session.title||"esta sessão";
  if(!confirm(`Excluir ${title}? Esta ação remove a sessão do host MonoCode e não pode ser desfeita.`))return;
  const button=$("#delete-session");button.disabled=true;
  try{
    await rpc("sessions.delete",{projectId:state.project.id,sessionId});
    clearInterval(state.poll);state.project=null;state.session=null;state.snapshot=null;state.catalog=null;state.catalogProjectId=null;
    if(localStorage.getItem("monopad-last-session")===sessionId)localStorage.removeItem("monopad-last-session");
    if(sessionStorage.getItem("monopad-last-session")===sessionId)sessionStorage.removeItem("monopad-last-session");
    await bootstrap();toast("Sessão excluída");
  }catch(error){button.disabled=false;toast(error.message);}
}


function applySettings() {
  const { theme, density, reduceMotion } = state.settings;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.density = density;
  document.documentElement.dataset.reduceMotion = reduceMotion ? "true" : "false";
  document.querySelectorAll("[data-setting]").forEach((control) => {
    const value = state.settings[control.dataset.setting];
    if (control.type === "checkbox") control.checked = Boolean(value);
    else control.value = value;
  });
  localStorage.setItem("monopad-settings", JSON.stringify(state.settings));
}
function openSettings(page = "general") {
  $("#settings").hidden = false;
  document.querySelectorAll(".settings-nav-item").forEach((item) => item.classList.toggle("active", item.dataset.settingsPage === page));
  document.querySelectorAll(".settings-page").forEach((panel) => panel.classList.toggle("active", panel.dataset.settingsPanel === page));
  $("#settings-close").focus();
}
function closeSettings() { $("#settings").hidden = true; $("#settings-button").focus(); }
function resetSettings() { state.settings = { ...DEFAULT_SETTINGS }; applySettings(); toast("Configurações restauradas"); }

function initTerminal(){if(state.terminal)return;state.terminal=new window.Terminal({cursorBlink:true,fontSize:14,fontFamily:"ui-monospace, SFMono-Regular, Menlo, monospace",theme:{background:"#0d1013",foreground:"#dce2e8",cursor:"#ffb454",selectionBackground:"#ffb45444"},scrollback:6000});state.fit=new window.FitAddon.FitAddon();state.terminal.loadAddon(state.fit);state.terminal.open($("#terminal"));state.terminal.onData((data)=>state.ws?.send(JSON.stringify({type:"terminal.input",id:"main",data})));}
function openTerminal(){initTerminal();requestAnimationFrame(()=>{state.fit.fit();if(!state.terminalOpen){state.terminal.reset();state.ws.send(JSON.stringify({type:"terminal.open",id:"main",cwd:state.session?.worktreeCwd||state.session?.cwd||state.project?.cwd,cols:state.terminal.cols,rows:state.terminal.rows}));state.terminalOpen=true;}else resizeTerminal();});}
function resizeTerminal(){if(!state.terminalOpen)return;state.fit.fit();state.ws.send(JSON.stringify({type:"terminal.resize",id:"main",cols:state.terminal.cols,rows:state.terminal.rows}));}
function closeViewMenu(){const menu=$("#view-menu-popover");if(menu){menu.hidden=true;$("#view-menu-button")?.setAttribute("aria-expanded","false");}}
function toggleViewMenu(){const menu=$("#view-menu-popover");if(!menu)return;menu.hidden=!menu.hidden;$("#view-menu-button")?.setAttribute("aria-expanded",String(!menu.hidden));}
function setTab(name){document.querySelectorAll(".tab").forEach((el)=>{const active=el.dataset.tab===name;el.classList.toggle("active",active);el.setAttribute("aria-selected",String(active));});document.querySelectorAll(".panel").forEach((el)=>el.hidden=el.id!==`${name}-panel`);closeViewMenu();if(name==="terminal")openTerminal();}

let qrCameraAttempt=0;
function setQrState(mode, message){
  const panel=$("#qr-login");
  if(!panel)return;
  panel.classList.remove("live","fallback","scanning");
  if(mode)panel.classList.add(mode);
  if(message)$("#qr-status").textContent=message;
}
function stopQrScanner({hide=true}={}){
  qrCameraAttempt+=1;
  if(state.qrFrame)cancelAnimationFrame(state.qrFrame);
  state.qrFrame=0;
  state.qrStream?.getTracks().forEach((track)=>track.stop());
  state.qrStream=null;
  const video=$("#qr-video");
  if(video)video.srcObject=null;
  if(hide){
    $("#qr-login").hidden=true;
    setQrState(null);
  }
}
function acceptQrValue(value){
  const raw=String(value||"").trim();
  if(!raw)return false;
  try{
    const url=new URL(raw,location.origin);
    const token=url.searchParams.get("token");
    if(token){$("#token").value=token;stopQrScanner();login();return true;}
  }catch{}
  if(!raw.includes("://")&&!/[\s]/.test(raw)&&raw.length>16){$("#token").value=raw;stopQrScanner();login();return true;}
  return false;
}
function scanQrFrame(){
  const video=$("#qr-video"),canvas=$("#qr-canvas");
  if(video?.readyState>=2&&video.videoWidth&&globalThis.jsQR){
    canvas.width=video.videoWidth;canvas.height=video.videoHeight;
    const context=canvas.getContext("2d",{willReadFrequently:true});context.drawImage(video,0,0,canvas.width,canvas.height);
    const image=context.getImageData(0,0,canvas.width,canvas.height);const result=globalThis.jsQR(image.data,image.width,image.height,{inversionAttempts:"attemptBoth"});
    if(result&&acceptQrValue(result.data))return;
  }
  if(state.qrStream&&!$("#qr-login").hidden)state.qrFrame=requestAnimationFrame(scanQrFrame);
}
async function openQrScanner(){
  const panel=$("#qr-login");
  panel.hidden=false;
  setQrState(null,"Preparando o leitor…");
  $("#qr-placeholder-copy").textContent="Toque em “Abrir câmera” e fotografe o QR Code inteiro.";
  $("#qr-photo-button").textContent="Abrir câmera";
  const secure=Boolean(globalThis.isSecureContext);
  if(!secure||!navigator.mediaDevices?.getUserMedia){
    setQrState("fallback","A câmera ao vivo precisa de HTTPS neste endereço. Use a câmera do iPad para fotografar o código.");
    panel.querySelector(".qr-secure-note").innerHTML='<span aria-hidden="true">⌁</span> No acesso local HTTP, o Safari usa a câmera nativa para manter o pareamento seguro.';
    $("#qr-photo-button").focus();
    return;
  }
  const attempt=++qrCameraAttempt;
  try{
    let cameraTimedOut=false;
    const request=navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}},audio:false});
    request.then((stream)=>{if(cameraTimedOut||attempt!==qrCameraAttempt||panel.hidden)stream.getTracks().forEach((track)=>track.stop());},()=>{});
    const timeout=new Promise((_,reject)=>setTimeout(()=>{cameraTimedOut=true;reject(new Error("camera-timeout"));},5000));
    state.qrStream=await Promise.race([request,timeout]);
    if(attempt!==qrCameraAttempt||panel.hidden){state.qrStream?.getTracks().forEach((track)=>track.stop());return;}
    const video=$("#qr-video");video.srcObject=state.qrStream;await video.play();
    setQrState("live","Aponte a câmera para o QR Code do terminal.");
    state.qrFrame=requestAnimationFrame(scanQrFrame);
  }catch{
    setQrState("fallback","Não foi possível abrir a câmera ao vivo. Use a câmera do iPad para fotografar o código.");
    panel.querySelector(".qr-secure-note").innerHTML='<span aria-hidden="true">⌁</span> Permita o acesso à câmera ou use “Abrir câmera” abaixo.';
  }
}
async function decodeQrFile(event){
  const file=event.target.files?.[0];event.target.value="";
  if(!file)return;
  const panel=$("#qr-login");panel.hidden=false;stopQrScanner({hide:false});setQrState("fallback","Lendo a foto…");
  let objectUrl="";let bitmap=null;
  try{
    const maxSize=1600;let width,height,draw;
    if(globalThis.createImageBitmap){bitmap=await createImageBitmap(file);width=bitmap.width;height=bitmap.height;draw=(context,w,h)=>context.drawImage(bitmap,0,0,w,h);}
    else{objectUrl=URL.createObjectURL(file);const image=await new Promise((resolve,reject)=>{const element=new Image();element.onload=()=>resolve(element);element.onerror=reject;element.src=objectUrl;});width=image.naturalWidth;height=image.naturalHeight;draw=(context,w,h)=>context.drawImage(image,0,0,w,h);}
    const scale=Math.min(1,maxSize/Math.max(width,height));const targetWidth=Math.max(1,Math.round(width*scale));const targetHeight=Math.max(1,Math.round(height*scale));
    const canvas=$("#qr-canvas");canvas.width=targetWidth;canvas.height=targetHeight;const context=canvas.getContext("2d",{willReadFrequently:true});draw(context,targetWidth,targetHeight);
    const pixels=context.getImageData(0,0,targetWidth,targetHeight);const result=globalThis.jsQR?.(pixels.data,targetWidth,targetHeight,{inversionAttempts:"attemptBoth"});
    if(!result||!acceptQrValue(result.data))$("#qr-status").textContent="Não encontrei um QR MonoPad. Fotografe o código inteiro, sem reflexos, e tente novamente.";
  }catch{$("#qr-status").textContent="Não foi possível ler a foto. Tente novamente.";}
  finally{bitmap?.close?.();if(objectUrl)URL.revokeObjectURL(objectUrl);}
}
function useManualQr(){
  stopQrScanner();
  $("#token").focus();
  $("#token").scrollIntoView({behavior:"smooth",block:"center"});
}

async function login(event){event?.preventDefault();state.token=$("#token").value.trim();$("#login-error").textContent="";try{if(state.token)persistLoginToken();connectSocket();await waitForSocket();await bootstrap();$("#login").hidden=true;$("#app").hidden=false;startWorkspaceRefresh();}catch(error){clearInterval(state.workspacePoll);localStorage.removeItem("monopad-token");sessionStorage.removeItem("monopad-token");$("#login-error").textContent=error.message;state.token="";state.ws?.close();}}
async function automaticLogin(){
  try{const session=await fetch("/api/session").then((response)=>response.json());if(session.authenticated){state.token="";await login();return true;}}catch{}
  return false;
}

function updateSidebarButton(){
  const button=$("#sidebar-toggle");if(!button)return;
  if(innerWidth>900){const collapsed=$("#app").classList.contains("sidebar-collapsed");button.setAttribute("aria-expanded",String(!collapsed));button.setAttribute("aria-label",collapsed?"Mostrar projetos":"Ocultar projetos");button.title=collapsed?"Mostrar projetos":"Ocultar projetos";}
  else{const open=$("#sidebar").classList.contains("open");button.setAttribute("aria-expanded",String(open));button.setAttribute("aria-label",open?"Fechar projetos":"Abrir projetos");button.title=open?"Fechar projetos":"Abrir projetos";}
}
function setSidebarCollapsed(collapsed){if(innerWidth<=900)return;$("#app").classList.toggle("sidebar-collapsed",collapsed);localStorage.setItem("monopad-sidebar-collapsed",String(collapsed));updateSidebarButton();}
function restoreSidebarState(){if(innerWidth>900)$("#app").classList.toggle("sidebar-collapsed",localStorage.getItem("monopad-sidebar-collapsed")==="true");updateSidebarButton();}
function openSidebar(){if(innerWidth>900){setSidebarCollapsed(false);return;}$("#sidebar").classList.add("open");$("#sidebar-backdrop").classList.add("visible");updateSidebarButton();}
function closeSidebar(){if(innerWidth>900)return;$("#sidebar").classList.remove("open");$("#sidebar-backdrop").classList.remove("visible");updateSidebarButton();}
function toggleSidebar(){if(innerWidth>900){setSidebarCollapsed(!$("#app").classList.contains("sidebar-collapsed"));return;}$("#sidebar").classList.contains("open")?closeSidebar():openSidebar();}
function resizePrompt(){ const prompt=$("#prompt");prompt.style.height="auto";prompt.style.height=`${Math.min(prompt.scrollHeight,innerHeight*.3)}px`; }
let touchStart=null;
document.addEventListener("touchstart",(event)=>{const touch=event.touches[0];touchStart={x:touch.clientX,y:touch.clientY};},{passive:true});
document.addEventListener("touchend",(event)=>{if(!touchStart||innerWidth>900)return;const touch=event.changedTouches[0];const dx=touch.clientX-touchStart.x;const dy=Math.abs(touch.clientY-touchStart.y);if(dy<70&&touchStart.x<28&&dx>75)openSidebar();if(dy<70&&$("#sidebar").classList.contains("open")&&dx<-75)closeSidebar();touchStart=null;},{passive:true});
let lastTouchEnd=0;
const preventZoomGesture=(event)=>event.preventDefault();
document.addEventListener("gesturestart",preventZoomGesture,{passive:false});document.addEventListener("gesturechange",preventZoomGesture,{passive:false});document.addEventListener("gestureend",preventZoomGesture,{passive:false});
document.addEventListener("touchend",(event)=>{const now=Date.now();if(now-lastTouchEnd<=320)event.preventDefault();lastTouchEnd=now;},{passive:false});

hydrateIcons();applySettings();restoreSidebarState();
$("#settings-button").addEventListener("click",()=>openSettings());$("#settings-close").addEventListener("click",closeSettings);$("#logout-button").addEventListener("click",logout);$("#settings-backdrop").addEventListener("click",closeSettings);$("#settings-reset").addEventListener("click",resetSettings);
document.querySelectorAll(".settings-nav-item").forEach((item)=>item.addEventListener("click",()=>openSettings(item.dataset.settingsPage)));
document.querySelectorAll("[data-setting]").forEach((control)=>control.addEventListener("change",()=>{state.settings[control.dataset.setting]=control.type === "checkbox" ? control.checked : control.value;applySettings();if(control.dataset.setting === "persistLogin")persistLoginToken();if(control.dataset.setting === "autoRefresh" && state.session) selectSession(state.project,state.session);}));
document.addEventListener("keydown",(event)=>{if((event.metaKey||event.ctrlKey)&&event.key===","){event.preventDefault();openSettings();}if(event.key==="Escape"){if(!$("#file-viewer").hidden){closeFileViewer();}else if(!$("#project-style-modal").hidden){closeProjectStyle();}else if(!$("#new-session-modal").hidden){$("#new-session-modal").hidden=true;}else if(!$("#view-menu-popover").hidden){closeViewMenu();}else if(!$("#composer-menu").hidden){closeComposerMenu();}else if([...document.querySelectorAll(".composer-popover")].some((popover)=>!popover.hidden)){closeComposerPickers();}else if(!$("#settings").hidden)closeSettings();}});
$("#login-form").addEventListener("submit",login);$("#delete-session").addEventListener("click",deleteSession);$("#qr-login-button").addEventListener("click",openQrScanner);$("#qr-close-button").addEventListener("click",()=>stopQrScanner());$("#qr-photo-button").addEventListener("click",()=>$("#qr-photo-input").click());$("#qr-manual-button").addEventListener("click",useManualQr);$("#qr-photo-input").addEventListener("change",decodeQrFile);$("#composer").addEventListener("submit",sendPrompt);$("#interrupt").addEventListener("click",interrupt);$("#refresh").addEventListener("click",async()=>{try{await bootstrap();toast("Atualizado");}catch(error){toast(error.message);}});$("#sidebar-toggle").addEventListener("click",toggleSidebar);$("#sidebar-backdrop").addEventListener("click",closeSidebar);
document.querySelectorAll(".workspace-nav-item").forEach((item)=>item.addEventListener("click",()=>setWorkspaceView(item.dataset.workspaceView)));
$("#explorer-refresh").addEventListener("click",()=>loadExplorer());$("#explorer-up").addEventListener("click",()=>{const parts=state.explorerPath.split("/").filter(Boolean);parts.pop();loadExplorer(parts.join("/"));});$("#changes-refresh").addEventListener("click",()=>loadChanges());
$("#skills-button").addEventListener("click",openSkillsPicker);$("#model-button").addEventListener("click",openModelPicker);$("#effort-button").addEventListener("click",openEffortPicker);$("#permission-button").addEventListener("click",openPermissionPicker);$("#model-search").addEventListener("input",(event)=>renderModelOptions(event.target.value));$("#skills-search").addEventListener("input",(event)=>renderSkillOptions(event.target.value));$("#file-search").addEventListener("input",(event)=>renderFileOptions(event.target.value));$("#apply-model-settings").addEventListener("click",()=>configureSession({modelSettings:collectModelSettings($("#session-model-settings"))}));document.querySelectorAll("[data-close-picker]").forEach((button)=>button.addEventListener("click",closeComposerPickers));document.querySelectorAll("[data-back-composer]").forEach((button)=>button.addEventListener("click",backToComposerMenu));
$("#project-style-close").addEventListener("click",closeProjectStyle);$("#project-style-cancel").addEventListener("click",closeProjectStyle);$("#project-style-backdrop").addEventListener("click",closeProjectStyle);$("#project-style-save").addEventListener("click",saveProjectStyle);
$("#new-session-provider").addEventListener("change",renderNewSessionModels);$("#new-session-model").addEventListener("change",renderNewSessionSettings);$("#new-session-create").addEventListener("click",submitNewSession);$("#new-session-cancel").addEventListener("click",()=>$("#new-session-modal").hidden=true);$("#new-session-close").addEventListener("click",()=>$("#new-session-modal").hidden=true);$("#new-session-backdrop").addEventListener("click",()=>$("#new-session-modal").hidden=true);
$("#file-viewer-close").addEventListener("click",closeFileViewer);$("#file-viewer-preview").addEventListener("click",toggleFileViewerPreview);$("#file-viewer-search").addEventListener("input",(event)=>{if(state.fileViewer){state.fileViewer.query=event.target.value;renderFileViewerSource();}});
document.addEventListener("pointerdown",(event)=>{if(!event.target.closest("#composer-menu")&&!event.target.closest("#composer-plus"))closeComposerMenu();if(!event.target.closest(".view-menu"))closeViewMenu();});
$("#composer-plus").addEventListener("click",toggleComposerMenu);$("#attach-file").addEventListener("click",openAttachmentPicker);$("#composer-file-input").addEventListener("change",handleComposerFiles);$("#view-menu-button").addEventListener("click",toggleViewMenu);document.querySelectorAll("[data-view-tab]").forEach((button)=>button.addEventListener("click",()=>setTab(button.dataset.viewTab)));
$("#prompt").addEventListener("input",()=>{resizePrompt();updateSkillSuggestions();});$("#prompt").addEventListener("focus",()=>setTimeout(()=>$("#composer").scrollIntoView({block:"end"}),180));$("#prompt").addEventListener("keydown",(event)=>{if((event.metaKey||event.ctrlKey)&&event.key==="Enter")sendPrompt(event);if(event.key==="Escape"&&[...document.querySelectorAll(".composer-popover")].some((popover)=>!popover.hidden))closeComposerPickers();});
$("#terminal-reconnect").addEventListener("click",()=>{if(state.terminalOpen)state.ws.send(JSON.stringify({type:"terminal.kill",id:"main"}));state.terminalOpen=false;setTimeout(openTerminal,150);});$("#terminal-stop").addEventListener("click",()=>state.ws?.send(JSON.stringify({type:"terminal.kill",id:"main"})));window.addEventListener("resize",()=>{if(innerWidth>900)closeSidebar();else updateSidebarButton();restoreSidebarState();if(!$("#terminal-panel").hidden)resizeTerminal();});window.visualViewport?.addEventListener("resize",()=>{if(!$("#terminal-panel").hidden)resizeTerminal();});
window.addEventListener("beforeinstallprompt",(event)=>{event.preventDefault();state.deferredInstall=event;$("#install-button").hidden=false;});$("#install-button").addEventListener("click",async()=>{await state.deferredInstall?.prompt();state.deferredInstall=null;$("#install-button").hidden=true;});
if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>{});
if(state.token){$("#token").value=state.token;login();}else{automaticLogin();}
