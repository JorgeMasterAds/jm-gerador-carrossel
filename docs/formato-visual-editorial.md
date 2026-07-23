# Carrossel Editorial — Formato Trending/Polêmica com Imagem e Vídeo

## Identidade Visual

- **Estilo:** Post X (Twitter) — header no topo de todos os slides
- **Template:** `template-editorial.js`
- **Fundo:** Branco (#FFFFFF), tinta #0F1419
- **Header:** avatar 82px + nome 30px bold + badge azul + handle 32px + botão "Seguir" + "···"
- **Destaque de título:** caixa preta (`boldBox`) — fundo #0F1419, texto branco, border-radius 10px
- **Corpo:** 37px Inter, cor #536471
- **Label:** 34px Inter, cor #8B98A5, font-weight 500
- **Dots de progresso:** pill ativo = 30px wide, inativo = 7px, INK/rgba(0,0,0,0.16)

## Tipografia — tamanhos mínimos obrigatórios

| Elemento | Tamanho | Obs |
|---|---|---|
| Nome no header | 30px bold | |
| Handle | 32px | |
| Label de slide | 34px | sempre legível |
| Título conteúdo | 74px (base) / min 48px | auto-scale por comprimento |
| Título impacto | 96px (base) / min 58px | |
| Título CTA | 76px (base) / min 50px | |
| Título capa | 78px (base) / min 50px | |
| Corpo/bullets | 37px (sem foto) / 33px (com foto) | |
| CTA corpo | 40px | |
| Botão CTA | 34px | |

## Tipos de Slide

1. **gancho** — Capa. Pode ser:
   - `capaImagem` + `capaImagem2`: split 50/50 lado a lado com linha divisória (para duas pessoas/marcas)
   - `capaImagem` sozinho: foto fullbleed com gradiente
   - Sem imagem: fundo escuro (#0F1419)
   - Texto e header sobre gradiente escuro (dark=true)

2. **conteudo** — Slide padrão. Com ou sem foto:
   - Sem foto: texto centralizado verticalmente
   - Com foto: texto no topo (sem max-height fixo — usa flex-shrink:0), linha divisória, foto ocupa o resto (`object-fit:cover`)
   - `imagemPosition`: campo no JSON do slide para controlar `object-position` da foto

3. **impacto** — Frase única enorme, texto alinhado à esquerda

4. **cta** — Centralizado, título com caixa preta, corpo 40px, botão borda/pill

## Regras de Foto — CRÍTICAS

- **Sempre alta qualidade:** converter webp/avif para JPG via ffmpeg (`-q:v 1`) — nunca baixar JPG de site sem verificar resolução mínima
- **Rostos nunca cortados:** usar `imagemPosition` para garantir cabeças visíveis
  - Selfie (rostos no centro): `"center 40%"` a `"center 55%"`
  - Retrato formal (rosto no topo): `"center top"` ou `"center 15%"`
  - Foto de palco/evento: `"center top"`
- **Split de capa:** `capaImagem` = esquerda, `capaImagem2` = direita. **Sem labels de nome** por cima das fotos.
- **Linha divisória central:** 3px branca, 40% opacidade
- **`boldBox`** só em slides com fundo branco — não usar na capa (texto já é branco sobre gradiente escuro)

## Estrutura do JSON

```json
{
  "cod": "jm-trend-XX",
  "gancho": "Título da capa (pode ter **bold**)",
  "ganchoCorpo": "Subtítulo da capa",
  "label": "Label da capa (ex: Posicionamento de marca)",
  "capaImagem": "file:///C:/CAMINHO/COMPLETO/assets/noticias/foto1.jpg",
  "capaImagem2": "file:///C:/CAMINHO/COMPLETO/assets/noticias/foto2.jpg",
  "template": "editorial",
  "trend": true,
  "slides": [
    { "titulo": "...", "corpo": "", "imagem": null },
    { "label": "...", "titulo": "...", "corpo": "...", "imagem": null },
    {
      "label": "...", "titulo": "...", "corpo": "...",
      "imagem": "file:///C:/CAMINHO/COMPLETO/assets/noticias/foto.jpg",
      "imagemPosition": "center 40%"
    },
    { "tipo": "impacto", "titulo": "Frase **bold** de impacto.", "corpo": "" }
  ],
  "ctaTitulo": "Título do CTA",
  "cta": "Texto do CTA completo...",
  "ctaBtn": "Link na bio · Ação",
  "legenda": "Legenda completa para Instagram..."
}
```

> **Atenção:** `slides[0]` é SEMPRE descartado (placeholder) — o conteúdo real começa em `slides[1]`.

## Sequência padrão — Trending com Vídeo (10 itens = limite Instagram)

```
01 CAPA         — split 50/50 ou foto fullbleed
02 A PERGUNTA   — slide conteudo sem foto
03 VÍDEO 1      — trecho do personagem A
04 O DIFERENCIAL— slide conteudo sem foto
05 O ERRO       — slide conteudo sem foto
06 IMPACTO      — frase de virada (tipo impacto)
07 A VIRADA     — slide conteudo COM foto do evento
08 VÍDEO 2      — trecho do personagem B
09 O APRENDIZADO— slide conteudo COM foto pessoal/selfie
10 CTA          — slide cta
```

> Instagram aceita no máximo 10 itens por carrossel. Se precisar de mais slides, mesclar dois em um (ex: aprendizado + lição juntos no slide 09).

## Fluxo de Produção

```bash
# 1. Preparar assets em assets/noticias/
#    - Converter webp/avif: ffmpeg -i foto.webp -q:v 1 foto.jpg
#    - Crop vídeo 9:16 → 4:5: ffmpeg -i input.mp4 -vf "crop=1080:1350:0:285" output.mp4

# 2. Editar JSON (copy + caminhos de imagem)

# 3. Gerar HTMLs
node gerar-htmls.js carrossel-XX.json --template editorial

# 4. Renderizar PNGs
node screenshot-slides.js --dir tmp/editorial --no-video

# 5. Verificar visualmente: slide 01 (capa), slides com foto, CTA

# 6. Upload Supabase + Trello
.\publicar-arte-supabase-trello.ps1

# 7. Publicar no Instagram
node publicar-proximo.js
```

## Vídeos

| Uso | Configuração |
|-----|-------------|
| Instagram (publicação) | `crf 18`, duração máx 60s |
| Trello (preview) | `-b:v 430k -maxrate 460k -bufsize 600k -b:a 96k` (< 10MB) |
| Crop 9:16 → 4:5 | `ffmpeg -i input.mp4 -vf "crop=1080:1350:0:285" output.mp4` |

> Manter dois arquivos: `_45.mp4` (HQ para IG) e `_small.mp4` (comprimido para Trello).

## Trello — Limpeza ao republicar

- Apagar TODOS os anexos anteriores
- Apagar TODOS os comentários anteriores
- Subir novos anexos + criar 1 comentário: `"ARTE FINAL vN — descrição"`
- Card permanece em "Aprovar Arte" — o dono da conta move manualmente para "Arte aprovada"

## Checklist de qualidade antes de publicar

- [ ] Rostos visíveis em todos os slides com foto
- [ ] Texto não cortado em nenhum slide (sem overflow)
- [ ] Capa: contraste ok (texto branco sobre gradiente escuro)
- [ ] `boldBox` não aparece em slides de capa
- [ ] Todos os 10 itens presentes (contar antes de subir)
- [ ] Vídeos em formato 4:5 (1080×1350)
- [ ] Vídeos ≤ 60s cada
