'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const OUT = ROOT;

function readJSON(name) {
  return JSON.parse(fs.readFileSync(path.join(CONTENT, name), 'utf8'));
}

function esc(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Texte déjà en prose : on échappe puis on retape les retours ligne simples en <br> si besoin.
function t(s) { return esc(s); }

function img(src, alt, opts) {
  opts = opts || {};
  const cls = opts.cls ? ` class="${opts.cls}"` : '';
  const loading = opts.eager ? '' : ' loading="lazy"';
  const sizes = opts.sizes ? ` sizes="${opts.sizes}"` : '';
  return `<img src="/assets/images/${src}" alt="${esc(alt || '')}"${cls}${loading}${sizes}>`;
}

function writePage(outPath, html) {
  const full = path.join(OUT, outPath, 'index.html');
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html, 'utf8');
}

function writeFile(outPath, content) {
  const full = path.join(OUT, outPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

function paragraphs(arr, cls) {
  if (!arr) return '';
  return arr.map(p => `<p${cls ? ` class="${cls}"` : ''}>${t(p)}</p>`).join('\n');
}

function slugPath(...parts) {
  return '/' + parts.filter(Boolean).join('/').replace(/\/+/g, '/').replace(/^\//, '') + '/';
}

module.exports = { fs, path, ROOT, CONTENT, OUT, readJSON, esc, t, img, writePage, writeFile, paragraphs, slugPath };
