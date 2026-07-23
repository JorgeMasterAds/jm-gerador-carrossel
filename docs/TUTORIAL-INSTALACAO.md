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

**Passo a passo:**

1. Acesse **https://trello.com/power-ups/admin** logado na sua conta Trello.
2. Clique em **"Novo"** para criar um Power-Up (pode chamar de qualquer
   nome, ex: "Meu Pipeline de Carrosséis").
3. Depois de criado, vá na aba **"API key"** do Power-Up — ali está sua
   `TRELLO_KEY`.
4. Na mesma página, clique no link **"Token"** (geralmente logo abaixo da
   API key) — autorize o acesso e copie o token gerado. Esse é seu
   `TRELLO_TOKEN`.
5. Cole os dois valores no `.env`:
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

1. Crie uma conta grátis em [supabase.com](https://supabase.com).
2. Crie um novo projeto.
3. Vá em **Storage** → **New bucket** → nomeie `criativos` → marque como
   **público**.
4. Vá em **Settings → API** e copie:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (não a `anon` key) → `SUPABASE_SERVICE_ROLE`
5. Preencha no `.env`.

---

## 7. Configurar Instagram (publicação automática)

1. Sua conta do Instagram precisa ser **profissional** e conectada a uma
   **Página do Facebook**.
2. Acesse [developers.facebook.com](https://developers.facebook.com) → crie
   um app → adicione o produto **Instagram Graph API**.
3. Em **Graph API Explorer**, gere um token com as permissões:
   `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`.
4. Pegue o **ID numérico da conta do Instagram** em Meta Business Suite →
   Configurações → Contas do Instagram.
5. Preencha no `.env`:
   ```
   IG_ACCOUNT_ID=17841000000000000
   IG_ACCESS_TOKEN=seu_token_aqui
   ```

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
