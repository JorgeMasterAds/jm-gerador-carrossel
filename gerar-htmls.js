/**
 * gerar-htmls.js — Pipeline JM Ads
 *
 * Lê um arquivo JSON de cards e gera os HTMLs em tmp/.
 *
 * Templates disponíveis:
 *   mono       — Inter, preto puro, texto como visual, direto
 *   neon       — Space Grotesk, dark, glow vermelho, glassmorphism
 *   xpost      — Inter, branco, estilo X/Twitter, bold vs regular
 *   darkwarm   — Manrope, dark warm, coral, cards com borda lateral
 *   cyber      — Space Mono + Inter, hacker/cyberpunk, neon vermelho, grid
 *
 * Uso — template único:
 *   node gerar-htmls.js cards.json --template cyber
 *   node gerar-htmls.js cards.json --template xpost
 *
 * Uso — par semanal (xpost + outro):
 *   node gerar-htmls.js cards.json --pair cyber        → xpost + cyber
 *   node gerar-htmls.js cards.json --auto-pair         → detecta semana ISO, rotaciona automático
 *
 * Uso — smart rotation (RECOMENDADO para pipeline automático):
 *   node gerar-htmls.js cards.json --smart-rotation
 *   → tendência/notícia → xpost (sinais: template:"xpost", trend:true, eixo "Notícias", ou capaImagem)
 *   → evergreen → round-robin: cyber, neon, darkwarm, mono (sem xpost)
 *   → mantém o xpost reservado p/ newsjacking e varia o visual do conteúdo evergreen
 *
 * Uso — rotação completa (LEGADO — não usar no pipeline):
 *   node gerar-htmls.js cards.json --full-rotation
 *   → 2 em cada 3 cards → xpost (ratio 2:1) · 1 em cada 3 → cyber/neon/darkwarm/mono
 *
 * Rotação --auto-pair (ciclo de 6 semanas):
 *   S1=cyber · S2=neon · S3=darkwarm · S4=mono · S5=neon · S6=neon → repete
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkLicense } from './lib/check-license.js';

checkLicense();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Rotação semanal (ciclo de 6 semanas) ──────────────────────────────────────
const ROTATION = ['cyber', 'neon', 'darkwarm', 'mono', 'neon', 'neon'];

// ── Rotação completa: templates para os cards ímpares (variados) ──────────────
const OTHER_TEMPLATES = ['cyber', 'neon', 'darkwarm', 'mono'];

function getISOWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// ── Args ───────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

const templateFlag     = args.indexOf('--template');
const pairFlag         = args.indexOf('--pair');
const autoPairFlag     = args.includes('--auto-pair');
const fullRotationFlag = args.includes('--full-rotation');
const smartRotationFlag = args.includes('--smart-rotation');

// Arquivo de entrada (primeiro arg sem '--')
const inputFile = args.find(a =>
  !a.startsWith('--') &&
  (templateFlag === -1 || a !== args[templateFlag + 1]) &&
  (pairFlag === -1     || a !== args[pairFlag + 1])
) || 'cards-aprovados.json';
const inputPath = path.isAbsolute(inputFile) ? inputFile : path.join(__dirname, inputFile);

const validTemplates = ['mono', 'neon', 'xpost', 'darkwarm', 'cyber', 'editorial', 'saude-mono', 'saude-xpost'];

// ── Resolver quais templates gerar ────────────────────────────────────────────
let templatesToRun = [];
let useFullRotation = false;
let useSmartRotation = false;

if (smartRotationFlag) {
  // Smart rotation (REGRA ATUAL): tendência/notícia → xpost · resto → rodízio dos outros 4.
  // O xpost fica reservado para conteúdo de tendência/newsjacking; o conteúdo
  // evergreen alterna entre cyber/neon/darkwarm/mono para variar o feed.
  useSmartRotation = true;
  templatesToRun = ['xpost', ...OTHER_TEMPLATES]; // apenas referência para o resumo final
  console.log(`\n🧠 Smart rotation: XPOST só p/ tendência/notícia · evergreen em rodízio [CYBER/NEON/DARKWARM/MONO]`);

} else if (fullRotationFlag) {
  // Full rotation (LEGADO): xpost nos pares, round-robin dos outros nos ímpares
  useFullRotation = true;
  templatesToRun = ['xpost', ...OTHER_TEMPLATES]; // não usado diretamente, apenas referência
  console.log(`\n🔄 Full rotation: XPOST (2/3) + CYBER/NEON/DARKWARM/MONO (1/3, round-robin)`);

} else if (autoPairFlag) {
  // Auto-pair: xpost + template da semana
  const week    = getISOWeek();
  const paired  = ROTATION[(week - 1) % ROTATION.length];
  templatesToRun = ['xpost', paired];
  console.log(`\n📅 Semana ISO ${week} → par automático: XPOST + ${paired.toUpperCase()}`);

} else if (pairFlag !== -1) {
  // Par manual: xpost + template especificado
  const paired = args[pairFlag + 1];
  if (!paired || !validTemplates.includes(paired)) {
    console.error(`❌ Template inválido para --pair: "${paired}". Disponíveis: ${validTemplates.join(', ')}`);
    process.exit(1);
  }
  templatesToRun = ['xpost', paired];
  console.log(`\n🔗 Par manual: XPOST + ${paired.toUpperCase()}`);

} else if (templateFlag !== -1) {
  // Template único
  const t = args[templateFlag + 1];
  if (!t || !validTemplates.includes(t)) {
    console.error(`❌ Template inválido: "${t}". Disponíveis: ${validTemplates.join(', ')}`);
    process.exit(1);
  }
  templatesToRun = [t];

} else {
  // Nenhum flag — mostrar uso
  console.log(`
📋 Uso:
  node gerar-htmls.js cards.json --smart-rotation      → tendência→xpost, resto→rodízio (RECOMENDADO)
  node gerar-htmls.js cards.json --template <nome>     → template único
  node gerar-htmls.js cards.json --pair <nome>         → xpost + template
  node gerar-htmls.js cards.json --auto-pair           → xpost + rotação semanal
  node gerar-htmls.js cards.json --full-rotation       → LEGADO: 2 em cada 3 → xpost

Templates: ${validTemplates.join(', ')}

Smart rotation (--smart-rotation):
  tendência/notícia → xpost (sinais: template:"xpost", trend:true, eixo "Notícias", capaImagem)
  evergreen → cyber → neon → darkwarm → mono (round-robin, sem xpost)
`);
  process.exit(0);
}

// ── Arquivo de entrada ─────────────────────────────────────────────────────────
if (!fs.existsSync(inputPath)) {
  console.error(`❌ Arquivo não encontrado: ${inputPath}`);
  process.exit(1);
}

const cards = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
console.log(`📦 ${cards.length} card(s) em ${path.basename(inputPath)}`);
console.log(`🎨 Gerando: ${templatesToRun.map(t => t.toUpperCase()).join(' + ')}\n`);

// ── Gerar para cada card → 1 template ─────────────────────────────────────────
// --full-rotation: pares → xpost, ímpares → round-robin [cyber,neon,darkwarm,mono]
// --pair / --auto-pair: round-robin entre os 2 templates
// --template: template único para todos
// ── Extrai keyword curta do label para o badge ───────────────────────────────
function labelToKeyword(lbl) {
  if (!lbl) return null;
  let s = lbl.trim().toUpperCase();
  // Remove artigos iniciais
  s = s.replace(/^(A |O |OS |AS |UM |UMA |POR |)+/g, '');
  // Remove sufixos ruidosos
  s = s.replace(/\s+(NA PRÁTICA|DE ESCALAR.*|DO INTERVALO|DO LANÇAMENTO.*|QUE MULTIPLICA|QUE MUDA|QUE FUNCIONA|REAIS|SEM ESTRUTURA.*|DO PRODUTO.*)$/gi, '');
  // Remove " DE/DO/DA ..." após a primeira palavra-bloco
  s = s.replace(/\s+(DE |DO |DA |DAS |DOS )\w.*$/, '');
  // Normaliza números por extenso
  s = s.replace(/\bTRÊS\b/g, '3').replace(/\bDOIS\b/g, '2').replace(/\bQUATRO\b/g, '4').replace(/\bCINCO\b/g, '5');
  // Máximo 2 palavras
  s = s.split(/\s+/).slice(0, 2).join(' ');
  // Trunca a 15 chars
  return s.length > 15 ? s.slice(0, 15).trim() : s;
}

// Remove emojis-número de teclado (1️⃣ 2️⃣ ...) no início de cada linha de corpo.
// O avatar lê como "número ao lado do emoji" — vira lista com marcador neutro (traço).
function stripKeycaps(txt) {
  return (txt || '').split('\n').map(l => l.replace(/^\s*[0-9#*]️?⃣\s*/, '')).join('\n');
}

let totalHtml = 0;
const cache = new Map(); // cache de imports
let otherCount = 0;      // contador só dos cards evergreen (para o rodízio do smart rotation)

// É card de tendência/notícia? → usa xpost. Sinais (qualquer um basta):
//   - card.template === 'xpost' (override explícito no JSON)
//   - card.trend === true
//   - card.eixo menciona "notícia"/"novidade"
//   - tem imagem de capa (todo card trend/notícia declara capaImagem — evergreen não)
function isTrendOuNoticia(card) {
  if (card.template && validTemplates.includes(card.template)) return card.template === 'xpost';
  if (card.trend === true) return true;
  const eixo = (card.eixo || '').toLowerCase();
  if (eixo.includes('notíc') || eixo.includes('notic') || eixo.includes('novidade')) return true;
  const capa = card.capaImagem || (card.slides && card.slides[0] && card.slides[0].imagem);
  return Boolean(capa);
}

for (let idx = 0; idx < cards.length; idx++) {
  const card = cards[idx];
  let templateName;
  if (useSmartRotation) {
    // override explícito de template não-xpost no card
    if (card.template && validTemplates.includes(card.template) && card.template !== 'xpost') {
      templateName = card.template;
    } else if (isTrendOuNoticia(card)) {
      templateName = 'xpost';
    } else {
      templateName = OTHER_TEMPLATES[otherCount % OTHER_TEMPLATES.length];
      otherCount++;
    }
  } else if (useFullRotation) {
    if (idx % 3 < 2) {
      templateName = 'xpost';
    } else {
      const otherIdx = Math.floor(idx / 3) % OTHER_TEMPLATES.length;
      templateName = OTHER_TEMPLATES[otherIdx];
    }
  } else if (templatesToRun.length === 1) {
    templateName = templatesToRun[0];
  } else {
    templateName = templatesToRun[idx % templatesToRun.length];
  }

  if (!cache.has(templateName)) {
    cache.set(templateName, (await import(`./template-${templateName}.js`)).gerarHTMLSlide);
  }
  const gerarHTMLSlide = cache.get(templateName);

  const tmpDir = path.join(__dirname, 'tmp', templateName);
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const { cod, gancho, ganchoCorpo = '', slides = [], cta, ctaTitulo, capaImagem = null, capaImagem2 = null } = card;
  // slides[0] (SLIDE 1) é descartado: duplica o gancho (capa visual).
  // CTA já vem separado em ctaTitulo/cta — não está no array slides.
  // slice(1) exclui apenas a capa → slides 2..9 são conteúdo intermediário.
  const contentSlides = slides.slice(1);
  const total = contentSlides.length + 2; // gancho + conteúdo + CTA = 10
  const ctaBtn = card.ctaBtn || 'Link na bio · Preencha o formulário';
  const brand = card.brand || 'jm-ads'; // 'jm-ads' | 'nexus-metrics'
  // Imagem da capa: campo capaImagem do card OU imagem do slides[0].
  // capaImagem2: segunda foto para layout split 50/50 (apenas template editorial).
  const capaImg  = capaImagem  || (slides[0] && slides[0].imagem) || null;
  const capaImg2 = capaImagem2 || null;
  const slidesData = [
    { titulo: gancho, corpo: stripKeycaps(ganchoCorpo), tipo: 'gancho',   numeracao: 0,                    total, ctaBtn, brand, label: card.label || null, keyword: null, imagem: capaImg, imagem2: capaImg2 },
    ...contentSlides.map((s, i) => ({ titulo: s.titulo, corpo: stripKeycaps(s.corpo), tipo: s.tipo || 'conteudo', numeracao: i + 1, total, ctaBtn, brand, imagem: s.imagem || null, imagemPosition: s.imagemPosition || null, label: s.label || null, keyword: labelToKeyword(s.label) })),
    { titulo: ctaTitulo || 'Quer falar comigo?', corpo: stripKeycaps(cta), tipo: 'cta', numeracao: contentSlides.length + 1, total, ctaBtn, brand, label: null, keyword: null },
  ];

  for (let i = 0; i < slidesData.length; i++) {
    const html = gerarHTMLSlide(slidesData[i]);
    const nome = `${cod}_${templateName}_slide${String(i + 1).padStart(2, '0')}.html`;
    fs.writeFileSync(path.join(tmpDir, nome), html, 'utf-8');
    totalHtml++;
  }

  console.log(`  🎨 ${cod.padEnd(8)} → ${templateName.toUpperCase().padEnd(10)} (${slidesData.length} slides)`);
}

// ── Instruções de screenshot ──────────────────────────────────────────────────
console.log(`\n✅ ${totalHtml} HTML(s) gerado(s)\n`);

if (templatesToRun.length > 1) {
  console.log(`📸 Para renderizar:\n`);
  for (const t of templatesToRun) {
    console.log(`  node screenshot-slides.js --dir tmp\\${t}`);
  }
  console.log('');
} else {
  console.log(`📸 rode: node screenshot-slides.js --dir tmp\\${templatesToRun[0]}\n`);
}
