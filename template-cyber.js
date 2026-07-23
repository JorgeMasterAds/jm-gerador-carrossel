/**
 * template-cyber.js  [SKIN: cyber]
 * BG #050A0E · Neon configurável (brand.config.json) · Cyan/Purple fixos (parte do conceito) · Space Mono + Inter
 * Terminal aesthetic — grid overlay — scan lines — bracket notation
 */

import { getBrandConfig } from './lib/brand-config.js';
import { rgba } from './lib/color-utils.js';

export function gerarHTMLSlide({ titulo, corpo, tipo, numeracao, total, ctaBtn = 'Link na bio · Preencha o formulário', brand = 'jm-ads', imagem = null, label = null, keyword = null }) {
  const isGancho  = tipo === 'gancho';
  const isCTA     = tipo === 'cta';
  const isImpacto = tipo === 'impacto';
  const showProfile = true; // profile bar em todos os slides

  const cfg  = getBrandConfig();
  const prof = { name: cfg.perfil.nome, handle: cfg.perfil.handle, avatar: cfg.perfil.avatar };
  const NEON = cfg.cores.cyber;
  const sysTag = (prof.handle || '@brand').replace('@', '').replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase();
  // Processa **bold** inline → destaque de cor da marca (sem glow — elegância)
  const bold = t => t.replace(/\*\*(.*?)\*\*/g, `<mark style="background:${rgba(NEON,0.15)};color:${NEON};font-weight:700;padding:2px 7px;border-radius:3px;font-style:normal;text-shadow:0 0 14px ${rgba(NEON,0.55)};box-shadow:inset 0 0 0 1px ${rgba(NEON,0.30)};box-decoration-break:clone;-webkit-box-decoration-break:clone;">$1</mark>`);
  const corpoParts = (corpo || '').split('\n').filter(Boolean);

  const BG     = '#03070A';
  const CYAN   = '#00E5FF';
  const PURPLE = '#7B2FFF';
  const INK    = '#EAF6F6';
  const INK50  = 'rgba(234,246,246,0.52)';
  const INK15  = 'rgba(234,246,246,0.08)';
  // Matrix rain — colunas de caracteres faint no fundo (estático, baixa opacidade)
  const mrChars = 'アイウエカキクサシ01ABCDEF<>{}/#$%░▒▓0110';
  const matrixCol = (left, op, color) => {
    let s = '';
    for (let i = 0; i < 26; i++) s += mrChars[Math.floor(Math.random() * mrChars.length)] + '<br>';
    return `<div style="position:absolute;top:-20px;left:${left}px;font-family:'Space Mono',monospace;font-size:28px;line-height:1.3;color:${color};opacity:${op};text-align:center;pointer-events:none;user-select:none;">${s}</div>`;
  };
  const matrixRain = [
    matrixCol(110, 0.06, NEON), matrixCol(400, 0.045, CYAN),
    matrixCol(720, 0.06, NEON), matrixCol(975, 0.045, CYAN),
  ].join('');

  function splitTitulo(t) {
    const m = t.match(/^([\s\S]*?)\*\*([\s\S]+?)\*\*([\s\S]*)$/);
    if (m) {
      let before = m[1].trim();
      let after = m[2].trim();
      let suffix = m[3].trim();
      if (/^[.,!?:;]+$/.test(suffix)) { after += suffix; suffix = ''; }
      // Separa a última frase do before para linha própria
      const lastMatch = before.match(/^([\s\S]+[.!?:])\s+(\S[\s\S]*)$/);
      const beforeLast = lastMatch ? lastMatch[2] : '';
      if (lastMatch) before = lastMatch[1];
      return { before, beforeLast, after, suffix };
    }
    const words = t.trim().split(/\s+/);
    if (words.length <= 1) return { before: '', beforeLast: '', after: t, suffix: '' };
    const lastCount = words[words.length - 1].length <= 4 && words.length > 2 ? 2 : 1;
    return { before: words.slice(0, -lastCount).join(' '), beforeLast: '', after: words.slice(-lastCount).join(' '), suffix: '' };
  }

  const slideNum   = isGancho ? '01' : isCTA ? String(total).padStart(2,'0') : String(numeracao + 1).padStart(2,'0');
  const slideTotal = String(total).padStart(2,'0');

  const verified = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;">
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" fill="#1D9BF0"/>
    <path d="m9 12 2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  const profileBar = `
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:20px;">
        <div style="width:80px;height:80px;border-radius:50%;flex-shrink:0;overflow:hidden;
             border:2px solid ${NEON};">
          <img src="${prof.avatar}"
               style="width:100%;height:100%;object-fit:cover;object-position:center top;" />
        </div>
        <div>
          <div style="display:flex;align-items:center;gap:9px;margin-bottom:5px;">
            <span style="font-family:'Space Mono',monospace;font-size:22px;font-weight:700;color:${INK};">${prof.name}</span>
            ${verified}
          </div>
          <span style="font-family:'Space Mono',monospace;font-size:26px;font-weight:700;color:${NEON};opacity:0.90;">${prof.handle}</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:4px;">
        <span style="font-family:'Space Mono',monospace;font-size:16px;color:${CYAN};opacity:0.5;">[</span>
        <span style="font-family:'Space Mono',monospace;font-size:36px;font-weight:700;color:${NEON};line-height:1;text-shadow:0 0 14px ${rgba(NEON,0.7)};">${slideNum}</span>
        <span style="font-family:'Space Mono',monospace;font-size:16px;color:${CYAN};opacity:0.7;">/${slideTotal}</span>
        <span style="font-family:'Space Mono',monospace;font-size:16px;color:${CYAN};opacity:0.5;">]</span>
      </div>
    </div>
  `;

  const swipeArrow = !isCTA ? `
    <div style="position:absolute;right:16px;top:50%;transform:translateY(-50%);
         width:84px;height:84px;border-radius:50%;
         background:${rgba(NEON,0.06)};border:1px solid ${rgba(NEON,0.25)};
         display:flex;align-items:center;justify-content:center;z-index:10;">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <path d="M9 18l6-6-6-6" stroke="${NEON}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>` : '';

  let conteudo = '';

  // Escalonamento de fonte para bullets
  function bodyFontSize(parts, maxH = 620, maxW = 860) {
    for (const fs of [44, 40, 36, 32, 28]) {
      const ratio  = 0.50;
      const lineH  = 1.50;
      const padV   = 44;
      let h = 0;
      for (const p of parts) {
        const clean = p.replace(/\*\*/g, '').replace(/^[\p{Extended_Pictographic}\u{FE0F}\u{200D}]+\s*/u, '');
        const cpl   = Math.max(1, Math.floor(maxW / (fs * ratio)));
        const lines = Math.ceil(Math.max(clean.length, 1) / cpl);
        h += Math.max(1, lines) * fs * lineH + padV;
      }
      if (h <= maxH) return fs;
    }
    return 28;
  }

  // Binary search cyber — cobre TODOS os blocos de texto do h1:
  // before + beforeLast (passados concatenados) + after (Playfair 1.25em) + suffix inline
  // maxH=560 = max-height real do h1; after ocupa 1.25× a linha base
  function ganchoFontSize(fullBeforeTxt, afterSuffixTxt, maxH = 560, maxW = 940, ratio = 0.58) {
    const lenFull = fullBeforeTxt.replace(/\*\*/g, '').trim().length;
    const lenAfterSuffix = afterSuffixTxt.replace(/\*\*/g, '').trim().length;
    const target = maxH * 0.78;
    let lo = 36, hi = 120, best = lo;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const cpl = Math.floor(maxW / (mid * ratio));
      const linesBefore = lenFull > 0 ? Math.ceil(lenFull / Math.max(cpl, 1)) : 0;
      // after em Playfair 1.25em — linha ocupa 1.25× a altura base
      const linesAfterSuffix = lenAfterSuffix > 0 ? Math.ceil(lenAfterSuffix / Math.max(cpl, 1)) : 1;
      const h = linesBefore * mid + linesAfterSuffix * mid * 1.25;
      if (h <= target) { best = mid; lo = mid + 1; }
      else hi = mid - 1;
    }
    return best;
  }

  const showBadge = !isGancho && !isCTA && !isImpacto && keyword;
  const badgeHtml = showBadge ? `
    <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:18px;">
      <div style="width:28px;height:2px;background:${NEON};border-radius:1px;flex-shrink:0;"></div>
      <span style="font-family:'Space Mono',monospace;font-size:20px;font-weight:700;
           color:${NEON};letter-spacing:2px;text-transform:uppercase;">${label || keyword}</span>
    </div>` : '';

  const dotIdx = isGancho ? 0 : isCTA ? total - 1 : numeracao;
  const progressBar = !isImpacto ? `
    <div style="position:absolute;bottom:34px;left:80px;right:80px;
         display:flex;align-items:center;justify-content:space-between;z-index:4;">
      <div style="display:flex;align-items:center;gap:5px;">
        ${Array.from({length: total}, (_, i) => `<div style="height:8px;border-radius:4px;
          width:${i === dotIdx ? 36 : 10}px;
          background:${i === dotIdx ? NEON : rgba(NEON,0.20)};"></div>`).join('')}
      </div>
      <span style="font-family:'Space Mono',monospace;font-size:21px;font-weight:700;
           color:${rgba(NEON,0.50)};letter-spacing:1px;">${slideNum}/${slideTotal}</span>
    </div>` : '';

  if (isGancho) {
    const { before, beforeLast, after, suffix } = splitTitulo(titulo);
    // fullBefore = before + beforeLast para calcular font size considerando todas as linhas
    const fullBefore = [before, beforeLast].filter(Boolean).join(' ');
    const afterSuffix = [after, suffix].filter(Boolean).join(' ');
    const fs = ganchoFontSize(fullBefore, afterSuffix);
    conteudo = `
      <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:32px;">
        <span style="font-family:'Space Mono',monospace;font-size:13px;font-weight:700;
              color:${NEON};letter-spacing:2px;text-shadow:0 0 12px ${rgba(NEON,0.7)};">▶ INICIANDO_PROTOCOLO</span>
        <div style="width:40px;height:1px;background:linear-gradient(90deg,${NEON},${CYAN});opacity:0.7;"></div>
        <span style="font-family:'Space Mono',monospace;font-size:13px;font-weight:700;color:${CYAN};letter-spacing:2px;opacity:0.8;text-shadow:0 0 10px rgba(0,229,255,0.6);">_SYS.OK</span>
      </div>
      <h1 style="font-family:'Inter',sans-serif;font-size:${fs}px;font-weight:900;
           line-height:1.0;color:${INK};margin:0 0 32px;letter-spacing:${fs > 74 ? '-4' : '-2'}px;max-width:940px;max-height:560px;overflow:hidden;">
        ${before}${before ? '<br>' : ''}${beforeLast ? `${beforeLast}<br>` : ''}
        <span style="font-family:'Playfair Display',Georgia,serif;font-size:1.25em;font-weight:700;
              color:${NEON};font-style:italic;text-shadow:0 0 28px ${rgba(NEON,0.5)};">${after}</span>${suffix ? ` ${bold(suffix)}` : ''}
      </h1>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px;">
        <div style="height:1px;width:48px;background:${CYAN};opacity:0.6;box-shadow:0 0 8px rgba(0,229,255,0.5);"></div>
        <span style="font-family:'Space Mono',monospace;font-size:12px;color:${CYAN};opacity:0.7;letter-spacing:1px;">// CONTINUE_READING</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:18px;max-width:860px;">
        ${corpoParts.length > 0
          ? corpoParts.map(p=>`
            <div style="display:flex;align-items:flex-start;gap:14px;">
              <span style="font-family:'Space Mono',monospace;font-size:18px;color:${NEON};flex-shrink:0;line-height:1.7;
                    ">›</span>
              <p style="font-family:'Inter',sans-serif;font-size:44px;line-height:1.5;color:${INK50};margin:0;">${bold(p)}</p>
            </div>`).join('')
          : `<p style="font-family:'Inter',sans-serif;font-size:44px;line-height:1.5;color:${INK50};margin:0;">Deslize para ver como funciona →</p>`
        }
      </div>
    `;

  } else if (isCTA) {
    const { before, after, suffix } = splitTitulo(titulo);
    conteudo = `
      <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:32px;">
        <span style="font-family:'Space Mono',monospace;font-size:13px;font-weight:700;
              color:${NEON};letter-spacing:2px;text-shadow:0 0 12px ${rgba(NEON,0.7)};">▶ PRÓXIMO_PASSO</span>
        <div style="width:40px;height:1px;background:linear-gradient(90deg,${NEON},${CYAN});opacity:0.7;"></div>
      </div>
      <h2 style="font-family:'Inter',sans-serif;font-size:86px;font-weight:900;
           line-height:1.0;color:${INK};margin:0 0 24px;letter-spacing:-3.5px;max-width:940px;">
        ${before}${before ? '<br>' : ''}
        <span style="font-family:'Playfair Display',Georgia,serif;font-size:1.25em;font-weight:700;
              color:${NEON};font-style:italic;text-shadow:0 0 28px ${rgba(NEON,0.5)};">${after}</span>${suffix ? ` ${bold(suffix)}` : ''}
      </h2>
      <p style="font-family:'Inter','Segoe UI Emoji','Apple Color Emoji',sans-serif;font-size:44px;line-height:1.55;color:${INK50};margin:0 0 48px;max-width:820px;">
        👉 ${bold(corpoParts.join(' ').replace(/[\p{Extended_Pictographic}️‍]+\s*/gu, '').replace(/\s+/g, ' ').trim())}
      </p>
      <div style="display:inline-flex;align-items:center;gap:16px;
           border:1.5px solid ${NEON};padding:22px 48px;border-radius:6px;
           box-shadow:0 0 24px ${rgba(NEON,0.35)},inset 0 0 18px ${rgba(NEON,0.08)};">
        <span style="font-family:'Space Mono',monospace;font-size:36px;font-weight:700;
              color:${NEON};text-shadow:0 0 12px ${rgba(NEON,0.6)};">${ctaBtn}</span>
        <span style="font-size:36px;color:${CYAN};text-shadow:0 0 12px rgba(0,229,255,0.6);">→</span>
      </div>
      <div style="margin-top:32px;font-family:'Space Mono',monospace;font-size:22px;color:${INK50};">${prof.handle}</div>
    `;

  } else if (isImpacto) {
    // Corpo em NEON; destaque **bold** em BRANCO para contraste (texto pink → palavra branca)
    const boldWhite = t => t.replace(/\*\*(.*?)\*\*/g, '<mark style="background:rgba(255,255,255,0.08);color:#FFFFFF;font-weight:800;padding:2px 8px;border-radius:4px;font-style:normal;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.32);box-decoration-break:clone;-webkit-box-decoration-break:clone;">$1</mark>');
    conteudo = `
      <div style="display:flex;align-items:center;height:1150px;">
        <p style="font-family:'Inter',sans-serif;font-size:76px;font-weight:700;
             line-height:1.20;color:${NEON};letter-spacing:-2px;max-width:900px;">
          ${boldWhite(titulo)}
        </p>
      </div>
    `;

  } else if (imagem) {
    conteudo = `
      ${badgeHtml}
      <h2 style="font-family:'Inter',sans-serif;font-size:50px;font-weight:900;
           line-height:1.05;color:${INK};margin:0 0 18px;letter-spacing:-2px;max-width:940px;">
        ${bold(titulo)}
      </h2>
      <div style="border-radius:20px;overflow:hidden;border:1px solid ${rgba(NEON,0.22)};
           max-height:490px;display:flex;align-items:center;justify-content:center;
           background:${rgba(NEON,0.04)};box-shadow:0 6px 32px ${rgba(NEON,0.10)};">
        <img src="${imagem}" style="width:100%;max-height:490px;object-fit:contain;display:block;" />
      </div>
      ${corpoParts.slice(0,2).map(p=>`
        <p style="font-family:'Inter',sans-serif;font-size:21px;line-height:1.5;
             color:${INK50};margin:14px 0 0;max-width:920px;">${bold(p)}</p>`).join('')}
    `;
  } else {
    const { before, after, suffix } = splitTitulo(titulo);
    conteudo = `
      ${badgeHtml}
      <h2 style="font-family:'Inter',sans-serif;font-size:76px;font-weight:900;
           line-height:1.0;color:${INK};margin:0 0 20px;letter-spacing:-3px;max-width:940px;">
        ${before}${before ? '<br>' : ''}
        <span style="font-family:'Playfair Display',Georgia,serif;font-size:1.25em;font-weight:700;
              color:${NEON};font-style:italic;">${after}</span>${suffix ? ` ${bold(suffix)}` : ''}
      </h2>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
        <div style="height:1px;width:32px;background:${NEON};opacity:0.6;flex-shrink:0;"></div>
        <div style="height:1px;flex:1;background:${INK15};"></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;max-width:920px;">
        ${(()=>{ const bfs = bodyFontSize(corpoParts); return corpoParts.map((p,i)=>{
          const txt = bold(p.replace(/^[\p{Extended_Pictographic}\u{FE0F}\u{200D}]+\s*/u, ''));
          const marker = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;margin-top:${Math.max(4,Math.round(bfs*0.18))}px;"><path d="M9 6l6 6-6 6" stroke="${NEON}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
          return `
          <div style="display:flex;align-items:flex-start;gap:16px;
               background:${rgba(NEON,0.05)};border-left:2px solid ${NEON};
               border-radius:0 8px 8px 0;padding:14px 20px;">
            ${marker}
            <p style="font-family:'Inter',sans-serif;font-size:${bfs}px;line-height:1.5;color:rgba(245,238,238,0.82);margin:0;">${txt}</p>
          </div>`; }).join(''); })()}
      </div>
    `;
  }

  return `<!DOCTYPE html><html spellcheck="false"><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0;text-decoration:none;}
  body{width:1080px;height:1350px;overflow:hidden;background:${BG};display:flex;align-items:center;justify-content:center;}
  .slide{width:1080px;height:1350px;padding:60px 80px 80px;display:flex;flex-direction:column;
         justify-content:center;position:relative;overflow:hidden;background:${BG};}
  /* Glow ambient — orbs neon vermelho + cyan dão profundidade cyberpunk */
  .ambient{position:absolute;inset:0;pointer-events:none;
    background:
      radial-gradient(620px 620px at 88% 12%, ${rgba(NEON,0.12)}, transparent 60%),
      radial-gradient(560px 560px at 6% 92%, rgba(0,229,255,0.09), transparent 60%),
      radial-gradient(900px 900px at 50% 50%, rgba(123,47,255,0.04), transparent 70%);}
  /* Grid tech — linhas finas neon, denso, estilo HUD/matrix */
  .grid{position:absolute;inset:0;pointer-events:none;opacity:0.55;
    background-image:
      linear-gradient(rgba(0,229,255,0.05) 1px, transparent 1px),
      linear-gradient(90deg, ${rgba(NEON,0.05)} 1px, transparent 1px);
    background-size:54px 54px;
    mask-image:radial-gradient(circle at 50% 45%, #000 55%, transparent 92%);
    -webkit-mask-image:radial-gradient(circle at 50% 45%, #000 55%, transparent 92%);}
  /* Scanlines — CRT/cyberpunk */
  .scan{position:absolute;inset:0;pointer-events:none;opacity:0.5;
    background:repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 3px, rgba(0,0,0,0.14) 3px, rgba(0,0,0,0.14) 4px);}
  /* Matrix rain layer */
  .matrix{position:absolute;inset:0;pointer-events:none;overflow:hidden;}
  /* HUD corners — cantos com ticks + coordenadas mono */
  .hud{position:absolute;font-family:'Space Mono',monospace;font-size:13px;letter-spacing:1px;pointer-events:none;}
  .corner-tl{position:absolute;top:24px;left:24px;width:38px;height:38px;
    border-top:1.5px solid rgba(0,229,255,0.55);border-left:1.5px solid rgba(0,229,255,0.55);box-shadow:-2px -2px 14px rgba(0,229,255,0.18);}
  .corner-br{position:absolute;bottom:24px;right:24px;width:38px;height:38px;
    border-bottom:1.5px solid ${rgba(NEON,0.55)};border-right:1.5px solid ${rgba(NEON,0.55)};box-shadow:2px 2px 14px ${rgba(NEON,0.20)};}
  .bg-num{position:absolute;right:56px;bottom:64px;font-family:'Space Mono',monospace;
    font-size:230px;font-weight:700;color:transparent;-webkit-text-stroke:1.5px ${rgba(NEON,0.07)};line-height:1;
    pointer-events:none;user-select:none;}
  .pb{position:absolute;top:60px;left:80px;right:80px;z-index:3;}
  .c{position:relative;z-index:1;padding-top:124px;}
</style></head><body spellcheck="false">
<div class="slide">
  <div class="ambient"></div>
  <div class="grid"></div>
  <div class="matrix">${matrixRain}</div>
  <div class="scan"></div>
  <div class="corner-tl"></div>
  <div class="corner-br"></div>
  <span class="hud" style="top:34px;left:70px;color:rgba(0,229,255,0.42);">SYS://${sysTag} · 0x${slideNum}F</span>
  ${isImpacto?`<span class="hud" style="bottom:34px;right:70px;color:${rgba(NEON,0.40)};">[ ENC: AES-256 · OK ]</span>`:''}
  ${!isGancho&&!isCTA?`<div class="bg-num">${slideNum}</div>`:''}
  ${showProfile ? `<div class="pb">${profileBar}</div>` : ''}
  <div class="c" style="padding-top:${showProfile ? '124' : '44'}px;">${conteudo}</div>
  ${swipeArrow}
  ${progressBar}
</div></body></html>`;
}

