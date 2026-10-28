// Baut aus index.html eine eigenständige, abgesicherte Website in ./website
// Aufruf: node build-website.js
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const script = src.match(/<script>([\s\S]*?)<\/script>/)[1];
const hash = crypto.createHash('sha256').update(script, 'utf8').digest('base64');

// Nur das eigene Skript darf laufen, nichts wird nachgeladen, keine Formulare, keine Einbettung.
const csp = `default-src 'none'; script-src 'sha256-${hash}'; style-src 'unsafe-inline'; img-src data:; font-src data:; base-uri 'none'; form-action 'none'`;

const head = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="description" content="Interaktive Lernuhr für Grundschulkinder: Zeiger drehen, ins Uhrwerk schauen und Uhrzeit-Missionen lösen.">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}[hidden]{display:none!important}</style>
`;
const body = src.replace('<div id="sky"', '</head>\n<body>\n<div id="sky"') + '\n</body>\n</html>\n';

const out = path.join(__dirname, 'website');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'index.html'), head + body);

// Sicherheits-Header für Netlify / Cloudflare Pages
fs.writeFileSync(path.join(out, '_headers'), `/*
  Content-Security-Policy: ${csp}; frame-ancestors 'none'
  Strict-Transport-Security: max-age=63072000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: no-referrer
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin
`);
console.log('website/ gebaut, Skript-Hash sha256-' + hash);
