# Arquitetura do MonoPad

## Decisão principal

O MonoPad não executa Claude Code, Codex, Cursor ou qualquer outro agente no iPad. Ele preserva a fronteira de execução do MonoCode: processos, arquivos, worktrees, banco de sessões, configurações e credenciais pertencem ao usuário do sistema operacional no PC.

O MonoCode atual já inclui um **MonoCode Host headless** e um protocolo RPC v1. O MVP reutiliza esse host em vez de criar adaptadores próprios para cada CLI.

```text
iPad / Safari / PWA
        │ HTTPS + WebSocket (somente tailnet)
        ▼
Tailscale Serve — TLS e política de acesso
        │ loopback
        ▼
MonoPad Bridge :8787
  ├─ PWA estática
  ├─ autenticação própria do painel
  ├─ proxy WebSocket → RPC MonoCode
  └─ terminal PTY do usuário local
        │ loopback + Bearer mantido no PC
        ▼
MonoCode Host :3774
  ├─ banco persistente de projetos/sessões
  ├─ worktrees e arquivos
  ├─ adaptadores dos agentes
  └─ credenciais locais já existentes
        │
        ├─ Claude Code
        ├─ Codex
        ├─ Cursor
        └─ demais provedores suportados
```

## O que foi reutilizado

Do protocolo oficial do MonoCode Host:

- `environment.describe`, `projects.list` e `models.list`;
- `sessions.list`, `sessions.sync` e snapshots/deltas incrementais;
- `commands.dispatch` para envio, cancelamento, aprovações e respostas;
- persistência e reconexão geridas pelo host;
- associação de sessão com projeto, branch e worktree;
- credencial de dispositivo revogável, mantida somente no bridge.

O `/operator` atual é uma CLI efêmera concedida a um agente durante um turno e não é uma API geral para um cliente web. Por isso ele não é a base do transporte. O protocolo do MonoCode Host é a integração correta.

## Componentes

### PWA

Interface sem framework, responsiva e adequada a toque. Usa Cache Storage apenas para o shell da aplicação. A chave de acesso do MonoPad fica em `sessionStorage`, não no cache do service worker. Nenhuma credencial dos provedores chega ao navegador.

### Bridge

Servidor Node.js ligado a `127.0.0.1` por padrão. Entrega a PWA, mantém a credencial do MonoCode Host, chama o RPC sem `Origin` (como o protocolo exige) e oferece um WebSocket autenticado ao navegador.

### Terminal

Usa `node-pty` quando o módulo nativo estiver disponível. Em instalações sem compilador, recorre a um shell com pipes: comandos comuns continuam funcionando, enquanto programas TUI de tela cheia exigem `node-pty`. O processo nasce no diretório do projeto/worktree selecionado e morre quando a conexão correspondente termina.

### Ponte de sessões do desktop

Na inicialização, em cada atualização do painel e após comandos enviados pelo MonoPad, a ponte sincroniza `~/.local/share/com.monocode.desktop/monocode.db` e o banco do Host. O mesmo ID, diretório, histórico, provider, `provider_session_id`, worktree e configurações são preservados nos dois lados. Sessões criadas no PC entram no Host; sessões criadas no iPad entram no banco desktop, permitindo continuar a mesma conversa nos dois clientes. A sincronização evita atualizar sessões em execução no desktop e só aplica snapshots do Host quando forem mais recentes.

## Segurança

- bind padrão exclusivamente em loopback;
- Tailscale Serve recomendado; não usar Funnel;
- HTTPS terminado pelo Tailscale e limitado à tailnet/ACLs;
- segundo segredo independente (`MONOPAD_ACCESS_TOKEN`) para o painel;
- token de dispositivo do MonoCode Host apenas no `.env` do PC;
- política CSP, `no-store` nas APIs e sem CORS permissivo;
- comandos executam sob o usuário local, portanto o acesso ao MonoPad equivale a acesso remoto a esse usuário: use ACLs individuais e revogue imediatamente dispositivos perdidos.

## Execução Docker automatizada

O `start.sh` cria o container com o UID/GID do usuário, monta `${HOME}` no mesmo caminho e monta `~/.monocode-host` separadamente. A imagem compila uma revisão oficial fixada do MonoCode Host; o entrypoint inicia esse host quando necessário, emite uma credencial de dispositivo apenas na primeira execução e a guarda em `var/docker/monocode-device.json` com permissões restritas. Também gera o segredo local do painel.

O bridge fica em loopback usando `network_mode: host`. O Tailscale Serve é iniciado no host e fornece HTTPS, ACLs e os headers de identidade. Como apenas o proxy de loopback alcança o bridge, o header `Tailscale-User-Login` pode autenticar o Safari sem transportar outro token para o iPad.

## Limites do MVP

- o terminal é reconectável enquanto o WebSocket existe, mas ainda não é uma sessão persistente de `tmux`;
- conversas acima do limite de resposta chunked do host ainda pedem uma nova abertura em vez de baixar todos os chunks;
- UI de aprovações/perguntas complexas ainda depende da forma dos blocos recebidos; o transporte já suporta os comandos;
- não há editor de arquivos/diff no primeiro corte, embora o host já forneça essas APIs;
- o MonoPad não controla visualmente a janela desktop; ele reassume os mesmos recursos no Host headless. Evite enviar simultaneamente pelo desktop e pelo iPad na mesma sessão.

## Próximas etapas

1. download de `sessions.syncChunk` e renderização fiel de todos os tipos de bloco;
2. cartões nativos para aprovações e perguntas;
3. terminais persistentes via `tmux` e lista de terminais existentes;
4. explorer/diff/edição usando `files.*`, `git.*` e `workspace.run`;
5. empacotamento como serviço systemd do usuário;
6. testes de contrato fixados à versão do MonoCode Host.
