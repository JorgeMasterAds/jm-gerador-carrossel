# Tutorial de Instalação — Carrossel Toolkit

Este guia explica passo a passo como instalar e configurar a ferramenta para
gerar carrosséis de Instagram com a sua marca, publicando automaticamente via
Trello + Instagram.

Você não precisa saber programar para seguir este tutorial — só copiar e
colar os comandos nos lugares certos.

---

## 1. O que você precisa ter instalado no computador

| Programa | Para quê | Onde baixar |
|---|---|---|
| **Node.js** (versão 18 ou mais recente) | Rodar os scripts que geram os carrosséis | [nodejs.org](https://nodejs.org) |
| **Google Chrome** | Renderizar os slides como imagem | [google.com/chrome](https://www.google.com/chrome/) |
| **ffmpeg** | Gerar o vídeo de 5s do último slide | Windows: `winget install ffmpeg` no PowerShell. Mac: `brew install ffmpeg` |

Depois de instalar, abra o terminal (PowerShell no Windows) dentro da pasta
do projeto e rode:

```bash
npm install
```

Isso baixa as bibliotecas que o projeto usa (leva 1-2 minutos).

---

## 2. Ativar a ferramenta (senha de licença)

1. Copie o arquivo `.env.example` e renomeie a cópia para `.env`.
2. Abra o `.env` num editor de texto (Bloco de Notas serve).
3. Substitua `LICENSE_KEY=sua_senha_aqui` pela senha que você recebeu na
   compra, por exemplo:
   ```
   LICENSE_KEY=SUA-SENHA-AQUI
   ```
   Sem a senha certa, nenhum script roda — a ferramenta bloqueia
   automaticamente com uma mensagem de aviso.

---

## 3. Configurar a sua marca (`config/brand.config.json`)

1. Copie `config/brand.config.example.json` para `config/brand.config.json`
   (mesma pasta).
2. Abra o arquivo e preencha:

```json
{
  "nicho": "Descreva seu nicho de atuação",
  "perfil": {
    "nome": "Seu Nome | Seu Cargo",
    "handle": "@seu.instagram",
    "foto": "file:///C:/CAMINHO/COMPLETO/assets/foto-perfil.png"
  },
  "logo": "file:///C:/CAMINHO/COMPLETO/assets/logo.png",
  "cores": {
    "mono": "#EC1325",
    "neon": "#EC1325",
    "darkwarm": "#FF8A3D",
    "cyber": "#FF003C"
  },
  "ctaPadrao": "Link na bio · Fale comigo"
}
```

**Sobre o campo `foto` e `logo`:** precisa ser o caminho **completo** do
arquivo no seu computador, começando com `file:///`. Coloque sua foto de
perfil dentro da pasta `assets/` do projeto e aponte para ela. Exemplo no
Windows:

```
file:///C:/Users/SeuNome/carrossel-toolkit/assets/foto-perfil.png
```

**Sobre `cores`:** é a cor de destaque de cada estilo visual (template).
Você pode deixar as 4 iguais (uma única cor de marca) ou variar. O
**tamanho da fonte, o layout e a diagramação de cada template não mudam** —
só a cor.

---

## 4. Criar sua própria chave do Trello (nunca use a de outra pessoa)

O pipeline organiza os carrosséis em um quadro Trello. Cada usuário precisa
da **própria** chave — usar a chave de outra conta expõe os cards de quem
emprestou a chave.

**Passo a passo (link direto — o caminho mais rápido):**

1. Acesse **[trello.com/app-key](https://trello.com/app-key)** logado na
   sua conta Trello. Essa página já mostra sua **API Key** direto no topo
   — copie, é o seu `TRELLO_KEY`.
2. Na mesma página, logo abaixo da API Key, tem o texto "Token" com um
   link — clique nele. Se não aparecer, cole esta URL no navegador
   substituindo `SUA_API_KEY` pela chave copiada no passo 1:
   ```
   https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&name=Carrossel%20Toolkit&key=SUA_API_KEY
   ```
3. Clique em **"Allow"** (autorizar) — a página mostra uma sequência longa
   de letras/números. Esse é o seu `TRELLO_TOKEN`.
4. Cole os dois valores no `.env`:
   ```
   TRELLO_KEY=sua_key_aqui
   TRELLO_TOKEN=seu_token_aqui
   ```

---

## 5. Criar o quadro Trello com a estrutura correta

O pipeline espera um quadro com **estas listas, nesta ordem**:

```
1. 🔭 Radar de Tendências     → cards de ideia/tendência aguardando produção
2. 📋 Fila (Gerado)           → cards com copy gerada, aguardando revisão
3. ✅ Copy aprovada           → copy aprovada, pronta para virar arte
4. 🎨 Aprovar Arte            → arte gerada, aguardando SUA aprovação manual
5. 🎨 Arte aprovada           → você aprovou — pronto para publicar
6. ⏰ Agendados               → aguardando o horário de publicação
7. ✅ Publicados              → já foi ao ar
```

**Como criar:**

1. Vá em [trello.com](https://trello.com) → **Criar novo quadro**.
2. Crie as 7 listas acima, na mesma ordem, com os mesmos nomes (os emojis
   são só visuais, pode manter ou remover).
3. Para cada lista, clique no menu **"···"** → **"Copiar link da lista"** —
   isso dá o ID da lista (uma sequência de 24 caracteres nos últimos
   caracteres da URL, ex: `65f1a2b3c4d5e6f7a8b9c0d1`).
4. Preencha no `.env`:
   ```
   TRELLO_BOARD_ID=id_do_quadro          (pegue da URL do quadro)
   TRELLO_LIST_FILA=id_da_lista_2
   TRELLO_LIST_APROVAR_COPY=id_da_lista_3
   TRELLO_LIST_APROVAR_ARTE=id_da_lista_4
   TRELLO_LIST_ARTE_APROVADA=id_da_lista_5
   TRELLO_LIST_PUBLICADOS=id_da_lista_7
   ```

**Por que existem duas listas de "arte"?** "Aprovar Arte" é onde a
ferramenta deixa o carrossel pronto para você revisar. "Arte aprovada" só
recebe o card quando **você** move manualmente — esse gesto é o que autoriza
a publicação automática. A ferramenta nunca pula essa etapa sozinha.

---

## 6. Configurar Supabase (armazenamento das imagens)

O Supabase guarda as imagens/vídeos gerados e gera um link público para
cada um — esse link é o que o Trello e o Instagram usam para exibir a arte.
É grátis para o volume deste uso.

1. Acesse **[supabase.com/dashboard/sign-up](https://supabase.com/dashboard/sign-up)**
   (link direto de cadastro) → entre com GitHub, Google ou e-mail.
2. Depois de logado, acesse **[supabase.com/dashboard/new](https://supabase.com/dashboard/new)**
   (link direto para criar projeto) ou clique em **New Project**:
   - **Name:** qualquer nome (ex: `carrossel-toolkit`)
   - **Database Password:** gere uma senha forte e guarde num lugar seguro
     (não é usada por este projeto, mas o Supabase exige)
   - **Region:** escolha a mais próxima (ex: `South America (São Paulo)`)
   - Clique em **Create new project** e aguarde 1-2 minutos de provisionamento
3. No menu lateral, clique em **Storage** → botão **New bucket**:
   - **Name:** `criativos` (exatamente assim, minúsculo)
   - Marque a opção **Public bucket** como **ativada**
   - Clique em **Create bucket**
4. No menu lateral, clique em **Project Settings** (ícone de engrenagem) →
   **API**. Você vai ver duas informações importantes:
   - **Project URL** — algo como `https://xxxxxxxxxxxx.supabase.co` → cole em
     `SUPABASE_URL`
   - **Project API keys → service_role** — clique em "Reveal" para mostrar
     o valor completo (é uma string longa começando com `eyJ...`) → cole em
     `SUPABASE_SERVICE_ROLE`
   - **Atenção:** existem duas chaves parecidas ali (`anon` e
     `service_role`). Use sempre a **service_role** — a `anon` não tem
     permissão de escrita e o upload vai falhar.
5. Preencha no `.env`:
   ```
   SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   SUPABASE_SERVICE_ROLE=eyJ...(chave completa)
   SUPABASE_BUCKET=criativos
   ```

---

## 7. Configurar Instagram (publicação automática)

Esta é a etapa mais burocrática — não é do toolkit, é assim que a Meta
(dona do Instagram) exige para qualquer ferramenta publicar automaticamente.
Faça uma vez só; depois disso é só usar.

### 7.1 — Preparar a conta do Instagram

1. No app do Instagram → **Configurações** → **Conta** → confirme que é
   **Conta profissional** (Criador de conteúdo ou Empresa). Se não for,
   ative ali mesmo — é gratuito e reversível.
2. A conta profissional precisa estar conectada a uma **Página do
   Facebook** (pode ser uma página nova, sem seguidores, só para isso
   funcionar). No app do Instagram: **Configurações** → **Contas
   vinculadas** → **Facebook** → conecte ou crie a página quando pedido.

### 7.2 — Criar o app na Meta for Developers

1. Acesse **[developers.facebook.com/apps/creation](https://developers.facebook.com/apps/creation/)**
   (link direto de criação de app) → faça login com a MESMA conta do
   Facebook conectada à sua página.
2. Escolha o tipo **Business** → dê um nome ao app (ex: "Publicador
   Carrossel") → **Create App**.
3. Dentro do app criado, procure o card **Instagram Graph API** (ou
   **Instagram API with Instagram Login**, dependendo da versão da
   interface) → clique em **Set Up** / **Configurar**.

### 7.3 — Gerar o token de acesso

1. No menu lateral do app, vá em **Ferramentas** → **Graph API Explorer**
   (ou acesse direto:
   [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)).
2. No topo da página, em **Meta App**, selecione o app que você criou.
3. Em **User or Page**, selecione **User Token**.
4. Clique em **Permissions** (ou no ícone de cadeado) e marque:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`
5. Clique em **Generate Access Token** → autorize sua conta quando o
   Facebook pedir.
6. Esse token gerado dura só ~1-2 horas — precisa trocar por um de longa
   duração (60 dias). Cole a URL abaixo no navegador, substituindo pelos
   seus dados (`SEU_APP_ID` e `SEU_APP_SECRET` ficam em **App Settings →
   Basic** do seu app; `TOKEN_CURTO` é o que você acabou de gerar):
   ```
   https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=SEU_APP_ID&client_secret=SEU_APP_SECRET&fb_exchange_token=TOKEN_CURTO
   ```
   A resposta traz um `access_token` novo, válido por 60 dias — esse é o
   que vai no `.env`. Quando expirar, repita este passo 7.3 para gerar
   outro (ou peça para eu automatizar um lembrete, se quiser).

### 7.4 — Descobrir o IG_ACCOUNT_ID

1. Ainda no Graph API Explorer, com o token de longa duração selecionado,
   rode (cole no campo de consulta e clique em **Submit**):
   ```
   me/accounts
   ```
   Isso lista suas Páginas do Facebook — copie o `id` da página conectada
   ao seu Instagram.
2. Rode em seguida (substituindo `ID_DA_PAGINA` pelo valor do passo
   anterior):
   ```
   ID_DA_PAGINA?fields=instagram_business_account
   ```
   O número que aparece dentro de `instagram_business_account` é o seu
   `IG_ACCOUNT_ID`.

### 7.5 — Preencher o `.env`

```
IG_ACCOUNT_ID=17841000000000000
IG_ACCESS_TOKEN=token_de_longa_duracao_do_passo_7.3
```

### 7.6 — Token que nunca expira (System User)

O token do passo 7.3 dura 60 dias — funciona bem, mas precisa renovar
periodicamente. Se você quer um token **sem data de expiração**, o caminho
é criar um **System User** dentro de um Business Manager verificado. É mais
burocrático (envolve verificação de empresa pela Meta), mas só precisa
fazer uma vez.

**⚠️ Recomendação: fale com o Jorge antes de começar esta etapa.** É a parte
mais fácil de travar sozinho (verificação de empresa recusada, permissão
faltando, ativo não vinculado direito) — peça para ele te acompanhar ao
vivo nesta etapa específica em vez de tentar sozinho pelo tutorial.

Passo a passo (para fazer com acompanhamento):

1. Crie (ou acesse) um Business Manager em
   **[business.facebook.com/create](https://business.facebook.com/create)** —
   preencha nome da empresa, seu nome e e-mail comercial.
2. Verifique a empresa: **[business.facebook.com/security](https://business.facebook.com/settings/security)**
   → **Verificação da empresa** → siga o processo pedido (normalmente CNPJ
   e documento de comprovação).
3. Vincule o app criado no passo 7.2 ao Business Manager:
   **[business.facebook.com/settings/apps](https://business.facebook.com/settings/apps)**
   → **Adicionar** → selecione o app pelo ID (fica em **App Settings →
   Basic** do app).
4. Vincule a Página do Facebook (a mesma do passo 7.1) em
   **[business.facebook.com/settings/pages](https://business.facebook.com/settings/pages)**
   → **Adicionar**.
5. Crie o System User em
   **[business.facebook.com/settings/system-users](https://business.facebook.com/settings/system-users)**
   → **Add** → dê um nome (ex: "Publicador Carrossel") → papel **Admin**.
6. Com o System User criado, clique nele → **Add Assets** → selecione a
   Página do Facebook vinculada → marque permissão de **Manage Page**.
7. Ainda na tela do System User, clique em **Generate New Token** →
   selecione o app do passo 7.2 → marque as mesmas permissões do passo
   7.3 (`instagram_basic`, `instagram_content_publish`, `pages_show_list`,
   `pages_read_engagement`) → **Generate Token**.
8. Esse token **não expira** — substitua o `IG_ACCESS_TOKEN` no `.env` por
   ele.

---

## 8. Gerar seu primeiro carrossel de teste

```bash
node gerar-htmls.js cards-exemplo.json --smart-rotation
node screenshot-slides.js --dir tmp/xpost
```

Isso cria os arquivos PNG (e 1 MP4) dentro de `tmp/xpost/`. Abra as imagens
para conferir se sua foto, seu @ e sua cor de marca aparecem certos.

---

## 9. Publicar de verdade

1. Preencha `cards-aprovados.json` com seus próprios cards (ou use
   `parse-cards.js` para converter a descrição de um card do Trello — ver
   `docs/REFERENCIA-TECNICA.md`).
2. Rode:
   ```bash
   .\publicar-arte-supabase-trello.ps1
   ```
   Isso sobe as artes no Supabase e move os cards para **"Aprovar Arte"**.
3. Revise a arte manualmente e mova o card para **"Arte aprovada"** — só
   assim a publicação automática é autorizada.
4. Rode `node publicar-proximo.js` (ou agende via cron/Agendador de Tarefas
   para rodar automaticamente todo dia).

---

## Dúvidas frequentes

**"A ferramenta não roda, dá erro de licença."**
Confira se `.env` tem `LICENSE_KEY=` com a senha exata que você recebeu na
compra, sem espaços extras.

**"As cores não mudam nos templates."**
Confirme que `config/brand.config.json` existe (não só o `.example.json`) e
que os 4 códigos de cor em `cores` estão no formato `#RRGGBB`.

**"Minha foto não aparece."**
O caminho precisa ser absoluto e começar com `file:///`. Caminhos relativos
não funcionam no Chrome headless.

Para detalhes técnicos completos (estrutura do JSON de card, specs visuais
de cada template, regras de copy), veja `docs/REFERENCIA-TECNICA.md`.
