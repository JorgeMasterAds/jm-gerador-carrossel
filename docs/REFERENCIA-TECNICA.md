# Referência Técnica — Carrossel Toolkit

Documento de referência completo do motor de geração de carrosséis: scripts,
estrutura de dados, specs visuais e regras de copy. Para instalação, veja
`TUTORIAL-INSTALACAO.md` primeiro.

---

## 1. Arquivos do projeto

| Arquivo | Função |
|---------|--------|
| `gerar-htmls.js` | Lê JSON de cards → gera HTMLs em `tmp/` |
| `screenshot-slides.js` | Renderiza HTMLs → PNGs (Puppeteer) + MP4 |
| `template-xpost.js` | Estilo X/Twitter (padrão para conteúdo de tendência) |
| `template-cyber.js` | Cyberpunk/hacker neon |
| `template-neon.js` | Dark glassmorphism |
| `template-darkwarm.js` | Dark quente |
| `template-mono.js` | Preto puro minimalista |
| `template-editorial.js` | Estilo editorial/news com header X (para conteúdo com foto) |
| `parse-cards.js` | Converte descrição de card do Trello → JSON de cards |
| `cleanup-pipeline.js` | Limpa Supabase/Trello antes do upload |
| `agendar-instagram.js` | Publica carrossel via Meta Graph API |
| `publicar-proximo.js` | Pega próximo card em "Arte aprovada" e publica |
| `publicar-arte-supabase-trello.ps1` | Upload Supabase + attachments + comentário + move para "Aprovar Arte" |
| `lib/brand-config.js` | Carrega `config/brand.config.json` |
| `lib/color-utils.js` | Helper para gerar variações de transparência de uma cor |
| `lib/check-license.js` | Trava de ativação da ferramenta |
| `config/brand.config.json` | Sua configuração de marca (você cria a partir do `.example`) |

---

## 2. Estrutura do JSON de card

```json
{
  "cod": "jm-c01",
  "cardId": "TRELLO_CARD_ID",
  "brand": "minha-marca",
  "template": "xpost",
  "eixo": "Nome do eixo",
  "trend": false,
  "capaImagem": null,
  "ctaBtn": "Link na bio · Fale comigo",
  "legenda": "Legenda do Instagram (150-200 palavras, sem hashtags)",
  "gancho": "Título da capa — máx. 12 palavras",
  "ganchoCorpo": "Subtítulo de apoio ao gancho",
  "slides": [
    { "titulo": "...", "corpo": "linha1\nlinha2", "tipo": "conteudo", "label": "LABEL", "imagem": null }
  ],
  "ctaTitulo": "Título do slide de CTA",
  "cta": "Corpo do slide de CTA"
}
```

**Campos obrigatórios:** `cod`, `gancho`, `ganchoCorpo`, `slides` (9 objetos
= slides 2 a 10).

**`capaImagem`:** foto fornecida → fundo fullbleed da capa. Sem foto →
fundo escuro limpo. **Nunca gere uma imagem automaticamente** — se não há
foto, o fundo escuro é a opção correta.

**`imagem` (por slide):** `null` = só texto. Caminho `file:///...` = imagem
dominante com até 2 bullets abaixo.

**`template`:** força um template específico. Ausente → `--smart-rotation`
decide.

**`eixo` / `trend`:** usados por `--smart-rotation` para decidir entre
xpost (conteúdo de tendência/notícia) e o rodízio evergreen.

---

## 3. Specs visuais por template

Todos os templates:
- **Dimensão:** 1080×1350px (renderizado a 2× = 2160×2700px)
- **Fonte de corpo:** ~44px, com auto-scaling para caber no espaço
- **Fonte de capa (gancho):** auto-scaling via binary search, preenche ~82%
  da área disponível
- **Fonte de impacto:** 76-96px conforme template
- **CTA:** 86-96px de título + botão

| Template | Fundo | Fonte principal | Cor configurável |
|---|---|---|---|
| xpost | Branco | Inter | Nenhuma (P&B) |
| editorial | Branco (capa: foto+gradiente) | Inter | Nenhuma (P&B) |
| mono | Preto puro | Inter | `cores.mono` |
| neon | Dark `#030303` | Space Grotesk + Playfair | `cores.neon` |
| darkwarm | Dark quente `#100C06` | Manrope + Playfair | `cores.darkwarm` |
| cyber | Dark `#03070A` | Space Mono + Inter | `cores.cyber` (cyan/roxo fixos — parte do conceito cyberpunk) |

A cor configurada em `brand.config.json` substitui apenas o **accent**
(destaque, glow, borda) de cada template — layout, tamanho de fonte e
posicionamento continuam fixos.

---

## 4. Comandos

```bash
# Gerar HTMLs
node gerar-htmls.js cards-aprovados.json --smart-rotation
node gerar-htmls.js cards-aprovados.json --template xpost
node gerar-htmls.js cards-aprovados.json --pair cyber
node gerar-htmls.js cards-aprovados.json --auto-pair

# Renderizar PNGs + MP4
node screenshot-slides.js --dir tmp/xpost
node screenshot-slides.js --dir tmp/cyber --no-video

# Converter descrição de card do Trello em JSON
node parse-cards.js cards-raw-exemplo.json cards-aprovados.json

# Limpeza (Supabase + Trello)
node cleanup-pipeline.js
node cleanup-pipeline.js --card jm-c01

# Publicar próximo card em "Arte aprovada"
node publicar-proximo.js
```

---

## 5. Rotação de templates

| Modo | Comportamento |
|------|---------------|
| `--smart-rotation` | trend/notícia → xpost; evergreen → rodízio [cyber, neon, darkwarm, mono] |
| `--auto-pair` | ciclo automático de 6 semanas |
| `--pair X` | xpost + X para todos os cards |
| `--template X` | X para todos os cards |

---

## 6. Estrutura de copy (10 slides)

```
Slide 01 → CAPA (gancho + ganchoCorpo)
Slide 02 → CONTEXTO
Slide 03 → APROFUNDAMENTO
Slide 04 ou 05 → IMPACTO (obrigatório — frase única, tipo:"impacto")
Slide 05/06 → AÇÃO
Slide 06/07 → APROFUNDAMENTO 2
Slide 07/08 → CONTEÚDO
Slide 08/09 → PROVA (dado concreto — nunca inventado)
Slide 10 → CTA
```

**Regras invioláveis:**
- Gancho ≤ 12 palavras — nunca entrega a resposta na capa
- Um slide deve ser `tipo:"impacto"` — frase única, sem bullets
- Slide de prova precisa de dado real, com fonte quando possível
- CTA completo — nunca terminar só com "Link na bio."
- Sem escassez artificial ("vagas limitadas", "só hoje")
- Sem travessão (—) em nenhum texto
- Acentuação correta em português
- `**palavra**` = destaque na cor de accent do template — usar com moderação

---

## 7. Publicação (Meta Graph API)

```
1. POST /{ig-user-id}/media          → cria container por imagem/vídeo
2. Aguarda status FINISHED (polling)
3. POST /{ig-user-id}/media          → cria container carousel com os children
4. POST /{ig-user-id}/media_publish  → publica
```

Ver `agendar-instagram.js` para a implementação completa.

---

## 8. Portão de aprovação (regra de segurança do pipeline)

O motor **nunca** move um card direto para "Arte aprovada" — o destino
automático é sempre "Aprovar Arte". Só uma ação manual do dono da conta move
o card para "Arte aprovada", e é esse gesto que autoriza a publicação
automática seguinte. Isso existe para nenhum conteúdo ir ao ar sem revisão
humana.
