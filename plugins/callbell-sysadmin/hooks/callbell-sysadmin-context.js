#!/usr/bin/env node
'use strict';

// SessionStart-Hook von callbell-sysadmin. Serverspezifisch, reist mit dem Pack und ist bewusst getrennt
// vom Kern-Hook callbell-context.js: Host-Identität ist ein Server-Begriff und fehlt auf Nicht-Servern,
// der Kern-Hook bleibt deshalb unberührt.
//
// Das Pack hängt an einer einzigen Tatsache: __callbell__/.host-identity im Projekt-Root. Die Datei hat
// drei Zustände, und sie sind auf Dateisystemebene unterscheidbar:
//
//   fehlt            -> kein Serverkontext. Der Hook gibt nichts aus, nichts Serverspezifisches lädt.
//   da, leer         -> der Nutzer arbeitet von der eigenen Maschine aus per SSH; der Host wird im
//                       Gespräch benannt. Die Sicherheitsschicht lädt, es ist keine Domäne gesetzt.
//   da, mit Inhalt   -> der Agent läuft auf dem Host; der Inhalt ist der Name des Domänenordners.
//
// Der leere Fall muss die Sicherheitsschicht laden. Wer eine Kiste per SSH vom Laptop aus administriert,
// setzt dieselben zerstörenden Befehle ab wie jemand, der davorsitzt, und eine passive Schutzschicht, die
// nur einen von beiden schützt, schützt den falschen.
//
// Graceful degradation ohne node erledigt die Hook-Registrierung (; exit 0 / Windows-Guard), ein fehlendes
// node blockiert also nie eine Sitzung; die abrufbaren Skills funktionieren so oder so.

const fs = require('fs');
const path = require('path');

// Root-Auflösung wie im Kern-Hook: Claude gibt $CLAUDE_PROJECT_DIR, Codex gibt {cwd} über stdin.
function resolveRoot() {
  if (process.env.CLAUDE_PROJECT_DIR) return process.env.CLAUDE_PROJECT_DIR;
  if (!process.stdin.isTTY) {
    try {
      const raw = fs.readFileSync(0, 'utf8');
      const payload = raw ? JSON.parse(raw) : null;
      if (payload && typeof payload.cwd === 'string' && payload.cwd) return payload.cwd;
    } catch { /* no or invalid JSON on stdin -> fallback */ }
  }
  return process.cwd();
}

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || process.env.PLUGIN_ROOT || '';
const root = resolveRoot();

// null = Datei fehlt, '' = da und leer, sonst der Name des Domänenordners.
const host = (() => {
  try { return fs.readFileSync(path.join(root, '__callbell__', '.host-identity'), 'utf8').trim(); }
  catch { return null; }
})();
if (host === null) process.exit(0); // kein Serverkontext -> nichts Serverspezifisches lädt

const blocks = [];
if (host) {
  const domainExists = (() => {
    try { return fs.statSync(path.join(root, host)).isDirectory(); }
    catch { return false; }
  })();
  const lines = [
    'HOST-IDENTITÄT: ' + host,
    'Auf diesem Host bist du "' + host + '". Deine Arbeitsdomäne ist ' + host + '/ und __callbell__/.',
    'Alles außerhalb dieser beiden ist tabu, solange der Nutzer den Rahmen nicht ausdrücklich weitet.',
  ];
  // Der Ordner ist der Kern des Versprechens. Fehlt er, sag es, statt den Agenten auf einen Pfad zu
  // scopen, an dem nichts liegt — genau dieses stille Scheitern war der Anlass für die drei Zustände.
  if (!domainExists) {
    lines.push('Der Ordner ' + host + '/ liegt noch nicht vor. Lege ihn über /callbell-sysadmin:start an,' +
      ' bevor du Material über diesen Host ablegst.');
  }
  blocks.push(lines.join('\n'));
} else {
  blocks.push([
    'HOST-IDENTITÄT: keine gesetzt (Fernwartung von der Maschine des Nutzers aus).',
    'Es ist keine Arbeitsdomäne gesetzt. Um welchen Host es geht, sagt der Nutzer im Gespräch; frag nach,',
    'bevor du etwas ausführst, das einen bestimmten Host meint.',
  ].join('\n'));
}

// Die passive Sicherheitsschicht: die rules/ des Packs, eingespielt in beiden Identitätszuständen. Die
// abrufbaren Skills bleiben schlafen, bis sie gerufen werden, es reisen also nur diese Regeln mit.
function bodyOf(file) {
  let text = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');    // strip BOM
  text = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');         // strip YAML frontmatter
  return text.split(/\r?\n/).filter(l => !/^\s*@[\w./-]+\s*$/.test(l)).join('\n').trim();
}
function collect(dir) {
  let out = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(collect(full));
    else if (e.name.endsWith('.md')) out.push(full);
  }
  return out.sort();
}

if (pluginRoot) {
  const parts = [];
  for (const f of collect(path.join(pluginRoot, 'rules'))) {
    const body = bodyOf(f);
    if (body) parts.push('--- ' + path.relative(pluginRoot, f).split(path.sep).join('/') + ' ---\n' + body);
  }
  if (parts.length) {
    blocks.push('Server-Sicherheitsschicht (passiv, in Kraft solange eine Host-Identität vorliegt):');
    blocks.push(parts.join('\n\n'));
  }
}

process.stdout.write(blocks.join('\n\n') + '\n');
process.exit(0);
