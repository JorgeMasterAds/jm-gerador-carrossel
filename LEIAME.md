# Carrossel Toolkit

Motor de geração de carrosséis Instagram — configurável por marca, com
publicação automatizada via Trello + Instagram.

## Por onde começar

1. **[docs/TUTORIAL-INSTALACAO.md](docs/TUTORIAL-INSTALACAO.md)** — instalação
   passo a passo (Node.js, `.env`, Trello, Supabase, Instagram)
2. **[docs/REFERENCIA-TECNICA.md](docs/REFERENCIA-TECNICA.md)** — specs
   completas: JSON de card, templates, comandos, regras de copy
3. **[briefing-modelo.md](briefing-modelo.md)** — modelo para descrever sua
   marca/avatar antes de gerar conteúdo

## O que esta ferramenta faz

- Gera carrosséis de 10 slides em 6 estilos visuais diferentes
- Renderiza HTML → PNG + vídeo MP4 via navegador headless
- Publica automaticamente no Instagram (carrossel/reel) via Trello como
  fila de aprovação
- Cor, foto, nome e @ configuráveis por marca — layout e tipografia de
  cada estilo permanecem fixos

## Licença

Uso sujeito à senha de ativação (`LICENSE_KEY` no `.env`). Ver `CLAUDE.md`
para os termos aplicáveis a qualquer assistente de IA operando este
repositório.
