/**
 * agendar-instagram.js — Pipeline JM Ads
 *
 * Publica 1 post (xpost ou carousel) no Instagram via Meta Graph API v22.0.
 * Publicação IMEDIATA — scheduled_publish_time requer App Review separado no Meta.
 *
 * Uso:
 *   node agendar-instagram.js '<json>'
 *   node agendar-instagram.js payload.json
 *
 * JSON de entrada:
 *   {
 *     "cardId":    "trello-card-id",
 *     "tipo":      "xpost" | "carousel",
 *     "imageUrls": ["https://..."],   // 1 URL para xpost, até 10 para carousel
 *     "caption":   "legenda do post"
 *   }
 *
 * Saída (stdout JSON):
 *   { "postId": "...", "tipo": "...", "publishedAt": "DD/MM/YYYY HH:mm BRT" }
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '.env') });

// Credenciais via .env
const IG_ACCOUNT    = process.env.IG_ACCOUNT_ID;
const IG_TOKEN      = process.env.IG_ACCESS_TOKEN;
const TR_KEY        = process.env.TRELLO_KEY;
const TR_TOKEN      = process.env.TRELLO_TOKEN;
const TR_PUBLICADOS = process.env.TRELLO_LIST_PUBLICADOS;

const BASE = 'https://graph.facebook.com/v22.0';

// ── Helpers ──────────────────────────────────────────────────────────────────

async function igPost(endpoint, body) {
  const r = await fetch(`${BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, access_token: IG_TOKEN }),
  });
  return r.json();
}

async function trelloMove(cardId, listId) {
  const r = await fetch(
    `https://api.trello.com/1/cards/${cardId}?key=${TR_KEY}&token=${TR_TOKEN}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idList: listId, pos: 'top' }),
    }
  );
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`trelloMove falhou (${r.status}): ${txt}`);
  }
}

async function trelloComment(cardId, text) {
  const bytes = Buffer.from(JSON.stringify({ text }), 'utf-8');
  const r = await fetch(
    `https://api.trello.com/1/cards/${cardId}/actions/comments?key=${TR_KEY}&token=${TR_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: bytes,
    }
  );
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`trelloComment falhou (${r.status}): ${txt}`);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

if (!process.argv[2]) {
  console.error('Uso: node agendar-instagram.js \'{"cardId":"...","tipo":"xpost",...}\' OU node agendar-instagram.js payload.json');
  process.exit(1);
}

// Aceita JSON inline ou caminho de arquivo (strip BOM do Windows)
const rawArg  = process.argv[2].trim();
const rawJson = (rawArg.startsWith('{') ? rawArg : readFileSync(rawArg, 'utf8')).replace(/^﻿/, '');
const { cardId, tipo, imageUrls, caption } = JSON.parse(rawJson);

let creationId;

// Reel nativo: tipo "reel" OU vídeo único (.mp4). Vai pra aba Reels (alcance maior).
const isReel =
  tipo === 'reel' ||
  (imageUrls.length === 1 && imageUrls[0].toLowerCase().endsWith('.mp4'));

if (isReel) {
  // ── Reel nativo (vídeo vertical 9:16) ──────────────────────────────────────
  const d = await igPost(`${IG_ACCOUNT}/media`, {
    media_type: 'REELS',
    video_url: imageUrls[0],
    caption,
  });
  if (!d.id) throw new Error(`Container Reel falhou: ${JSON.stringify(d)}`);
  creationId = d.id;

} else if (imageUrls.length === 1) {
  // ── Single image ─────────────────────────────────────────────────────────
  const d = await igPost(`${IG_ACCOUNT}/media`, {
    image_url: imageUrls[0],
    caption,
  });
  if (!d.id) throw new Error(`Container imagem única falhou: ${JSON.stringify(d)}`);
  creationId = d.id;

} else {
  // ── Carousel (xpost ou carousel com múltiplos slides) ────────────────────
  // 1. Container para cada item — imagem ou vídeo (slide 10)
  const containerIds = [];
  for (const url of imageUrls.slice(0, 10)) {
    const isVideo = url.endsWith('.mp4');
    const body = isVideo
      ? { video_url: url, media_type: 'VIDEO', is_carousel_item: true }
      : { image_url: url, is_carousel_item: true };
    const d = await igPost(`${IG_ACCOUNT}/media`, body);
    if (!d.id) throw new Error(`Item carousel falhou (${url}): ${JSON.stringify(d)}`);
    // Vídeos precisam de polling individual antes de compor o carousel
    if (isVideo) {
      for (let attempt = 0; attempt < 20; attempt++) {
        const r = await fetch(`https://graph.facebook.com/v22.0/${d.id}?fields=status_code&access_token=${IG_TOKEN}`);
        const s = await r.json();
        process.stderr.write(`  Vídeo ${d.id} status: ${s.status_code} (tentativa ${attempt + 1})\n`);
        if (s.status_code === 'FINISHED') break;
        if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') throw new Error(`Vídeo container ${d.id}: ${s.status_code}`);
        await new Promise(res => setTimeout(res, 5000));
      }
    }
    containerIds.push(d.id);
  }

  // 2. Container carousel
  const carD = await igPost(`${IG_ACCOUNT}/media`, {
    media_type: 'CAROUSEL',
    children:   containerIds,
    caption,
  });
  if (!carD.id) throw new Error(`Carousel container falhou: ${JSON.stringify(carD)}`);
  creationId = carD.id;
}

// ── Aguardar container ficar pronto (polling até FINISHED) ───────────────────
async function aguardarContainer(id, maxTentativas = 20, intervaloMs = 5000) {
  for (let i = 0; i < maxTentativas; i++) {
    const r = await fetch(`${BASE}/${id}?fields=status_code&access_token=${IG_TOKEN}`);
    const d = await r.json();
    const status = d.status_code;
    process.stderr.write(`Container ${id} status: ${status} (tentativa ${i + 1})\n`);
    if (status === 'FINISHED') return;
    if (status === 'ERROR' || status === 'EXPIRED') {
      throw new Error(`Container ${id} com status inválido: ${status}`);
    }
    await new Promise(res => setTimeout(res, intervaloMs));
  }
  throw new Error(`Container ${id} não ficou pronto após ${maxTentativas} tentativas`);
}

await aguardarContainer(creationId);

// ── Publicar agora ───────────────────────────────────────────────────────────
const pubD = await igPost(`${IG_ACCOUNT}/media_publish`, { creation_id: creationId });
if (!pubD.id) throw new Error(`media_publish falhou: ${JSON.stringify(pubD)}`);

const publishedAt = new Date().toLocaleString('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});

// ── Atualizar Trello ─────────────────────────────────────────────────────────
if (cardId && TR_KEY && TR_TOKEN) {
  if (TR_PUBLICADOS) await trelloMove(cardId, TR_PUBLICADOS);
  await trelloComment(cardId, `✅ Publicado: ${publishedAt} BRT · Post ID: ${pubD.id}`);
}

// ── Output ───────────────────────────────────────────────────────────────────
console.log(JSON.stringify({ postId: pubD.id, tipo, publishedAt }));
