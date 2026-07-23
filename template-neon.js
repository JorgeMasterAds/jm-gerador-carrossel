/**
 * template-neon.js  [SKIN: neon-dark]
 * Dark #030303 · Glow configurável (brand.config.json) · Space Grotesk + Caveat
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
  const ACC = cfg.cores.neon;
  // Processa **bold** inline → destaque de cor da marca
  const bold = t => t.replace(/\*\*(.*?)\*\*/g, `<mark style="background:${rgba(ACC,0.20)};color:${ACC};font-weight:700;padding:2px 7px;border-radius:4px;font-style:normal;box-shadow:0 0 8px ${rgba(ACC,0.25)};box-decoration-break:clone;-webkit-box-decoration-break:clone;">$1</mark>`);
  const corpoParts = (corpo || '').split('\n').filter(Boolean);

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

  const topBar = `
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:20px;">
        <div style="width:80px;height:80px;border-radius:50%;flex-shrink:0;overflow:hidden;border:2px solid ${rgba(ACC,0.50)};">
          <img src="${prof.avatar}"
               style="width:100%;height:100%;object-fit:cover;object-position:center top;" />
        </div>
        <div>
          <div style="display:flex;align-items:center;gap:9px;margin-bottom:5px;">
            <span style="font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:700;color:#fff;">${prof.name}</span>
            ${verified}
          </div>
          <span style="font-family:'Inter',sans-serif;font-size:30px;font-weight:600;color:rgba(255,255,255,0.55);">${prof.handle}</span>
        </div>
      </div>
      <div style="display:flex;align-items:baseline;gap:3px;">
        <span style="font-family:'Space Grotesk',sans-serif;font-size:42px;font-weight:900;color:#fff;line-height:1;
              ">${slideNum}</span>
        <span style="font-family:'Space Grotesk',sans-serif;font-size:18px;color:rgba(255,255,255,0.25);">/${slideTotal}</span>
      </div>
    </div>
  `;

  const chartDeco = `
    <svg style="position:absolute;right:72px;bottom:90px;opacity:0.08;pointer-events:none;"
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
         background:${rgba(ACC,0.10)};border:1px solid ${rgba(ACC,0.25)};
         display:flex;align-items:center;justify-content:center;z-index:10;
         ">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <path d="M9 18l6-6-6-6" stroke="${ACC}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>` : '';

  let conteudo = '';

  // Escalonamento de fonte para bullets
  function bodyFontSize(parts, maxH = 600, maxW = 800) {
    for (const fs of [44, 40, 36, 32, 28]) {
      const ratio  = 0.50;
      const lineH  = 1.50;
      const padV   = 46; // gap:18px + padding do card interno
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
  // neon: sem badge fixo → área disponível maior → maxH=660
  function ganchoFontSize(text, maxH = 660, maxW = 940, ratio = 0.57, lineH = 1.0) {
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
    <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:20px;">
      <div style="width:28px;height:2px;background:${ACC};border-radius:1px;flex-shrink:0;box-shadow:0 0 8px ${rgba(ACC,0.60)};"></div>
      <span style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;
           color:${ACC};letter-spacing:2.5px;text-transform:uppercase;">${label || keyword}</span>
    </div>` : '';

  const dotIdx = isGancho ? 0 : isCTA ? total - 1 : numeracao;
  const progressBar = !isImpacto ? `
    <div style="position:absolute;bottom:34px;left:80px;right:80px;
         display:flex;align-items:center;justify-content:space-between;z-index:4;">
      <div style="display:flex;align-items:center;gap:5px;">
        ${Array.from({length: total}, (_, i) => `<div style="height:8px;border-radius:4px;
          width:${i === dotIdx ? 36 : 10}px;
          background:${i === dotIdx ? ACC : rgba(ACC,0.20)};
          ${i === dotIdx ? `box-shadow:0 0 10px ${rgba(ACC,0.70)};` : ''}"></div>`).join('')}
      </div>
      <span style="font-family:'Space Grotesk',sans-serif;font-size:21px;font-weight:700;
           color:${rgba(ACC,0.55)};letter-spacing:1px;">${slideNum}/${slideTotal}</span>
    </div>` : '';

  if (isGancho) {
    const { before, beforeLast, after, suffix } = splitTitulo(titulo);
    const fs = ganchoFontSize(titulo);
    conteudo = `
      <h1 style="font-family:'Space Grotesk',sans-serif;font-size:${fs}px;font-weight:900;
           line-height:1.0;color:#fff;margin:0 0 32px;letter-spacing:${fs > 80 ? '-4' : '-2'}px;max-width:940px;max-height:620px;overflow:hidden;">
        ${before}${before ? '<br>' : ''}${beforeLast ? `${beforeLast}<br>` : ''}
        <span style="font-family:'Playfair Display',Georgia,serif;font-size:0.95em;font-weight:700;color:${ACC};font-style:italic;
              ">${after}</span>${suffix ? ' ' + suffix : ''}
      </h1>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px;">
        <div style="width:8px;height:8px;border-radius:50%;background:${ACC};box-shadow:0 0 12px ${rgba(ACC,0.9)};flex-shrink:0;"></div>
        <div style="height:1px;flex:1;background:linear-gradient(to right,${rgba(ACC,0.5)},transparent);"></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:20px;max-width:860px;">
        ${corpoParts.length > 0
          ? corpoParts.map(p=>`
            <div style="display:flex;align-items:flex-start;gap:14px;">
              <span style="font-family:'Space Grotesk',sans-serif;font-size:26px;color:${ACC};font-weight:700;line-height:1.5;flex-shrink:0;text-shadow:0 0 8px ${rgba(ACC,0.6)};">•</span>
              <p style="font-family:'Inter',sans-serif;font-size:44px;line-height:1.5;color:rgba(255,255,255,0.60);margin:0;">${bold(p)}</p>
            </div>`).join('')
          : `<p style="font-family:'Inter',sans-serif;font-size:44px;line-height:1.5;color:rgba(255,255,255,0.40);margin:0;">Deslize para ver como funciona →</p>`
        }
      </div>
    `;

  } else if (isCTA) {
    const { before, after, suffix } = splitTitulo(titulo);
    conteudo = `
      <div style="width:88px;height:88px;border-radius:50%;
           background:${ACC};
           display:flex;align-items:center;justify-content:center;
           border:2px solid ${rgba(ACC,0.60)};
           margin-bottom:40px;">
        <span style="font-size:44px;color:#fff;font-weight:900;line-height:1;">→</span>
      </div>
      <h2 style="font-family:'Space Grotesk',sans-serif;font-size:88px;font-weight:900;
           line-height:1.0;color:#fff;margin:0 0 28px;letter-spacing:-3.5px;max-width:940px;">
        ${before}${before ? ' ' : ''}
        <span style="font-family:'Playfair Display',Georgia,serif;font-size:0.95em;font-weight:700;color:${ACC};font-style:italic;
              ">${after}</span>${suffix ? ' ' + suffix : ''}
      </h2>
      <p style="font-family:'Inter','Segoe UI Emoji','Apple Color Emoji',sans-serif;font-size:44px;line-height:1.55;color:rgba(255,255,255,0.50);margin:0 0 48px;max-width:820px;">
        👉 ${bold(corpoParts.join(' ').replace(/[\p{Extended_Pictographic}️‍]+\s*/gu, '').replace(/\s+/g, ' ').trim())}
      </p>
      <div style="display:inline-flex;align-items:center;gap:14px;
           background:${ACC};
           padding:22px 48px;border-radius:8px;width:fit-content;
           ">
        <span style="font-family:'Space Grotesk',sans-serif;font-size:36px;font-weight:700;color:#fff;">${ctaBtn}</span>
        <span style="font-size:36px;color:#fff;">→</span>
      </div>
      <div style="margin-top:36px;font-family:'Inter',sans-serif;font-size:22px;color:rgba(255,255,255,0.30);">${prof.handle}</div>
    `;

  } else if (isImpacto) {
    const boldColor = t => t.replace(/\*\*(.*?)\*\*/g, `<span style="color:${ACC};font-weight:900;">$1</span>`);
    conteudo = `
      <div style="display:flex;align-items:center;height:1150px;">
        <p style="font-family:'Space Grotesk',sans-serif;font-size:92px;font-weight:900;
             line-height:1.25;color:#fff;letter-spacing:-3px;max-width:900px;">
          ${boldColor(titulo)}
        </p>
      </div>
    `;

  } else if (imagem) {
    conteudo = `
      ${badgeHtml}
      <h2 style="font-family:'Space Grotesk',sans-serif;font-size:50px;font-weight:900;
           line-height:1.05;color:#fff;margin:0 0 18px;letter-spacing:-2px;max-width:940px;">
        ${bold(titulo)}
      </h2>
      <div style="border-radius:20px;overflow:hidden;border:1px solid ${rgba(ACC,0.25)};
           max-height:490px;display:flex;align-items:center;justify-content:center;
           background:${rgba(ACC,0.04)};box-shadow:0 6px 32px ${rgba(ACC,0.12)};">
        <img src="${imagem}" style="width:100%;max-height:490px;object-fit:contain;display:block;" />
      </div>
      ${corpoParts.slice(0,2).map(p=>`
        <p style="font-family:'Inter',sans-serif;font-size:21px;line-height:1.5;
             color:rgba(255,255,255,0.50);margin:14px 0 0;max-width:920px;">${bold(p)}</p>`).join('')}
    `;
  } else {
    const { before, after, suffix } = splitTitulo(titulo);
    conteudo = `
      ${chartDeco}
      ${badgeHtml}
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.10);
           border-radius:20px;padding:44px 48px;position:relative;z-index:1;">
        <h2 style="font-family:'Space Grotesk',sans-serif;font-size:68px;font-weight:900;
             line-height:1.0;color:#fff;margin:0 0 20px;letter-spacing:-2.5px;max-width:860px;">
          ${before}${before ? ' ' : ''}
          <span style="font-family:'Playfair Display',Georgia,serif;font-size:0.95em;font-weight:700;color:${ACC};font-style:italic;
                ">${after}</span>${suffix ? ' ' + suffix : ''}
        </h2>
        <div style="width:44px;height:2px;border-radius:1px;background:${ACC};box-shadow:0 0 12px ${rgba(ACC,0.7)};margin-bottom:24px;"></div>
        <div style="display:flex;flex-direction:column;gap:18px;">
          ${(()=>{ const bfs = bodyFontSize(corpoParts); return corpoParts.map((p,i)=>{
            const txt = bold(p.replace(/^[\p{Extended_Pictographic}\u{FE0F}\u{200D}]+\s*/u, ''));
            const marker = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;margin-top:${Math.max(4,Math.round(bfs*0.18))}px;"><path d="M9 6l6 6-6 6" stroke="${ACC}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            return `
            <div style="display:flex;align-items:flex-start;gap:14px;">
              ${marker}
              <p style="font-family:'Inter',sans-serif;font-size:${bfs}px;line-height:1.5;color:#C0C0C0;margin:0;">${txt}</p>
            </div>`; }).join(''); })()}
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html><html spellcheck="false"><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700;800;900&family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@1,700&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0;text-decoration:none;}
  body{width:1080px;height:1350px;overflow:hidden;background:#030303;display:flex;align-items:center;justify-content:center;}
  .slide{width:1080px;height:1350px;padding:60px 80px 80px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;}
  .slide::before{content:'';position:absolute;
    ${isGancho?'top:-200px;left:-200px;width:700px;height:700px;':isCTA?'bottom:-200px;right:-200px;width:600px;height:600px;':'top:-100px;right:-100px;width:450px;height:450px;'}
    background:radial-gradient(circle,${rgba(ACC,0.14)} 0%,transparent 70%);pointer-events:none;}
  .slide::after{content:'';position:absolute;
    ${isGancho?'bottom:-150px;right:-150px;':'bottom:-150px;left:-150px;'}
    width:400px;height:400px;
    background:radial-gradient(circle,${rgba(ACC,0.06)} 0%,transparent 70%);pointer-events:none;}
  .dots{position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,0.025) 1px,transparent 1px);background-size:44px 44px;pointer-events:none;}
  /* Formas geométricas */
  .geo-arc{position:absolute;${isGancho?'left:-80px;bottom:-80px;':'right:-120px;top:-120px;'}pointer-events:none;}
  .geo-cross{position:absolute;${isGancho?'right:80px;top:200px;':'left:80px;bottom:100px;'}pointer-events:none;}
  .bg-num{position:absolute;right:72px;bottom:80px;font-family:'Space Grotesk',sans-serif;font-size:220px;font-weight:900;color:${rgba(ACC,0.04)};line-height:1;pointer-events:none;user-select:none;}
  .pb{position:absolute;top:60px;left:80px;right:80px;z-index:3;}
  .content{position:relative;z-index:1;padding-top:124px;}
</style></head><body spellcheck="false">
<div class="slide">
  <div class="dots"></div>
  <!-- Arco geométrico grande -->
  <svg class="geo-arc" width="400" height="400" viewBox="0 0 400 400" fill="none">
    <circle cx="200" cy="200" r="185" stroke="${rgba(ACC,0.07)}" stroke-width="1.5"/>
    <circle cx="200" cy="200" r="140" stroke="${rgba(ACC,0.04)}" stroke-width="1"/>
  </svg>
  <!-- Cruz decorativa -->
  <svg class="geo-cross" width="20" height="20" viewBox="0 0 20 20">
    <line x1="10" y1="0" x2="10" y2="20" stroke="${rgba(ACC,0.30)}" stroke-width="1.5"/>
    <line x1="0" y1="10" x2="20" y2="10" stroke="${rgba(ACC,0.30)}" stroke-width="1.5"/>
  </svg>
  ${!isGancho&&!isCTA?`<div class="bg-num">${slideNum}</div>`:''}
  ${showProfile ? `<div class="pb">${topBar}</div>` : ''}
  <div class="content" style="padding-top:${showProfile ? '124' : '44'}px;">${conteudo}</div>
  ${swipeArrow}
  ${progressBar}
</div></body></html>`;
}
