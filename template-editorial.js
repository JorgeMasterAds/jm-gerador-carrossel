/**
 * template-editorial.js — Formato editorial/news com header Post X no topo
 *
 * Visual: header estilo X (avatar 80px + nome + handle + Seguir + ···) fixo no
 * topo de todos os slides. Conteúdo abaixo com tipografia grande e limpa.
 * Capa: foto fullbleed + gradiente escuro + header transparente no topo.
 *
 * Tipos:
 *   gancho   → capa fullbleed com foto de fundo + header no topo (dark)
 *   conteudo → branco + header + label + texto grande + foto opcional embaixo
 *   impacto  → branco + header + frase única enorme
 *   cta      → branco + header + CTA centralizado
 */

import { getBrandConfig } from './lib/brand-config.js';

const cfg = getBrandConfig();
const PROFILE_NOME   = cfg.perfil.nome;
const PROFILE_HANDLE = cfg.perfil.handle;
const PROFILE_FOTO   = cfg.perfil.avatar;

const W = 1080, H = 1350;
const INK   = '#0F1419';
const GRAY  = '#536471';
const LGRAY = '#8B98A5';
const LINE  = 'rgba(15,20,25,0.12)';
const BG    = '#FFFFFF';

// ── Helpers ───────────────────────────────────────────────────────────────────
function bold(t, dark = false) {
  const color = dark ? '#FFFFFF' : '#0F1419';
  return (t || '').replace(/\*\*([^*]+)\*\*/g, `<strong style="font-weight:900;color:${color};">\$1</strong>`);
}

// Destaque em caixa preta (assinatura visual Post X) — para títulos sobre fundo branco
function boldBox(t) {
  return (t || '').replace(/\*\*([^*]+)\*\*/g,
    `<span style="font-weight:900;background:#0F1419;color:#fff;padding:4px 16px 12px;border-radius:10px;display:inline-block;line-height:1.16;box-decoration-break:clone;-webkit-box-decoration-break:clone;">\$1</span>`);
}

function stripEmoji(t) {
  return (t || '').replace(/^[\p{Extended_Pictographic}\u{FE0F}\u{200D}]+\s*/u, '');
}

// Auto-scaling de fonte pelo tamanho do texto
function tfs(text, base, min) {
  const len = (text || '').replace(/\*\*/g, '').length;
  if (len > 180) return min;
  if (len > 140) return Math.max(min, base - 16);
  if (len > 110) return Math.max(min, base - 12);
  if (len > 80)  return Math.max(min, base - 8);
  if (len > 55)  return Math.max(min, base - 4);
  return base;
}

// ── Header estilo X ────────────────────────────────────────────────────────
// dark=true → versão branca (sobre foto escura na capa)
function header(dark = false, isCTA = false) {
  const nameColor   = dark ? '#FFFFFF' : INK;
  const handleColor = dark ? 'rgba(255,255,255,0.70)' : GRAY;
  const btnBorder   = dark ? 'rgba(255,255,255,0.35)' : 'rgba(15,20,25,0.30)';
  const btnColor    = dark ? '#FFFFFF' : INK;
  const moreColor   = dark ? 'rgba(255,255,255,0.55)' : GRAY;
  const avatarRing  = dark ? 'rgba(255,255,255,0.20)' : LINE;

  const verified = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;margin-top:1px;">
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" fill="#1D9BF0"/>
    <path d="m9 12 2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;
                padding:48px 72px 36px;">
      <!-- avatar + info -->
      <div style="display:flex;align-items:center;gap:22px;">
        <div style="width:82px;height:82px;border-radius:50%;flex-shrink:0;overflow:hidden;
                    box-shadow:0 0 0 2px ${avatarRing};">
          <img src="${PROFILE_FOTO}"
               style="width:100%;height:100%;object-fit:cover;object-position:center top;" />
        </div>
        <div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
            <span style="font-family:'Inter',sans-serif;font-size:30px;font-weight:800;
                         color:${nameColor};line-height:1.1;">${PROFILE_NOME}</span>
            ${verified}
          </div>
          <span style="font-family:'Inter',sans-serif;font-size:32px;font-weight:600;
                       color:${handleColor};line-height:1;">${PROFILE_HANDLE}</span>
        </div>
      </div>
      <!-- ações -->
      <div style="display:flex;align-items:center;gap:20px;">
        ${!isCTA ? `
          <div style="font-family:'Inter',sans-serif;font-size:18px;font-weight:700;
                      color:${btnColor};border:1.5px solid ${btnBorder};
                      border-radius:100px;padding:11px 28px;white-space:nowrap;">
            Seguir
          </div>` : ''}
        <span style="font-family:'Inter',sans-serif;font-size:22px;font-weight:900;
                     color:${moreColor};letter-spacing:3px;">···</span>
      </div>
    </div>`;
}

// ── Gerador ────────────────────────────────────────────────────────────────────
export function gerarHTMLSlide({
  titulo, corpo, tipo, numeracao, total,
  ctaBtn = 'Link na bio · Preencha o formulário',
  brand = 'jm-ads', imagem = null, imagem2 = null, imagemPosition = null, label = null, keyword = null,
}) {
  const corpoParts = (corpo || '').split('\n').filter(Boolean);
  const hasPhoto   = Boolean(imagem);
  const isCTA      = tipo === 'cta';

  // Altura do header ~166px (48+82+36) — content começa depois
  const HEADER_H = 166;

  // Progress dots
  const dots = (numeracao > 0 && total > 1) ? `
    <div style="position:absolute;bottom:30px;left:80px;right:80px;
                display:flex;align-items:center;justify-content:center;gap:7px;z-index:10;">
      ${Array.from({length: total}).map((_, i) => i === numeracao - 1
        ? `<div style="width:30px;height:6px;border-radius:3px;background:${INK};"></div>`
        : `<div style="width:7px;height:6px;border-radius:3px;background:rgba(0,0,0,0.16);"></div>`
      ).join('')}
      <span style="position:absolute;right:0;font-family:'Inter',sans-serif;font-size:15px;
                   color:${LGRAY};">${numeracao}/${total}</span>
    </div>` : '';

  let inner = '';

  // ── CAPA ─────────────────────────────────────────────────────────────────
  if (tipo === 'gancho') {
    const fs = tfs(titulo, 78, 50);

    if (imagem && imagem2) {
      // Split 50/50: Natalia (esquerda) × Caito (direita) + gradiente base + texto
      inner = `
        <!-- fotos lado a lado -->
        <div style="position:absolute;inset:0;display:flex;">
          <div style="width:50%;height:100%;overflow:hidden;">
            <img src="${imagem}" alt="" style="width:100%;height:100%;object-fit:cover;object-position:center top;display:block;">
          </div>
          <div style="width:50%;height:100%;overflow:hidden;">
            <img src="${imagem2}" alt="" style="width:100%;height:100%;object-fit:cover;object-position:center top;display:block;">
          </div>
        </div>
        <!-- linha divisória central -->
        <div style="position:absolute;top:0;bottom:0;left:50%;width:3px;background:rgba(255,255,255,0.4);z-index:2;"></div>
        <!-- gradiente: escurece topo (header) e fundo (texto) -->
        <div style="position:absolute;inset:0;z-index:1;
             background:linear-gradient(to bottom,
               rgba(0,0,0,0.78) 0%,
               rgba(0,0,0,0.08) 28%,
               rgba(0,0,0,0.08) 48%,
               rgba(0,0,0,0.92) 100%);"></div>
        <!-- sem labels sobre as fotos -->
        <div style="position:relative;z-index:4;height:100%;
                    display:flex;flex-direction:column;justify-content:space-between;">
          ${header(true)}
          <div style="padding:0 72px 80px;">
            ${label ? `<p style="font-family:'Inter',sans-serif;font-size:28px;
                                  color:rgba(255,255,255,0.72);margin:0 0 18px;
                                  font-weight:500;">${label}</p>` : ''}
            <h1 style="font-family:'Inter',sans-serif;font-size:${fs}px;font-weight:900;
                       color:#FFFFFF;line-height:1.06;letter-spacing:-2px;margin:0 0 28px;">
              ${bold(titulo, true)}
            </h1>
            ${corpoParts.length ? `
              <p style="font-family:'Inter',sans-serif;font-size:36px;
                        color:rgba(255,255,255,0.85);margin:0;line-height:1.45;">
                ${bold(corpoParts[0], true)}
              </p>` : ''}
          </div>
        </div>`;
    } else {
      // Fallback: foto de fundo única
      const bgStyle = imagem
        ? `background-image:url('${imagem}');background-size:cover;background-position:center top;`
        : `background:${INK};`;
      inner = `
        <div style="position:absolute;inset:0;${bgStyle}"></div>
        <div style="position:absolute;inset:0;
             background:linear-gradient(to bottom,
               rgba(0,0,0,0.72) 0%,
               rgba(0,0,0,0.10) 30%,
               rgba(0,0,0,0.10) 50%,
               rgba(0,0,0,0.88) 100%);"></div>
        <div style="position:relative;z-index:2;height:100%;
                    display:flex;flex-direction:column;justify-content:space-between;">
          ${header(true)}
          <div style="padding:0 72px 80px;">
            ${label ? `<p style="font-family:'Inter',sans-serif;font-size:28px;
                                  color:rgba(255,255,255,0.72);margin:0 0 18px;
                                  font-weight:500;">${label}</p>` : ''}
            <h1 style="font-family:'Inter',sans-serif;font-size:${fs}px;font-weight:900;
                       color:#FFFFFF;line-height:1.06;letter-spacing:-2px;margin:0 0 28px;">
              ${bold(titulo, true)}
            </h1>
            ${corpoParts.length ? `
              <p style="font-family:'Inter',sans-serif;font-size:36px;
                        color:rgba(255,255,255,0.85);margin:0;line-height:1.45;">
                ${bold(corpoParts[0], true)}
              </p>` : ''}
          </div>
        </div>`;
    }

  // ── CTA ──────────────────────────────────────────────────────────────────
  } else if (tipo === 'cta') {
    const ctaCorpo = corpoParts.join(' ')
      .replace(/[\p{Extended_Pictographic}️‍]+\s*/gu, '').replace(/\s+/g, ' ').trim();
    const fs = tfs(titulo, 76, 50);
    const [btnPrimary, btnSecondary] = ctaBtn.includes(' · ')
      ? ctaBtn.split(' · ') : [ctaBtn, ''];

    inner = `
      <div style="display:flex;flex-direction:column;height:100%;">
        ${header(false, true)}
        <div style="border-top:1px solid ${LINE};"></div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;
                    justify-content:center;padding:60px 80px 100px;text-align:center;">
          <h2 style="font-family:'Inter',sans-serif;font-size:${fs}px;font-weight:900;
                     color:${INK};line-height:1.12;letter-spacing:-2px;margin:0 0 40px;">
            ${boldBox(titulo)}
          </h2>
          <p style="font-family:'Inter','Segoe UI Emoji',sans-serif;font-size:40px;color:${GRAY};
                    margin:0 0 52px;line-height:1.5;max-width:880px;">
            👉 ${bold(ctaCorpo)}
          </p>
          <div style="border:2px solid ${INK};border-radius:100px;padding:22px 60px;
                      display:inline-flex;align-items:center;gap:12px;">
            <span style="font-family:'Inter',sans-serif;font-size:34px;font-weight:700;
                         color:${INK};">${btnPrimary}</span>
            ${btnSecondary ? `<span style="font-family:'Inter',sans-serif;font-size:34px;
                                          color:${GRAY};">· ${btnSecondary}</span>` : ''}
          </div>
        </div>
      </div>`;

  // ── IMPACTO ──────────────────────────────────────────────────────────────
  } else if (tipo === 'impacto') {
    const fs = tfs(titulo, 96, 58);

    inner = `
      <div style="display:flex;flex-direction:column;height:100%;">
        ${header(false)}
        <div style="border-top:1px solid ${LINE};"></div>
        <div style="flex:1;display:flex;align-items:center;justify-content:flex-start;
                    padding:60px 80px 100px;">
          <p style="font-family:'Inter',sans-serif;font-size:${fs}px;font-weight:900;
                    color:${INK};line-height:1.04;letter-spacing:-3px;margin:0;">
            ${bold(titulo)}
          </p>
        </div>
      </div>`;

  // ── CONTEÚDO (com ou sem foto) ────────────────────────────────────────────
  } else {
    const fs = tfs(titulo, 74, 48);

    // Corpo sem foto: fonte grande (44px). Com foto: menor (33px) para não cortar.
    const bodyFs = hasPhoto ? 33 : 44;
    const bulletsHtml = corpoParts.length ? `
      <div style="display:flex;flex-direction:column;gap:14px;margin-top:28px;">
        ${corpoParts.map(p => `
          <p style="font-family:'Inter',sans-serif;font-size:${bodyFs}px;color:${GRAY};
                    margin:0;line-height:1.5;">${bold(stripEmoji(p))}</p>`
        ).join('')}
      </div>` : '';

    if (hasPhoto) {
      // Split: header → texto → linha → foto. Sem max-height fixo: deixa flex decidir.
      inner = `
        <div style="display:flex;flex-direction:column;height:100%;overflow:hidden;">
          ${header(false)}
          <div style="border-top:1px solid ${LINE};"></div>
          <!-- texto: flex-shrink:0 mas sem max-height fixo — o conteúdo define o tamanho -->
          <div style="flex-shrink:0;padding:36px 72px 28px;">
            ${label ? `<p style="font-family:'Inter',sans-serif;font-size:30px;
                                  color:${LGRAY};margin:0 0 16px;font-weight:500;">${label}</p>` : ''}
            <h2 style="font-family:'Inter',sans-serif;font-size:${fs}px;font-weight:900;
                       color:${INK};line-height:1.14;letter-spacing:-2px;margin:0;">
              ${boldBox(titulo)}
            </h2>
            ${bulletsHtml}
          </div>
          <!-- linha divisória antes da foto -->
          <div style="height:1px;background:${LINE};flex-shrink:0;"></div>
          <!-- foto ocupa o resto -->
          <div style="flex:1;overflow:hidden;min-height:300px;">
            <img src="${imagem}" alt=""
                 style="width:100%;height:100%;object-fit:cover;object-position:${imagemPosition || 'center 30%'};
                        display:block;">
          </div>
        </div>`;
    } else {
      // Só texto — conteúdo centralizado verticalmente abaixo do header
      inner = `
        <div style="display:flex;flex-direction:column;height:100%;">
          ${header(false)}
          <div style="border-top:1px solid ${LINE};"></div>
          <div style="flex:1;display:flex;flex-direction:column;justify-content:center;
                      padding:44px 80px 100px;">
            ${label ? `<p style="font-family:'Inter',sans-serif;font-size:36px;
                                  color:${LGRAY};margin:0 0 24px;font-weight:500;">${label}</p>` : ''}
            <h2 style="font-family:'Inter',sans-serif;font-size:${fs}px;font-weight:900;
                       color:${INK};line-height:1.14;letter-spacing:-2px;margin:0;">
              ${boldBox(titulo)}
            </h2>
            ${bulletsHtml}
          </div>
        </div>`;
    }
  }

  return `<!DOCTYPE html>
<html spellcheck="false">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    body {
      width:${W}px; height:${H}px; overflow:hidden;
      background:${tipo === 'gancho' ? '#000' : BG};
      display:flex; align-items:center; justify-content:center;
    }
    .slide {
      width:${W}px; height:${H}px; overflow:hidden;
      background:${tipo === 'gancho' ? 'transparent' : BG};
      position:relative;
    }
    strong { font-weight:900; }
  </style>
</head>
<body>
  <div class="slide">
    ${inner}
    ${dots}
  </div>
</body>
</html>`;
}
