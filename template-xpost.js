/**
 * template-xpost.js  [X / Twitter Post Style]
 * Branco puro · Texto #0F1419 · Cinza #536471
 * SEM vermelho, SEM azul no texto — só bold vs regular
 * Badge verificado: azul #1D9BF0
 */

import { getBrandConfig } from './lib/brand-config.js';

export function gerarHTMLSlide({ titulo, corpo, tipo, numeracao, total, ctaBtn = 'Link na bio · Preencha o formulário', brand = 'jm-ads', imagem = null, label = null, keyword = null }) {
  const isGancho  = tipo === 'gancho';
  const isCTA     = tipo === 'cta';
  const isImpacto = tipo === 'impacto';
  const showProfile = true; // profile bar em todos os slides

  const cfg  = getBrandConfig();
  const prof = { name: cfg.perfil.nome, handle: cfg.perfil.handle, avatar: cfg.perfil.avatar };

  // Processa **bold** inline → <strong> com estilo do template (xpost: só peso)
  const bold = t => t.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:900;color:#0F1419;">$1</strong>');
  const corpoParts = (corpo || '').split('\n').filter(Boolean);

  const BG    = '#FFFFFF';
  const INK   = '#0F1419';
  const GRAY  = '#536471';
  const LINE  = 'rgba(15,20,25,0.12)';

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
      return { before, beforeLast, after, suffix, hasBold: true };
    }
    const words = t.trim().split(/\s+/);
    if (words.length <= 1) return { before: '', beforeLast: '', after: t, suffix: '', hasBold: false };
    const lastCount = words[words.length - 1].length <= 4 && words.length > 2 ? 2 : 1;
    return { before: words.slice(0, -lastCount).join(' '), beforeLast: '', after: words.slice(-lastCount).join(' '), suffix: '', hasBold: false };
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
        <div style="width:80px;height:80px;border-radius:50%;flex-shrink:0;overflow:hidden;box-shadow:0 0 0 2px ${LINE};">
          <img src="${prof.avatar}"
               style="width:100%;height:100%;object-fit:cover;object-position:center top;" />
        </div>
        <div>
          <div style="display:flex;align-items:center;gap:9px;margin-bottom:5px;">
            <span style="font-family:'Inter',sans-serif;font-size:26px;font-weight:800;color:${INK};">${prof.name}</span>
            ${verified}
          </div>
          <span style="font-family:'Inter',sans-serif;font-size:30px;font-weight:600;color:${GRAY};">${prof.handle}</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:18px;">
        ${!isCTA ? `<div style="font-family:'Inter',sans-serif;font-size:17px;font-weight:700;color:${INK};
             border:1.5px solid rgba(15,20,25,0.30);border-radius:100px;
             padding:10px 26px;white-space:nowrap;">Seguir</div>` : ''}
        <span style="font-family:'Inter',sans-serif;font-size:20px;font-weight:900;color:${GRAY};letter-spacing:3px;">···</span>
      </div>
    </div>
  `;

  const swipeArrow = !isCTA ? `
    <div style="position:absolute;right:16px;top:50%;transform:translateY(-50%);
         width:84px;height:84px;border-radius:50%;
         background:rgba(15,20,25,0.06);
         display:flex;align-items:center;justify-content:center;z-index:10;">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <path d="M9 18l6-6-6-6" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>` : '';

  // Escalonamento de fonte para bullets — testa de 44px para baixo até caber em maxH
  function bodyFontSize(parts, maxH = 650, maxW = 840) {
    for (const fs of [44, 40, 36, 32, 28]) {
      const ratio  = 0.50;
      const lineH  = 1.50;
      const padV   = 33; // padding:16px top/bottom + border top 1px
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
  // xpost: .c tem padding-top:128px, padding-bottom:80px → área útil ~872px
  // H1 divide com divisória+corpo → maxH=540
  function ganchoFontSize(text, maxH = 540, maxW = 900, ratio = 0.58, lineH = 1.08) {
    const len = text.replace(/\*\*/g, '').trim().length;
    const target = maxH * 0.82;
    let lo = 38, hi = 110, best = lo;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const cpl = Math.floor(maxW / (mid * ratio));
      const lines = Math.ceil(len / Math.max(cpl, 1));
      if (lines * mid * lineH <= target) { best = mid; lo = mid + 1; }
      else hi = mid - 1;
    }
    return best;
  }

  // Estima altura real do H1 com base no font-size calculado
  function estimateH1Height(text, fs, maxW = 900, lineH = 1.08, ratio = 0.58) {
    const len = text.replace(/\*\*/g, '').trim().length;
    const cpl = Math.max(1, Math.floor(maxW / (fs * ratio)));
    const lines = Math.ceil(len / cpl);
    return lines * fs * lineH;
  }

  const showBadge = !isGancho && !isCTA && !isImpacto && keyword;
  const badgeHtml = showBadge ? `
    <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:22px;">
      <div style="width:28px;height:2px;background:rgba(15,20,25,0.35);border-radius:1px;flex-shrink:0;"></div>
      <span style="font-family:'Inter',sans-serif;font-size:20px;font-weight:700;
           color:#536471;letter-spacing:2.5px;text-transform:uppercase;">${label || keyword}</span>
    </div>` : '';

  // Progress dots (todos os slides exceto impacto)
  const dotIdx = isGancho ? 0 : isCTA ? total - 1 : numeracao;
  const progressBar = !isImpacto ? `
    <div style="position:absolute;bottom:34px;left:80px;right:80px;
         display:flex;align-items:center;justify-content:space-between;z-index:4;">
      <div style="display:flex;align-items:center;gap:6px;">
        ${Array.from({length: total}, (_, i) => `<div style="height:8px;border-radius:4px;
          width:${i === dotIdx ? 36 : 10}px;
          background:${i === dotIdx ? INK : 'rgba(15,20,25,0.14)'};"></div>`).join('')}
      </div>
      <span style="font-family:'Inter',sans-serif;font-size:21px;font-weight:700;
           color:rgba(15,20,25,0.42);letter-spacing:1px;">${slideNum}/${slideTotal}</span>
    </div>` : '';

  let conteudo = '';

  if (isGancho) {
    const { before, beforeLast, after, suffix, hasBold } = splitTitulo(titulo);
    if (imagem) {
      // Estilo X com mídia: texto em cima + imagem em card arredondado embaixo (como anexo de tweet)
      const fs = ganchoFontSize(titulo, 320, 900, 0.58, 1.10);
      conteudo = `
        <h1 style="font-family:'Inter',sans-serif;line-height:1.10;
             color:${INK};margin:0 0 22px;letter-spacing:-1px;max-width:900px;max-height:340px;overflow:hidden;">
          <span style="font-size:${fs}px;font-weight:400;">${before}${before ? '<br>' : ''}${beforeLast ? `${beforeLast} ` : ''}</span>${hasBold ? `<span style="font-size:${fs}px;font-weight:900;background:#0F1419;color:#fff;padding:6px 16px 14px;border-radius:8px;display:inline-block;line-height:1.16;box-decoration-break:clone;-webkit-box-decoration-break:clone;">${after}</span>` : `<span style="font-size:${fs}px;font-weight:900;">${after}</span>`}${suffix ? `<span style="font-size:${fs}px;font-weight:400;"> ${bold(suffix)}</span>` : ''}
        </h1>
        ${corpoParts.length > 0
          ? `<div style="display:flex;flex-direction:column;gap:12px;max-width:860px;margin-bottom:26px;">${corpoParts.map(p => `<p style="font-family:'Inter',sans-serif;font-size:34px;line-height:1.45;color:${GRAY};margin:0;font-weight:400;">${bold(p)}</p>`).join('')}</div>`
          : '<div style="height:26px;"></div>'}
        <div style="border-radius:24px;overflow:hidden;border:1px solid ${LINE};width:100%;max-height:540px;
             background:rgba(15,20,25,0.02);box-shadow:0 8px 30px rgba(15,20,25,0.10);">
          <img src="${imagem}" style="width:100%;max-height:540px;object-fit:cover;object-position:top center;display:block;" />
        </div>
      `;
    } else {
      const fs = ganchoFontSize(titulo);
      // Margem e espaçamento adaptados: reduz quando há corpo para evitar overflow
      const hasCorp = corpoParts.length > 0;
      const h1Margin = hasCorp ? 22 : 40;
      const divMargin = hasCorp ? 22 : 36;
      // Área útil: 1350 - 60(slide top) - 128(c top) - 80(slide bottom) = 1082px
      // margin-top:24px no h1 cria respiro abaixo do header
      const h1EstH = estimateH1Height(titulo, fs);
      const corpoMaxH = Math.max(260, 1082 - 24 - h1EstH - h1Margin - 1 - divMargin);
      const corpoFs = hasCorp ? bodyFontSize(corpoParts, corpoMaxH) : 44;
      conteudo = `
        <h1 style="font-family:'Inter',sans-serif;line-height:1.08;
             color:${INK};margin:24px 0 ${h1Margin}px;letter-spacing:${fs > 70 ? '-3' : '-1'}px;max-width:900px;max-height:580px;overflow:hidden;">
          <span style="font-size:${fs}px;font-weight:400;">${before}${before ? '<br>' : ''}${beforeLast ? `${beforeLast} ` : ''}</span>${hasBold ? `<span style="font-size:${fs}px;font-weight:900;background:#0F1419;color:#fff;padding:6px 16px 14px;border-radius:8px;display:inline-block;line-height:1.16;box-decoration-break:clone;-webkit-box-decoration-break:clone;">${after}</span>` : `<span style="font-size:${fs}px;font-weight:900;">${after}</span>`}${suffix ? `<span style="font-size:${fs}px;font-weight:400;"> ${bold(suffix)}</span>` : ''}
        </h1>
        <div style="width:100%;height:1px;background:${LINE};margin-bottom:${divMargin}px;"></div>
        <div style="display:flex;flex-direction:column;gap:16px;max-width:860px;overflow:hidden;">
          ${hasCorp
            ? corpoParts.map(p => `<p style="font-family:'Inter',sans-serif;font-size:${corpoFs}px;line-height:1.5;color:${GRAY};margin:0;font-weight:400;">${bold(p)}</p>`).join('')
            : `<p style="font-family:'Inter',sans-serif;font-size:44px;line-height:1.5;color:${GRAY};margin:0;">Deslize para ver como funciona →</p>`
          }
        </div>
      `;
    }

  } else if (isCTA) {
    const { before, after, suffix } = splitTitulo(titulo);
    // CTA corpo: strip todos os emojis e prepend 👉 (1 emoji, frase única)
    const ctaCorpoText = corpoParts.join(' ').replace(/[\p{Extended_Pictographic}️‍]+\s*/gu, '').replace(/\s+/g, ' ').trim();
    conteudo = `
      <h2 style="font-family:'Inter',sans-serif;line-height:1.08;
           color:${INK};margin:0 0 32px;letter-spacing:-3px;max-width:900px;">
        <span style="font-size:88px;font-weight:400;">${before}${before ? ' ' : ''}</span><span style="font-size:88px;font-weight:900;">${after}</span>${suffix ? `<span style="font-size:88px;font-weight:400;"> ${bold(suffix)}</span>` : ''}
      </h2>
      <div style="width:100%;height:1px;background:${LINE};margin-bottom:32px;"></div>
      <p style="font-family:'Inter','Segoe UI Emoji','Apple Color Emoji',sans-serif;font-size:44px;line-height:1.55;color:${GRAY};margin:0 0 48px;max-width:820px;font-weight:400;">
        👉 ${bold(ctaCorpoText)}
      </p>
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-family:'Inter',sans-serif;font-size:36px;font-weight:800;color:${INK};">${ctaBtn.split(' · ')[0]}</span>
        <span style="font-family:'Inter',sans-serif;font-size:36px;color:${GRAY};">·</span>
        <span style="font-family:'Inter',sans-serif;font-size:36px;font-weight:400;color:${GRAY};">${ctaBtn.split(' · ')[1] || ''} →</span>
      </div>
    `;

  } else if (isImpacto) {
    // No IMPACTO: bold sem fundo — só peso máximo + sem retângulo.
    const boldColor = t => t.replace(/\*\*(.*?)\*\*/g, `<span style="font-weight:900;color:${INK};">$1</span>`);
    conteudo = `
      <div style="display:flex;align-items:center;height:1150px;">
        <p style="font-family:'Inter',sans-serif;font-size:92px;font-weight:400;
             line-height:1.25;color:${INK};letter-spacing:-3px;max-width:900px;">
          ${boldColor(titulo)}
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
      <div style="border-radius:20px;overflow:hidden;border:1px solid rgba(15,20,25,0.10);
           max-height:390px;display:flex;align-items:center;justify-content:center;
           background:rgba(15,20,25,0.02);box-shadow:0 6px 28px rgba(15,20,25,0.09);">
        <img src="${imagem}" style="width:100%;height:390px;object-fit:cover;object-position:top center;display:block;" />
      </div>
      ${corpoParts.slice(0,2).map(p=>`
        <p style="font-family:'Inter',sans-serif;font-size:32px;line-height:1.5;
             color:${GRAY};margin:20px 0 0;max-width:920px;">${bold(p)}</p>`).join('')}
    `;
  } else {
    const { before, beforeLast, after, suffix, hasBold } = splitTitulo(titulo);
    conteudo = `
      ${badgeHtml}
      <h2 style="font-family:'Inter',sans-serif;line-height:1.08;
           color:${INK};margin:0 0 28px;letter-spacing:-2.5px;max-width:900px;">
        <span style="font-size:72px;font-weight:400;">${before}${before ? ' ' : ''}${beforeLast ? `${beforeLast} ` : ''}</span>${hasBold ? `<span style="font-size:72px;font-weight:900;background:#0F1419;color:#fff;padding:6px 16px 14px;border-radius:8px;display:inline-block;line-height:1.16;box-decoration-break:clone;-webkit-box-decoration-break:clone;">${after}</span>` : `<span style="font-size:72px;font-weight:900;">${after}</span>`}${suffix ? `<span style="font-size:72px;font-weight:400;"> ${bold(suffix)}</span>` : ''}
      </h2>
      <div style="width:100%;height:1px;background:${LINE};margin-bottom:28px;"></div>
      <div style="display:flex;flex-direction:column;gap:0;max-width:880px;">
        ${(() => {
          const bfs = bodyFontSize(corpoParts);
          return corpoParts.map((p,i) => {
          const txt = bold(p.replace(/^[\p{Extended_Pictographic}\u{FE0F}\u{200D}]+\s*/u, ''));
          const marker = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;margin-top:${Math.max(4,Math.round(bfs*0.18))}px;"><path d="M9 6l6 6-6 6" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
          return `
            <div style="display:flex;align-items:flex-start;gap:18px;padding:16px 0;
                 ${i > 0 ? 'border-top:1px solid ' + LINE + ';' : ''}">
              ${marker}
              <p style="font-family:'Inter',sans-serif;font-size:${bfs}px;line-height:1.5;color:${INK};margin:0;font-weight:400;">${txt}</p>
            </div>`;
        }).join('');
        })()}
      </div>
    `;
  }

  return `<!DOCTYPE html><html spellcheck="false"><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0;text-decoration:none;}
  body{width:1080px;height:1350px;overflow:hidden;background:#fff;display:flex;align-items:center;justify-content:center;}
  .slide{width:1080px;height:1350px;padding:60px 80px 80px;display:flex;flex-direction:column;
         justify-content:center;position:relative;overflow:hidden;background:#fff;}
  .pb{position:absolute;top:60px;left:80px;right:80px;z-index:3;}
  .c{position:relative;z-index:1;padding-top:128px;}
</style></head><body spellcheck="false">
<div class="slide">
  ${showProfile ? `<div class="pb">${profileBar}</div>` : ''}
  <div class="c" style="padding-top:${showProfile ? '128' : '44'}px;">${conteudo}</div>
  ${swipeArrow}
  ${progressBar}
</div></body></html>`;
}
