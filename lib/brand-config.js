/**
 * brand-config.js — carrega a configuração de marca do usuário
 *
 * Lê config/brand.config.json (criado pelo usuário a partir do
 * brand.config.example.json) e expõe getBrandConfig(). Os templates usam
 * isso para nome, @, foto e cor de destaque — nunca mais hardcoded.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '..', 'config', 'brand.config.json');

const DEFAULTS = {
  nicho: 'Não configurado',
  perfil: {
    nome: 'Configure seu brand.config.json',
    handle: '@configure.me',
    avatar: null,
  },
  logo: null,
  cores: {
    mono: '#EC1325',
    neon: '#EC1325',
    darkwarm: '#FF8A3D',
    cyber: '#FF003C',
  },
  ctaPadrao: 'Link na bio · Fale comigo',
};

let cached = null;

export function getBrandConfig() {
  if (cached) return cached;

  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(
      `\n❌ config/brand.config.json não encontrado.\n` +
      `   Copie config/brand.config.example.json para config/brand.config.json\n` +
      `   e preencha com os dados da sua marca antes de gerar carrosséis.\n`
    );
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

  cached = {
    nicho: raw.nicho || DEFAULTS.nicho,
    perfil: {
      nome: raw.perfil?.nome || DEFAULTS.perfil.nome,
      handle: raw.perfil?.handle || DEFAULTS.perfil.handle,
      avatar: raw.perfil?.foto || DEFAULTS.perfil.avatar,
    },
    logo: raw.logo || DEFAULTS.logo,
    cores: { ...DEFAULTS.cores, ...(raw.cores || {}) },
    ctaPadrao: raw.ctaPadrao || DEFAULTS.ctaPadrao,
  };

  return cached;
}
