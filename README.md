# MonoPad

Cliente web/PWA privado para usar no iPad tudo o que continua executando no seu PC: projetos, worktrees, sessões e agentes já configurados no MonoCode.

O MVP oferece:

- painel de projetos e sessões do MonoCode Host;
- acompanhamento incremental do fluxo e estado dos agentes, mantendo a mensagem da IA visível e deixando o grupo de execuções recolhido por padrão;
- envio de novos prompts e cancelamento de turnos pelo botão **Parar** no cabeçalho e no composer;
- reconexão automática à sessão persistida no host;
- terminal interativo iniciado no projeto/worktree selecionado;
- PWA com experiência nativa no Safari/iPad: split view em paisagem, safe areas, teclado e gestos, com Terminal/Detalhes em um menu compacto no topo;
- acesso por HTTPS privado com Tailscale Serve;
- nenhuma credencial de Claude, Codex, Cursor ou outros provedores no iPad;
- seletor real de provedor/modelo, esforço e configurações específicas do modelo, com composer no estilo ChatGPT para anexos, skills e referências de arquivos;
- abas **Sessões**, **Explorer** e **Changes**, lendo arquivos e Git diretamente no host.


## Sessões, IA e Workspace

Na tela de uma sessão, toque no botão **＋** do composer para abrir anexos, Skills, modelo, **Reasoning/Esforço** e permissões (**Supervised**, **Auto-accept edits**, **Auto** ou **Full access**). O texto da IA aparece formatado em Markdown, com tabelas renderizadas; skills e arquivos podem ser chamados diretamente pelos gatilhos `/skill` e `@arquivo`. As configurações da sessão são enviadas por `commands.dispatch` com `configure` e ficam salvas no Host. O histórico e os metadados da sessão são sincronizados entre o Host e o MonoCode desktop usando o mesmo ID, provider, `provider_session_id`, worktree e timestamps; por isso uma sessão criada no iPad aparece no desktop e vice-versa. Para evitar conflito, envie comandos por apenas um dispositivo de cada vez. O botão **Excluir** remove a sessão de verdade pelo RPC `sessions.delete`, sempre pedindo confirmação antes.

Para iniciar uma conversa nova, toque em `+` no projeto. O MonoPad mostra os provedores e modelos realmente disponíveis naquele PC antes de criar a sessão.

### Skills e composer

O composer do MonoPad segue o padrão do ChatGPT no iPad: **＋** abre **Importar arquivo**, **Skills**, **Modelo**, **Esforço** e **Permissões**; o menu fecha ao tocar fora, e os gatilhos `/skill` e `@arquivo` aparecem somente enquanto o texto correspondente existir. O envio de fotos não faz parte do fluxo atual.

As skills são descobertas diretamente no PC, dando prioridade às do projeto e depois às do usuário. O MonoPad reconhece `.agents/skills/<nome>/SKILL.md` e as pastas de provedor (`.claude/skills`, `.codex/skills`, `.cursor/skills` e equivalentes), inclusive instalações sincronizadas em subpastas. Ao abrir o seletor, o catálogo é atualizado novamente no host; assim, uma skill criada enquanto a sessão estava aberta aparece sem reiniciar o Docker. Ao enviar `/nome ...`, o host lê o `SKILL.md` e injeta suas instruções antes de despachar o prompt ao agente. O iPad recebe somente o catálogo resumido; o conteúdo privado da skill não é armazenado no navegador. Skills nativas de provedores que já interpretam o comando `/` continuam sendo enviadas sem alteração.

No painel lateral, **Sessões** lista as conversas existentes; **Explorer** navega pelos arquivos do projeto/worktree e abre um editor somente leitura com busca, linhas e prévia Markdown/JSON; **Changes** mostra o branch, arquivos modificados e contadores Git, com diff colorido estilo VS Code ao tocar em um arquivo. Essas operações são executadas no host, preservando worktrees e permissões locais.


## Configurações do MonoPad

O botão `⚙` abre as preferências no próprio iPad, organizadas como no MonoCode:

- **App:** Geral, Aparência e Atalhos;
- **Workspace:** Inbox, Arquivo e Worktrees;
- **Agentes:** provedores detectados no host, sem copiar credenciais.

Tema, densidade, animações, confirmação de interrupção e atualização automática ficam salvos somente no navegador do iPad. A aparência do MonoCode no PC não é alterada.

A opção **Manter sessão neste dispositivo** também fica nas configurações do MonoPad e vem ativada por padrão. Com ela ativada, fechar o app, a aba ou o Safari não desconecta o iPad: na próxima abertura, o MonoPad reutiliza a chave armazenada localmente e reconecta ao mesmo host. Para remover essa chave, desative a opção ou toque em **Sair deste dispositivo**; o botão de sair apaga a sessão local e exige um novo QR Code/chave no próximo acesso. A chave nunca é enviada para o PC como uma nova credencial e não altera o login do MonoCode.

Leia [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para as decisões, limites e roadmap.

## Início automático com Docker

Pré-requisitos: apenas Docker e Tailscale conectado no PC e no iPad. A imagem inclui uma versão oficial fixada do MonoCode Host. Não é necessário instalar o host, criar `.env`, copiar token ou parear o iPad manualmente.

```bash
./start.sh
```

Esse único comando:

1. cria o container com o mesmo UID/GID do usuário;
2. monta sua pasta pessoal no mesmo caminho, para preservar projetos, configurações e terminal;
3. monta `~/.monocode-host` e cria automaticamente uma credencial revogável chamada **MonoPad Docker**;
4. gera e persiste o segredo local do painel em `var/docker/`;
5. conecta o bridge ao MonoCode Host em loopback;
6. ativa o Tailscale Serve, imprime a URL HTTPS e exibe automaticamente o QR Code de login no terminal.

O Safari é autenticado pela identidade que o Tailscale Serve envia ao backend, portanto nenhuma chave precisa ser digitada no iPad. O MonoPad continua ligado somente a `127.0.0.1`; não use Tailscale Funnel.

O painel registra automaticamente os projetos encontrados no MonoCode desktop. Se um projeto ainda não tiver uma sessão no **MonoCode Host**, ele aparece com `Nenhuma sessão`; use o botão `+` ao lado do projeto ou **＋ Nova sessão** no centro da tela. O MonoPad consulta o primeiro provedor/modelo autenticado no host e cria uma sessão supervisionada.

Na inicialização e após cada comando, o MonoPad sincroniza o histórico entre `monocode.db` e o banco do Host preservando o mesmo ID, diretório, provider, `provider_session_id`, worktree e configurações. Assim, uma sessão iniciada no PC aparece no iPad e uma sessão criada no iPad também aparece no MonoCode desktop, mantendo o vínculo 1:1. Ao tocar em Atualizar, sessões novas criadas depois também são descobertas. Evite enviar comandos simultaneamente pelo desktop e pelo iPad na mesma sessão; deixe um deles assumir o turno.

Para parar:

```bash
./stop.sh
```

> Segurança: conforme autorizado para este projeto, o container monta `${HOME}` com leitura e escrita e também `~/.monocode-host`. Isso é necessário para o terminal usar os mesmos projetos e para o pareamento automático. Use apenas a imagem construída destes arquivos e mantenha o acesso limitado à sua tailnet.

## Backup e recuperação

O banco e as credenciais do MonoCode Host ficam em `~/.monocode-host/`; o estado persistente do painel e o pareamento do dispositivo ficam em `var/docker/`. Inclua as duas pastas no backup. Para uma cópia manual consistente, pare o MonoPad e o MonoCode Host antes de copiar os arquivos. Se o SQLite estiver usando WAL, preserve também os arquivos `host.db-wal` e `host.db-shm`, ou use o mecanismo de backup do próprio MonoCode.

Não remova `var/docker/` durante uma manutenção comum: isso descarta a chave do painel e o pareamento salvo do dispositivo.

## Usar somente na rede de casa, sem VPN

Também é possível abrir o MonoPad diretamente pelo Wi-Fi da sua casa, sem Tailscale:

```bash
./start-lan.sh
```

O script mostra duas informações:

```text
MonoPad disponível na rede de casa:
  http://192.168.1.50:8787

Chave de acesso do painel:
  uma-chave-longa-gerada-automaticamente
```

No iPad, conectado ao mesmo Wi-Fi, abra o endereço mostrado e cole a chave quando o MonoPad pedir. O endereço muda conforme o IP local do PC.

### Login por QR Code

Para não digitar a chave no iPad, execute no terminal do PC:

```bash
./pair.sh
```

O `start.sh` e o `start-lan.sh` já exibem esse QR Code automaticamente ao terminar. No iPad, toque em **Vincular com QR Code**. A tela de pareamento funciona como o WhatsApp Web: em HTTPS ela abre o leitor ao vivo com moldura de enquadramento; no modo HTTP/LAN, em que o Safari bloqueia vídeo ao vivo por segurança, **Abrir câmera** chama a câmera nativa do iPad e lê a foto localmente. Se preferir, use **Usar chave manual**. O MonoPad salva a sessão localmente e remove o token da barra de endereço. Para gerar o QR manualmente ou informar um endereço específico:

```bash
./pair.sh http://192.168.1.50:8787
```

O QR contém a chave de acesso do painel; gere-o somente em uma rede confiável e não publique a imagem.

### Onde fica o token?

O token que você digita no iPad é a **chave de acesso do painel**. Ela é criada automaticamente na primeira inicialização e fica neste arquivo:

```text
var/docker/access-token
```

Você pode exibi-la novamente a qualquer momento, dentro da pasta do MonoPad, com:

```bash
cat var/docker/access-token
```

Você **não** precisa copiar nem procurar o token interno do MonoCode Host. O Docker cria e guarda esse pareamento separadamente em `var/docker/monocode-device.json`; ele nunca é usado na tela de login do iPad.

Resumo:

- Com **Tailscale Serve**, o login no iPad é automático pela identidade Tailscale; normalmente você não digita token.
- No modo **rede de casa**, use o conteúdo de `var/docker/access-token`.
- Se apagar `var/docker/access-token` e reiniciar o container, uma nova chave será criada.

### Cuidados no modo LAN

O modo LAN usa HTTP e qualquer dispositivo na mesma rede consegue alcançar a tela de login. A chave continua obrigatória, mas o tráfego não é criptografado. Use somente em uma rede doméstica confiável, não abra/encaminhe a porta `8787` no roteador e prefira o modo Tailscale em redes compartilhadas. Alguns recursos de instalação/offline da PWA no Safari também podem ficar limitados sem HTTPS.

Para voltar ao modo privado do Tailscale, execute novamente:

```bash
./start.sh
```

## Desenvolvimento e verificação

```bash
npm run check
```

Modo demonstração rápido:

```bash
MONOPAD_DEMO=true MONOPAD_ACCESS_TOKEN=monopad-demo npm start
```

Abra `http://127.0.0.1:8787` e use `monopad-demo` como chave.

## Operação e revogação

- perder o iPad: revogue o dispositivo no Tailscale e, se necessário, use **Sair deste dispositivo** antes de apagar os dados do Safari; a chave do painel fica somente no armazenamento local daquele navegador;
- vazar a chave do painel: gere outra com `npm run token` e reinicie o MonoPad;
- vazar o token do MonoCode Host: use `monocode-host devices` e `monocode-host revoke DEVICE_ID`;
- parar a exposição privada: `tailscale serve reset`;
- o MonoCode Host e o MonoPad devem rodar como o mesmo usuário que possui as autenticações dos CLIs.
