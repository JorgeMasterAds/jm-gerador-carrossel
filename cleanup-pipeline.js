/**
 * cleanup-pipeline.js — JM Ads Pipeline
 *
 * Garante que Supabase e Trello estejam sempre com os dados mais recentes:
 *
 * 1. Supabase — apaga TODOS os arquivos do card (por prefixo) antes do upload
 * 2. Trello   — apaga comentários ARTE_GERADA antigos (mantém só o mais recente)
 * 3. Trello   — apaga attachments antigos antes de adicionar novos
 *
 * Uso direto (auditoria/limpeza manual):
 *   node cleanup-pipeline.js              → busca TODOS os cards ativos do board Trello e limpa orphans
 *   node cleanup-pipeline.js --card jm-c18  → limpa só um card
 *
 * IMPORTANTE: o audit Supabase usa os cards do board Trello (todas as colunas), não cards-aprovados.json.
 * Isso protege Arte aprovada e outros cards que não estão no lote atual.
 *
 * Uso programático (importar em outros scripts):
 *   import { supabaseDeleteByPrefix, trelloCleanComments } from './cleanup-pipeline.js'
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE;
const TRELLO_KEY   = process.env.TRELLO_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const BUCKET = process.env.SUPABASE_BUCKET || 'criativos';
const BASE_SUPA  = `${SUPABASE_URL}/storage/v1`;
const BASE_TRELLO = 'https://api.trello.com/1';

// ── helpers ───────────────────────────────────────────────────────────────────

function trelloUrl(p) {
  return `${BASE_TRELLO}${p}?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`;
}

async function trelloGet(p) {
  const r = await fetch(trelloUrl(p));
  if (!r.ok) throw new Error(`Trello GET ${p}: ${r.status}`);
  return r.json();
}

async function trelloDelete(p) {
  const r = await fetch(trelloUrl(p), { method: 'DELETE' });
  if (!r.ok) throw new Error(`Trello DELETE ${p}: ${r.status}`);
}

// ── 1. Supabase: apaga arquivos por prefixo de card ───────────────────────────

export async function supabaseDeleteByPrefix(cardCod) {
  const listBody = JSON.stringify({ prefix: cardCod + '_', limit: 200, offset: 0 });
  const r = await fetch(`${BASE_SUPA}/object/list/${BUCKET}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
    body: listBody,
  });
  if (!r.ok) { console.warn(`  ⚠️  Supabase list falhou para ${cardCod}: ${r.status}`); return 0; }
  const files = await r.json();
  if (!files || files.length === 0) return 0;

  const names = files.map(f => f.name);
  const deleteBody = JSON.stringify({ prefixes: names });
  const d = await fetch(`${BASE_SUPA}/object/${BUCKET}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
    body: deleteBody,
  });
  if (!d.ok) { console.warn(`  ⚠️  Supabase delete falhou para ${cardCod}: ${d.status}`); return 0; }
  console.log(`  🗑️  Supabase: ${names.length} arquivo(s) antigos de ${cardCod} deletados`);
  return names.length;
}

// ── 2. Trello: apaga comentários ARTE_GERADA antigos (mantém só o mais recente) ─

export async function trelloCleanComments(trelloCardId) {
  const actions = await trelloGet(`/cards/${trelloCardId}/actions?filter=commentCard`);
  const arteComments = (actions || [])
    .filter(a => a.data?.text?.includes('ARTE_GERADA'))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (arteComments.length <= 1) return; // nada a limpar

  // Apaga todos menos o mais recente
  for (let i = 1; i < arteComments.length; i++) {
    await trelloDelete(`/actions/${arteComments[i].id}`);
    console.log(`  🗑️  Trello: comentário ARTE_GERADA antigo deletado (${arteComments[i].date})`);
  }
}

// ── 3. Trello: apaga todos os attachments do card ─────────────────────────────

export async function trelloDeleteAttachments(trelloCardId) {
  const attachments = await trelloGet(`/cards/${trelloCardId}/attachments`);
  if (!attachments || attachments.length === 0) return 0;
  for (const a of attachments) {
    await trelloDelete(`/cards/${trelloCardId}/attachments/${a.id}`);
  }
  console.log(`  🗑️  Trello: ${attachments.length} attachments antigos deletados`);
  return attachments.length;
}

// ── 4. Supabase: apaga arquivos ORPHAN (cards não ativos) e slide11 ───────────

export async function supabaseFullAudit(activeCods) {
  const listBody = JSON.stringify({ prefix: '', limit: 500, offset: 0 });
  const r = await fetch(`${BASE_SUPA}/object/list/${BUCKET}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
    body: listBody,
  });
  const files = await r.json();
  const toDelete = [];

  for (const file of (files || [])) {
    const name = file.name;
    const cardPrefix = name.split('_')[0]; // jm-c15
    if (!activeCods.includes(cardPrefix)) {
      toDelete.push(name); // orphan
    } else if (/_slide1[1-9]\.(png|mp4)$/.test(name)) {
      toDelete.push(name); // slide11+ (resquício de bug antigo)
    }
  }

  if (toDelete.length === 0) {
    console.log('  ✅ Supabase limpo — nenhum arquivo obsoleto');
    return 0;
  }

  const deleteBody = JSON.stringify({ prefixes: toDelete });
  await fetch(`${BASE_SUPA}/object/${BUCKET}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
    body: deleteBody,
  });
  console.log(`  🗑️  Supabase: ${toDelete.length} arquivo(s) obsoletos deletados`);
  return toDelete.length;
}

// ── CLI (execução direta) ─────────────────────────────────────────────────────

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // Busca TODOS os cards ativos do board (não só o lote atual)
  // Isso garante que Arte aprovada e outros cards não sejam apagados por engano
  const BOARD_ID = process.env.TRELLO_BOARD_ID;
  const CARD_PREFIX = process.env.CARD_PREFIX || 'jm-';
  const boardCardsUrl = `${BASE_TRELLO}/boards/${BOARD_ID}/cards?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}&fields=id,name&filter=open`;
  const boardCards = await fetch(boardCardsUrl).then(r => r.json());

  // Extrai CODs de TODOS os cards ativos (ex: "C43 — titulo" → "{prefixo}c43")
  const activeCods = boardCards
    .map(c => {
      const m = c.name.match(/^([CV])(\d+)/i);
      return m ? `${CARD_PREFIX}${m[1].toLowerCase()}${m[2]}` : null;
    })
    .filter(Boolean);

  const cardFilter = process.argv.includes('--card')
    ? process.argv[process.argv.indexOf('--card') + 1]
    : null;

  // Targets para limpeza de comentários duplicados
  const targets = boardCards
    .map(c => {
      const m = c.name.match(/^([CV])(\d+)/i);
      const cod = m ? `${CARD_PREFIX}${m[1].toLowerCase()}${m[2]}` : null;
      return { cod, trelloId: c.id };
    })
    .filter(t => t.cod && (!cardFilter || t.cod === cardFilter));

  console.log(`\n🧹 Cleanup pipeline — ${cardFilter || 'todos os cards'}\n`);

  // Supabase audit geral (orphans + slide11)
  console.log('📦 Supabase — auditoria geral...');
  await supabaseFullAudit(activeCods);

  // Por card: limpar comentários duplicados no Trello
  console.log('\n💬 Trello — limpeza de comentários ARTE_GERADA duplicados...');
  for (const card of targets) {
    if (!card.trelloId) continue;
    process.stdout.write(`  ${card.cod}: `);
    const actions = await fetch(trelloUrl(`/cards/${card.trelloId}/actions?filter=commentCard`))
      .then(r => r.json());
    const arteComments = (actions || [])
      .filter(a => a.data?.text?.includes('ARTE_GERADA'))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (arteComments.length <= 1) {
      console.log(`OK (${arteComments.length} comentário)`);
    } else {
      for (let i = 1; i < arteComments.length; i++) {
        await fetch(trelloUrl(`/actions/${arteComments[i].id}`), { method: 'DELETE' });
      }
      console.log(`${arteComments.length - 1} duplicados removidos → manteve mais recente`);
    }
  }

  console.log('\n✅ Cleanup concluído\n');
}
