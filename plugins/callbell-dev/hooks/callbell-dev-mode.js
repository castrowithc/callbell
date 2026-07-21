#!/usr/bin/env node
'use strict';
// callbell-dev — persistent lazy mode. ONE script, two events chosen by argv:
//   `session` (SessionStart)      — re-inject the active level if the mode is on (survives clear/compact
//                                    via the matcher); silent when off, because callbell-dev never self-activates.
//   `prompt`  (UserPromptSubmit)  — act on `/callbell-dev:dev [level]` and "normal mode"/"stop dev";
//                                    otherwise keep the active mode present with a one-line reminder.
//
// The dev skill body is the single source of truth. The hook injects only the active level's table row and
// worked example (filter-not-truncate), so injection stays small under Codex's ~2500-token cap. Borrows
// ponytail's filterSkillBodyForMode and per-host emit adapter (field-proven), including their two guards.
//
// Degrades quietly without node: the hook registration guards BOTH shells, so a missing node never blocks a
// session; the dev skill itself is plain markdown and keeps working, only the persistence goes quiet.

const fs = require('fs');
const path = require('path');
const os = require('os');

const LEVELS = ['lite', 'full', 'ultra'];
const DEFAULT_LEVEL = 'full';
const SKILL_PATH = path.join(__dirname, '..', 'skills', 'dev', 'SKILL.md');
const STATE_FILE = '.callbell-dev-active';

// Codex sets PLUGIN_ROOT (and, for compat, CLAUDE_PLUGIN_ROOT); Claude sets only the latter. So PLUGIN_ROOT
// on its own is the host marker (plugin-mechanics §5). Never a flag we pass ourselves — one hooks.json
// serves both manifests, so a flag would be present for both hosts or neither.
const isCodex = Boolean(process.env.PLUGIN_ROOT);

// A single user-level "I am working lazy" bit, deliberately not per-repo. Codex keeps it in its persistent
// PLUGIN_DATA; Claude in its config dir.
function stateDir() {
  if (isCodex && process.env.PLUGIN_DATA) return process.env.PLUGIN_DATA;
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
}
const statePath = () => path.join(stateDir(), STATE_FILE);

function normalizeLevel(s) {
  const v = String(s || '').trim().toLowerCase();
  return LEVELS.includes(v) ? v : null;
}

function readLevel() {
  try { return normalizeLevel(fs.readFileSync(statePath(), 'utf8').trim()); }
  catch { return null; }
}
function setLevel(level) {
  try { fs.mkdirSync(stateDir(), { recursive: true }); fs.writeFileSync(statePath(), level); }
  catch { /* best-effort — the flag is not worth blocking a prompt over */ }
}
function clearLevel() {
  try { fs.unlinkSync(statePath()); } catch { /* already off */ }
}

// Only the intensity-table rows and worked examples are level-specific, both keyed by a level name. A rule
// bullet whose label is not a level (e.g. "- No unrequested abstractions: ...") is normal prose and stays
// verbatim. The quoted-value guard keeps an ordinary bullet that happens to start with a level word from
// being dropped in the other levels.
function filterSkillBodyForLevel(body, level) {
  const withoutFrontmatter = String(body || '').replace(/^---[\s\S]*?---\s*/, '');
  return withoutFrontmatter.split(/\r?\n/).filter((line) => {
    const tableLabel = line.match(/^\|\s*\*\*(.+?)\*\*\s*\|/);
    if (tableLabel) {
      const l = normalizeLevel(tableLabel[1].trim());
      if (l) return l === level;
    }
    const exampleLabel = line.match(/^-\s*([^:]+):\s*"/);
    if (exampleLabel) {
      const l = normalizeLevel(exampleLabel[1].trim());
      if (l) return l === level;
    }
    return true;
  }).join('\n');
}

// Hardcoded fallback for an unreadable skill file, so the mode still means something.
function fallbackInstructions(level) {
  return [
    'Du bist ein fauler Senior-Developer, aktiv bei jeder Antwort, bis umgeschaltet oder gestoppt. Faul heißt',
    'effizient, nicht schludrig: der beste Code ist der, der nie geschrieben wird. Bevor du Code schreibst,',
    'klettere die Leiter und halt auf der ersten Sprosse, die trägt (nachdem du das Problem verstanden hast,',
    'nie statt dessen): 1. Muss das überhaupt existieren? (YAGNI) 2. Schon in dieser Codebasis? Wiederverwenden.',
    '3. Erledigt es die Stdlib? 4. Natives Plattform-Feature? 5. Schon installierte Abhängigkeit? 6. Eine Zeile?',
    '7. Erst dann der minimale Code, der funktioniert. Bugfix = Ursache (root cause): fix die gemeinsame Funktion',
    'einmal, nicht ein Guard pro Aufrufer. Löschen vor Hinzufügen, langweilig vor clever, so wenige Dateien wie',
    'möglich. Vereinfache nie das Verstehen des Problems weg, nie Validierung an Vertrauensgrenzen, nie',
    'Fehlerbehandlung, die Datenverlust verhindert, nie Sicherheit, nie ausdrücklich Verlangtes. Nicht-triviale',
    'Logik lässt einen lauffähigen Check zurück. Steuert, was du baust, nicht wie du redest.',
    '',
    'Umschalten: /callbell-dev:dev lite|full|ultra. Aus: "normaler Modus" oder "stop dev".',
  ].join('\n');
}

function instructions(level) {
  try {
    return filterSkillBodyForLevel(fs.readFileSync(SKILL_PATH, 'utf8'), level);
  } catch {
    return fallbackInstructions(level);
  }
}

// Host-shaped output: Codex needs JSON (additionalContext + a one-line systemMessage badge); Claude reads
// raw stdout as context on both SessionStart and UserPromptSubmit. Printing the Claude way on Codex drops
// the context silently.
function emit(event, level, context) {
  if (isCodex) {
    const out = { systemMessage: 'CALLBELL-DEV:' + String(level).toUpperCase() };
    if (context) out.hookSpecificOutput = { hookEventName: event, additionalContext: context };
    process.stdout.write(JSON.stringify(out));
    return;
  }
  if (context) process.stdout.write(context);
}

// Standalone deactivation only (whole message, trailing punctuation ignored) — matching mid-message turned
// the mode off during ordinary requests like "add a normal mode toggle" (ponytail's lesson).
function isDeactivation(text) {
  const t = String(text || '').trim().toLowerCase().replace(/[.!?\s]+$/, '');
  return t === 'normal mode' || t === 'normaler modus' || t === 'stop dev' ||
    t === 'stop lazy mode' || t === 'lazy off';
}

const event = process.argv[2] === 'prompt' ? 'UserPromptSubmit' : 'SessionStart';

if (event === 'SessionStart') {
  const level = readLevel();
  if (level) {
    try { emit('SessionStart', level, 'CALLBELL-DEV FAUL-MODUS AKTIV — Stufe: ' + level + '\n\n' + instructions(level)); }
    catch { /* stdout closed at hook exit must not surface as a failure */ }
  }
  process.exit(0);
}

// UserPromptSubmit: read the prompt from stdin, then act.
let input = '';
let done = false;
function finish() {
  if (done) return;
  done = true;
  let prompt = '';
  try { prompt = String(JSON.parse(input.replace(/^﻿/, '')).prompt || '').trim(); }
  catch { /* no or invalid JSON on stdin */ }
  const lower = prompt.toLowerCase();

  try {
    // An explicit switch: /callbell-dev:dev [level] (also $callbell-dev:dev, @…, or bare /dev).
    const m = lower.match(/^[/@$](?:callbell-dev:)?dev\b\s*(\w+)?/);
    if (m) {
      const arg = m[1] || '';
      if (arg === 'off' || arg === 'stop' || isDeactivation(arg)) {
        clearLevel();
        emit('UserPromptSubmit', 'off', 'CALLBELL-DEV FAUL-MODUS AUS');
        return;
      }
      const level = normalizeLevel(arg) || DEFAULT_LEVEL;
      setLevel(level);
      // First activation carries the full filtered body: no default-on SessionStart loaded it, because the
      // pack does not self-activate.
      emit('UserPromptSubmit', level, 'CALLBELL-DEV FAUL-MODUS AN — Stufe: ' + level + '\n\n' + instructions(level));
      return;
    }
    if (isDeactivation(lower)) {
      clearLevel();
      emit('UserPromptSubmit', 'off', 'CALLBELL-DEV FAUL-MODUS AUS');
      return;
    }
    // Ordinary prompt: a one-line reminder keeps the active mode from drifting between turns without
    // re-injecting the whole body every turn. The full body rode in at activation and rides in again at
    // each compact via SessionStart.
    const level = readLevel();
    if (level) {
      emit('UserPromptSubmit', level, 'CALLBELL-DEV FAUL-MODUS AKTIV — Stufe: ' + level + ' (bleibt aktiv bis "normaler Modus").');
    }
  } catch { /* best-effort, never block the prompt */ }
}
process.stdin.on('data', c => { input += c; });
process.stdin.on('end', finish);
// Never hang the session: on Windows the PowerShell wrapper can swallow the piped stdin so 'end' never
// fires. Recover whatever arrived after a short fallback. unref() keeps the timer off the normal path.
process.stdin.on('error', () => { finish(); process.exit(0); });
setTimeout(() => { finish(); process.exit(0); }, 1000).unref();
