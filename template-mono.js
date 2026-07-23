/**
 * template-mono.js  [SKIN: mono]
 * Preto #000000 · Branco #F5F5F5 · Accent configurável (brand.config.json) · Inter + Caveat
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
  const ACC   = cfg.cores.mono;
  // Processa **bold** inline → destaque de cor da marca
  const bold = t => t.replace(/\*\*(.*?)\*\*/g, `<mark style="background:${ACC};color:#fff;font-weight:900;padding:2px 8px;border-radius:3px;font-style:normal;box-decoration-break:clone;-webkit-box-decoration-break:clone;">$1</mark>`);
  const corpoParts = (corpo || '').split('\n').filter(Boolean);

  const BG    = '#000000';
  const INK   = '#F5F5F5';
  const INK60 = 'rgba(245,245,245,0.60)';
  const INK12 = 'rgba(245,245,245,0.08)';

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
        <div style="width:80px;height:80px;border-radius:50%;flex-shrink:0;overflow:hidden;box-shadow:0 0 0 3px ${ACC};">
          <img src="${prof.avatar}"
               style="width:100%;height:100%;object-fit:cover;object-position:center top;" />
        </div>
        <div>
          <div style="display:flex;align-items:center;gap:9px;margin-bottom:5px;">
            <span style="font-family:'Inter',sans-serif;font-size:26px;font-weight:800;color:${INK};">${prof.name}</span>
            ${verified}
          </div>
          <span style="font-family:'Inter',sans-serif;font-size:30px;font-weight:600;color:${INK60};">${prof.handle}</span>
        </div>
      </div>
      <div style="display:flex;align-items:baseline;gap:2px;">
        <span style="font-family:'Inter',sans-serif;font-size:42px;font-weight:900;color:${INK};line-height:1;">${slideNum}</span>
        <span style="font-family:'Inter',sans-serif;font-size:18px;color:${INK60};">/${slideTotal}</span>
      </div>
    </div>
  `;

  const chartDeco = `
    <svg style="position:absolute;right:72px;bottom:90px;opacity:0.07;pointer-events:none;"
         width="160" height="80" viewBox="0 0 160 80">
      <rect x="0"   y="55" width="22" height="25" fill="${ACC}" rx="3"/>
      <rect x="27"  y="30" width="22" height="50" fill="${ACC}" rx="3"/>
      <rect x="54"  y="42" width="22" height="38" fill="${ACC}" rx="3"/>
      <rect x="81"  y="12" width="22" height="68" fill="${ACC}" rx="3"/>
      <rect x="108" y="22" width="22" height="58" fill="${ACC}" rx="3"/>
      <rect x="135" y="38" width="22" height="42" fill="${ACC}" rx="3"/>
    </svg>`;

  const swipeArrow = !isCTA ? `
    <div style="position:absolute;right:16px;top:50%;transform:translateY(-50%);
         width:84px;height:84px;border-radius:50%;
         background:${INK12};
         display:flex;align-items:center;justify-content:center;z-index:10;">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <path d="M9 18l6-6-6-6" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>` : '';

  let conteudo = '';

  // Escalonamento de fonte para bullets
  function bodyFontSize(parts, maxH = 640, maxW = 840) {
    for (const fs of [44, 40, 36, 32, 28]) {
      const ratio  = 0.50;
      const lineH  = 1.50;
      const padV   = 48;
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

  // Binary search: maior font-size que preenche ~82% da área disponível para o H1
  // mono: padding:60px 80px, linha horizontal + H1 + corpo → maxH=620
  function ganchoFontSize(text, maxH = 620, maxW = 940, ratio = 0.58, lineH = 0.97) {
    const len = text.replace(/\*\*/g, '').trim().length;
    const target = maxH * 0.82;
    let lo = 42, hi = 120, best = lo;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const cpl = Math.floor(maxW / (mid * ratio));
      const lines = Math.ceil(len / Math.max(cpl, 1));
      if (lines * mid * lineH <= target) { best = mid; lo = mid + 1; }
      else hi = mid - 1;
    }
    return best;
  }

  const showBadge = !isGancho && !isCTA && !isImpacto && keyword;
  const badgeHtml = showBadge ? `
    <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:18px;">
      <div style="width:28px;height:2px;background:${ACC};border-radius:1px;flex-shrink:0;"></div>
      <span style="font-family:'Inter',sans-serif;font-size:20px;font-weight:800;
           color:${ACC};letter-spacing:3px;text-transform:uppercase;">${label || keyword}</span>
    </div>` : '';

  const dotIdx = isGancho ? 0 : isCTA ? total - 1 : numeracao;
  const progressBar = !isImpacto ? `
    <div style="position:absolute;bottom:34px;left:80px;right:80px;
         display:flex;align-items:center;justify-content:space-between;z-index:4;">
      <div style="display:flex;align-items:center;gap:5px;">
        ${Array.from({length: total}, (_, i) => `<div style="height:8px;border-radius:4px;
          width:${i === dotIdx ? 36 : 10}px;
          background:${i === dotIdx ? ACC : rgba(ACC,0.18)};"></div>`).join('')}
      </div>
      <span style="font-family:'Inter',sans-serif;font-size:21px;font-weight:800;
           color:${rgba(ACC,0.55)};letter-spacing:2px;">${slideNum}/${slideTotal}</span>
    </div>` : '';

  if (isImpacto) {
    const boldColor = t => t.replace(/\*\*(.*?)\*\*/g, `<span style="color:${ACC};font-weight:900;">$1</span>`);
    conteudo = `
      <div style="display:flex;align-items:center;height:1150px;">
        <p style="font-family:'Inter',sans-serif;font-size:92px;font-weight:900;
             line-height:1.25;color:${INK};letter-spacing:-5px;max-width:900px;">
          ${boldColor(titulo)}
        </p>
      </div>
    `;

  } else if (isGancho) {
    const { before, beforeLast, after, suffix } = splitTitulo(titulo);
    const fs = ganchoFontSize(titulo);
    conteudo = `
      <div style="width:100%;height:1px;background:${rgba(ACC,0.3)};margin-bottom:32px;"></div>
      <h1 style="font-family:'Inter',sans-serif;font-size:${fs}px;font-weight:900;
           line-height:0.97;color:${INK};margin:0 0 32px;letter-spacing:${fs > 82 ? '-5' : '-2'}px;max-width:940px;max-height:570px;overflow:hidden;">
        ${before}${before ? '<br>' : ''}${beforeLast ? `${beforeLast}<br>` : ''}
        <span style="font-family:'Inter',sans-serif;font-weight:900;background:${ACC};color:#fff;padding:0 16px 6px;border-radius:4px;">${after}</span>${suffix ? ' ' + suffix : ''}
      </h1>
      <div style="display:flex;flex-direction:column;gap:18px;max-width:860px;">
        ${corpoParts.length > 0
          ? corpoParts.map(p=>`<p style="font-family:'Inter',sans-serif;font-size:44px;line-height:1.5;color:${INK60};margin:0;">${bold(p)}</p>`).join('')
          : `<p style="font-family:'Inter',sans-serif;font-size:44px;line-height:1.5;color:${INK60};margin:0;">Deslize →</p>`
        }
      </div>
    `;

  } else if (isCTA) {
    const { before, after, suffix } = splitTitulo(titulo);
    conteudo = `
      <div style="width:100%;height:1px;background:${rgba(ACC,0.3)};margin-bottom:36px;"></div>
      <h2 style="font-family:'Inter',sans-serif;font-size:96px;font-weight:900;
           line-height:0.97;color:${INK};margin:0 0 28px;letter-spacing:-5px;max-width:940px;">
        ${before}${before ? '<br>' : ''}
        <span style="font-family:'Inter',sans-serif;font-weight:900;background:${ACC};color:#fff;padding:0 16px 6px;border-radius:4px;">${after}</span>${suffix ? ' ' + suffix : ''}
      </h2>
      <p style="font-family:'Inter','Segoe UI Emoji','Apple Color Emoji',sans-serif;font-size:44px;line-height:1.55;color:${INK60};margin:0 0 44px;max-width:820px;">
        👉 ${bold(corpoParts.join(' ').replace(/[\p{Extended_Pictographic}️‍]+\s*/gu, '').replace(/\s+/g, ' ').trim())}
      </p>
      <div style="display:inline-flex;align-items:center;gap:14px;border:1.5px solid ${INK};padding:20px 44px;border-radius:4px;">
        <span style="font-family:'Inter',sans-serif;font-size:36px;font-weight:700;color:${INK};">${ctaBtn}</span>
        <span style="font-size:36px;color:${ACC};">→</span>
      </div>
      <div style="margin-top:32px;font-family:'Inter',sans-serif;font-size:22px;color:${INK60};">${prof.handle}</div>
    `;

  } else if (imagem) {
    conteudo = `
      ${badgeHtml}
      <h2 style="font-family:'Inter',sans-serif;font-size:50px;font-weight:900;
           line-height:1.05;color:${INK};margin:0 0 18px;letter-spacing:-2px;max-width:940px;">
        ${bold(titulo)}
      </h2>
      <div style="border-radius:20px;overflow:hidden;border:1px solid ${rgba(ACC,0.18)};
           max-height:490px;display:flex;align-items:center;justify-content:center;
           background:${rgba(ACC,0.02)};box-shadow:0 6px 28px rgba(15,20,25,0.10);">
        <img src="${imagem}" style="width:100%;max-height:490px;object-fit:contain;display:block;" />
      </div>
      ${corpoParts.slice(0,2).map(p=>`
        <p style="font-family:'Inter',sans-serif;font-size:21px;line-height:1.5;
             color:${INK60};margin:14px 0 0;max-width:920px;">${bold(p)}</p>`).join('')}
    `;
  } else {
    const { before, after, suffix } = splitTitulo(titulo);
    conteudo = `
      ${chartDeco}
      ${badgeHtml}
      <h2 style="font-family:'Inter',sans-serif;font-size:84px;font-weight:900;
           line-height:0.97;color:${INK};margin:0 0 32px;letter-spacing:-4px;max-width:940px;">
        ${before}${before ? '<br>' : ''}
        <span style="font-family:'Inter',sans-serif;font-weight:900;font-size:1.1em;background:${ACC};color:#fff;padding:0 18px 10px;border-radius:4px;display:inline-block;margin-top:6px;">${after}</span>${suffix ? ' ' + suffix : ''}
      </h2>
      <div style="width:100%;height:1px;background:${INK12};margin-bottom:28px;"></div>
      <div style="display:flex;flex-direction:column;gap:14px;max-width:880px;">
        ${(()=>{ const bfs = bodyFontSize(corpoParts); return corpoParts.map((p,i)=>{
          const txt = bold(p.replace(/^[\p{Extended_Pictographic}\u{FE0F}\u{200D}]+\s*/u, ''));
          const marker = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;margin-top:${Math.max(4,Math.round(bfs*0.18))}px;"><path d="M9 6l6 6-6 6" stroke="${ACC}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
          return `
          <div style="display:flex;align-items:flex-start;gap:16px;">
            ${marker}
            <p style="font-family:'Inter',sans-serif;font-size:${bfs}px;line-height:1.5;color:rgba(245,245,245,0.72);margin:0;">${txt}</p>
          </div>`; }).join(''); })()}
      </div>
    `;
  }

  return `<!DOCTYPE html><html spellcheck="false"><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0;text-decoration:none;}
  body{width:1080px;height:1350px;overflow:hidden;background:#000;display:flex;align-items:center;justify-content:center;}
  .slide{width:1080px;height:1350px;padding:60px 80px 80px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;background:#000;}
  .bg-num{position:absolute;right:0;bottom:60px;font-family:'Inter',sans-serif;font-size:320px;font-weight:900;
    -webkit-text-stroke:1px rgba(245,245,245,0.04);color:transparent;line-height:1;pointer-events:none;user-select:none;}
  /* Linha horizontal no topo — detalhe editorial */
  .top-line{position:absolute;top:0;left:0;right:0;height:2px;
    background:linear-gradient(to right,${ACC} 200px,${rgba(ACC,0.12)} 500px,transparent);}
  /* Círculo geométrico canto inferior direito */
  .geo-circ{position:absolute;${isGancho?'right:-80px;bottom:-80px;':'right:-60px;bottom:-60px;'}pointer-events:none;}
  .pb{position:absolute;top:60px;left:80px;right:80px;z-index:3;}
  .c{position:relative;z-index:1;padding-top:124px;}
</style></head><body spellcheck="false">
<div class="slide">
  <div class="top-line"></div>
  <!-- Círculo geométrico -->
  <svg class="geo-circ" width="280" height="280" viewBox="0 0 280 280" fill="none">
    <circle cx="140" cy="140" r="125" stroke="${rgba(ACC,0.06)}" stroke-width="1.5"/>
    <circle cx="140" cy="140" r="90" stroke="${rgba(ACC,0.03)}" stroke-width="1"/>
  </svg>
  ${!isGancho&&!isCTA?`<div class="bg-num">${slideNum}</div>`:''}
  ${showProfile ? `<div class="pb">${profileBar}</div>` : ''}
  <div class="c" style="padding-top:${showProfile ? '124' : '44'}px;">${conteudo}</div>
  ${swipeArrow}
  ${progressBar}
</div></body></html>`;
}
