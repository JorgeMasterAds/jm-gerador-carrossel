/**
 * publicar-proximo.js — Pipeline JM Ads
 *
 * Pega o próximo card em "Arte aprovada" em ordem da lista Trello e publica.
 * O tipo (xpost/carousel) determina apenas o template visual — publicação é
 * sempre carousel se houver mais de 1 imagem.
 *
 * Chamado pelos crons de 9h e 19h (mesma rotina, mesma ordem de cards).
 *
 * Uso:
 *   node publicar-proximo.js
 */

import { config } from 'dotenv';
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '.env') });

const TR_KEY   = process.env.TRELLO_KEY;
const TR_TOKEN = process.env.TRELLO_TOKEN;
const LISTA_ARTE_APROVADA = process.env.TRELLO_LIST_ARTE_APROVADA;

const trelloUrl = (p) => `https://api.trello.com/1${p}?key=${TR_KEY}&token=${TR_TOKEN}`;

async function trelloGet(p) {
  const r = await fetch(trelloUrl(p) + '&actions=commentCard&fields=id,name,desc,pos');
  return r.json();
}

async function main() {
  // ── Buscar cards em Arte aprovada ─────────────────────────────────────────────
  const cards = await trelloGet(`/lists/${LISTA_ARTE_APROVADA}/cards`);
  // Cards de tendência (newsjacking) têm PRIORIDADE — publicam antes dos demais.
  // Identificados por [TREND] no nome: carrosséis [TREND] e vídeos [TREND] [VÍDEO] T{N}.
  const isTrend = (c) => /\[\s*TREND\s*\]/i.test(c.name);
  // Número do card para ordenação:
  //   C19 → 19 | V03 → 3 | T02 → 2
  //   [TREND] 84 · gancho → 84 (score embedded no nome)
  //   Sem número → vai pro fim da fila.
  const cardNum = (c) => {
    // Tenta extrair número de C/V/T seguido de dígitos
    const mCod = c.name.match(/\b[CVT](\d+)\b/i);
    if (mCod) return parseInt(mCod[1], 10);
    // Tenta score TREND inline: "[TREND] 84 ·"
    const mScore = c.name.match(/\[\s*TREND\s*\]\s+(\d+)/i);
    if (mScore) return parseInt(mScore[1], 10);
    return Number.MAX_SAFE_INTEGER;
  };
  const reais  = cards
    .filter(c => !c.name.startsWith('📖'))
    .sort((a, b) => {
      const ta = isTrend(a) ? 0 : 1;
      const tb = isTrend(b) ? 0 : 1;
      if (ta !== tb) return ta - tb;   // trends primeiro (newsjacking, urgente)
      const na = cardNum(a), nb = cardNum(b);
      if (na !== nb) return na - nb;   // depois, número do card crescente (mais antigo primeiro)
      return a.pos - b.pos;            // desempate: ordem da coluna
    });

  if (reais.length === 0) {
    console.log(`Nenhum card em Arte aprovada. Nada a publicar.`);
    return;
  }

  // ── Achar próximo card com arte gerada (em ordem Trello) ─────────────────────
  let alvo = null;
  for (const card of reais) {
    // Pega sempre o MAIS RECENTE comentário ARTE_GERADA
    const comentArte = (card.actions || [])
      .filter(a => a.data?.text?.includes('ARTE_GERADA'))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .at(0);
    if (!comentArte) continue;

    const header = comentArte.data.text.split('\n')[0];
    const tipo   = header.match(/tipo:(\w+)/)?.[1] || 'carousel';

    alvo = { card, tipo, comentArte };
    break; // primeiro card com arte, em ordem da lista
  }

  if (!alvo) {
    console.log(`Nenhum card com arte gerada em Arte aprovada.`);
    return;
  }

  const { card, tipo, comentArte } = alvo;
  console.log(`Publicando: ${card.name} (estilo de arte: ${tipo})`);

  // ── Extrair URLs e legenda ────────────────────────────────────────────────────
  const lines   = comentArte.data.text.split('\n');
  // PNGs dos slides 1-9; MP4 do slide 10 (CTA animado)
  const pngUrls = lines
    .filter(l => l.startsWith('https://') && l.endsWith('.png'))
    .slice(0, 10);
  const mp4Url  = lines.find(l => l.startsWith('https://') && l.endsWith('.mp4')) || null;
  // Slide 10 como vídeo se MP4 disponível, senão PNG
  const urls = mp4Url ? [...pngUrls.slice(0, 9), mp4Url] : pngUrls;

  const legMatch = card.desc.match(/##\s*LEGENDA\s*\n([\s\S]+?)(\n##|$)/);
  const caption  = legMatch ? legMatch[1].trim() : '';

  // Formato REAL da publicação (independe do estilo de arte): >1 mídia = carrossel.
  const formato = urls.length > 1 ? `carrossel (${urls.length} mídias)` : 'imagem única (1 mídia)';
  console.log(`Formato: ${formato}`);

  if (urls.length === 0) {
    console.error(`Card ${card.name} sem URLs válidas no comentário ARTE_GERADA.`);
    process.exitCode = 1;
    return;
  }

  // ── Gravar payload e chamar agendar-instagram.js ──────────────────────────────
  const tmpDir = path.join(__dirname, 'tmp');
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

  const payloadPath = path.join(tmpDir, `_publish_${tipo}.json`);
  const payload = JSON.stringify({ cardId: card.id, tipo, imageUrls: urls, caption });
  writeFileSync(payloadPath, payload, { encoding: 'utf8' });

  try {
    const result = execSync(`node "${path.join(__dirname, 'agendar-instagram.js')}" "${payloadPath}"`, {
      cwd: __dirname,
      encoding: 'utf8',
      timeout: 300000,  // 5 min — vídeos no carousel podem levar ~100s de polling
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    console.log(`✅ Publicado com sucesso: ${result.trim()}`);
  } catch (err) {
    const stderr = err.stderr ? `\nSTDERR: ${err.stderr.trim()}` : '';
    const stdout = err.stdout ? `\nSTDOUT: ${err.stdout.trim()}` : '';
    console.error(`❌ Erro ao publicar ${card.name}: ${err.message}${stderr}${stdout}`);
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error(`❌ Erro fatal: ${err.message}`);
  process.exitCode = 1;
});
