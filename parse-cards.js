import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Uso: node parse-cards.js [arquivo-entrada.json] [arquivo-saida.json]
// Padrão: cards-raw-exemplo.json → cards-aprovados.json
const inputFile  = process.argv[2] || 'cards-raw-exemplo.json';
const outputFile = process.argv[3] || 'cards-aprovados.json';

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, inputFile), 'utf-8'));

// Linhas que são metadados do card (não aparecem nos slides)
const METADATA_KEYS = [
  'PALAVRA DESTAQUE','ARCO NARRATIVO','CATEGORIA GANCHO','GATILHO','AVATAR',
  'DOR','DESEJO','OBJEÇÃO','OBJECAO','FONTE','TIPO','ARCO','FRAMEWORK',
  'CONCEITO-NOME','LINGUAGEM','CATEGORIA','EIXO',
];
const isMetaLine = (l) => {
  const t = l.trim();
  // Bold metadata: **CHAVE:** valor
  if (/^\*\*[A-ZÁÉÍÓÚ][^*]+:\*\*/.test(t)) return true;
  // Plain metadata: CHAVE: valor
  if (METADATA_KEYS.some(k => t.toUpperCase().startsWith(k + ':'))) return true;
  // DESIGN lines
  if (/^DESIGN:/i.test(t)) return true;
  return false;
};

function extractCod(name) {
  const m = name.match(/^(C\d+)/i);
  return m ? `jm-${m[1].toLowerCase()}` : 'jm-x';
}

function parseCard(card) {
  const cod = extractCod(card.name);
  const desc = card.desc.replace(/\r\n/g, '\n');

  // ── GANCHO ──────────────────────────────────────────────────────────────────
  // Formato novo: **GANCHO:**\n<texto do gancho>\n\n<ganchoCorpo opcional>
  // Formato antigo: GANCHO: <texto do gancho> (linha única)
  let gancho = '';
  let ganchoCorpo = '';

  const boldGanchoMatch = desc.match(/\*\*GANCHO:\*\*\s*\n([\s\S]*?)(?=\n\*\*[A-Z]|\n##\s|\n[A-Z]{2,}:|\n\n[A-Z]{2,}:|$)/i);
  const inlineGanchoMatch = desc.match(/^GANCHO:\s*(.+)$/m);

  if (boldGanchoMatch) {
    // Novo formato: extrair gancho e ganchoCorpo
    const block = boldGanchoMatch[1];
    const blockLines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const contentLines = blockLines.filter(l => !isMetaLine(l));
    if (contentLines.length > 0) {
      gancho = contentLines[0];
      ganchoCorpo = contentLines.slice(1).join('\n');
    }
  } else if (inlineGanchoMatch) {
    gancho = inlineGanchoMatch[1].trim();
  }

  // ── SLIDES ───────────────────────────────────────────────────────────────────
  const sections = desc.split(/\n##\s+/);

  const slidesAll = [];
  let legenda = '';

  for (let i = 1; i < sections.length; i++) {
    const block = sections[i];
    const firstNewline = block.indexOf('\n');
    const header = (firstNewline === -1 ? block : block.slice(0, firstNewline)).trim();
    const body   = firstNewline === -1 ? '' : block.slice(firstNewline + 1);

    if (/^LEGENDA/i.test(header)) {
      legenda = body.trim();
      continue;
    }

    const slideMatch = header.match(/^SLIDE\s+(\d+)\s*-\s*(.+)$/i);
    if (!slideMatch) continue;
    const slideNum   = parseInt(slideMatch[1], 10);
    const slideLabel = slideMatch[2].trim();

    // ── Processar body do slide ──────────────────────────────────────────────
    let tipoSlide = 'conteudo';
    let titulo = '';
    let corpoLines = [];
    let imagemSlide = null;

    const rawLines = body.split('\n');
    let tituloDefined = false;

    for (const line of rawLines) {
      const t = line.trim();
      if (!t) continue;

      // TIPO: IMPACTO → marca o slide e descarta a linha
      if (/^TIPO:\s*IMPACTO/i.test(t)) {
        tipoSlide = 'impacto';
        continue;
      }

      // IMAGEM: <url ou caminho> → extrai o caminho da imagem e descarta a linha
      if (/^IMAGEM:\s*/i.test(t)) {
        imagemSlide = t.replace(/^IMAGEM:\s*/i, '').trim();
        continue;
      }

      // Linhas de metadados genéricos → descartar
      if (isMetaLine(line)) continue;

      // TÍTULO: <texto> → extrai o título e descarta o prefixo
      if (/^TÍTULO:\s*/i.test(t)) {
        titulo = t.replace(/^TÍTULO:\s*/i, '').trim();
        tituloDefined = true;
        continue;
      }

      // CORPO: sozinho (só o label) → descarta
      if (/^CORPO:\s*$/i.test(t)) continue;

      // CORPO: <texto inline> → extrai o texto e adiciona ao corpo
      if (/^CORPO:\s+/i.test(t)) {
        corpoLines.push(t.replace(/^CORPO:\s+/i, '').trim());
        continue;
      }

      // Linha de conteúdo normal
      corpoLines.push(t);
    }

    // Fallback: se título não foi definido via "TÍTULO:", primeira linha do corpo vira título
    if (!tituloDefined && corpoLines.length > 0) {
      titulo = corpoLines.shift();
    }

    // Fallback final: usa o label como título
    if (!titulo) titulo = slideLabel;

    const corpo = corpoLines.join('\n').trim();

    slidesAll.push({ num: slideNum, label: slideLabel, titulo, corpo, tipo: tipoSlide, imagem: imagemSlide });
  }

  // Sort by num
  slidesAll.sort((a, b) => a.num - b.num);

  // Último slide = CTA (SLIDE 10)
  const ctaSlide      = slidesAll[slidesAll.length - 1];
  const contentSlides = slidesAll.slice(0, -1); // SLIDES 1..9

  return {
    cod,
    cardId: card.id,
    gancho,
    ganchoCorpo,
    slides: contentSlides.map(s => ({
      titulo:  s.titulo,
      corpo:   s.corpo,
      tipo:    s.tipo,
      label:   s.label,
      imagem:  s.imagem || null,
    })),
    ctaTitulo: ctaSlide ? ctaSlide.titulo : 'Quer falar comigo?',
    cta:       ctaSlide ? ctaSlide.corpo  : '',
    legenda,
  };
}

const parsed = raw.map(parseCard);
const enc = new TextEncoder();
fs.writeFileSync(path.join(__dirname, outputFile), JSON.stringify(parsed, null, 2), 'utf-8');
console.log(`✅ ${parsed.length} cards parsed → ${outputFile}`);
parsed.forEach(p => {
  const preview = p.gancho.slice(0, 60);
  console.log(`  ${p.cod} (${p.cardId}) — gancho: "${preview}" | ${p.slides.length} slides + CTA`);
});
