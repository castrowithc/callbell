#!/usr/bin/env node
'use strict';

// One-way Telegram ping: the agent has stopped and is waiting for the user, so the user learns it away
// from the terminal. A single POST to the Telegram bot API, no host wrapper, portable by construction.
//
//   node callbell-telegram-notify.js            — hook mode: read the Notification payload on stdin, send,
//                                                  and stay SILENT no matter what (never block a session).
//   node callbell-telegram-notify.js --init      — lay down ~/.callbell/ and a skeleton telegram.json the
//                                                  user only fills with their values. Reports and exits.
//   node callbell-telegram-notify.js --test      — send a test ping and REPORT the outcome; on success turn
//                                                  the channel on. Ignores the enabled switch (you test
//                                                  before turning it on).
//
// The secret lives outside every repo, in the host-neutral ~/.callbell/telegram.json
// ({ enabled, token, chat_id }), the same store the rest of callbell's user-global state uses. In hook mode
// this script only READS the secret and never echoes the token into output, a log, or an error (the bot URL
// carries the token, so no error message ever includes the URL). --init writes only a skeleton with empty
// values, and --test writes back only the enabled flag; neither ever writes a token, so the token reaches
// the file only by the user's own hand and never through the session. An off, absent, or unfilled config is
// a normal quiet state, not an error: the session runs exactly as before.
//
// Only Claude is auto-wired (its Notification/idle_prompt event is the "waiting for you" signal). Codex has
// no attention event, only a per-turn Stop, so it is deliberately not wired; this script stays host-neutral
// and would send from Codex too if ever invoked.

const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');
const { execFileSync } = require('child_process');

const args = process.argv.slice(2);
const TEST = args.includes('--test');
const INIT = args.includes('--init');
const TALK = TEST || INIT; // both talk to the user; hook mode is mute
const CONFIG = path.join(os.homedir(), '.callbell', 'telegram.json');
const BODY_MAX = 500; // keep the push scannable on a phone; Telegram's own hard cap is 4096

// --test/--init talk to the user; hook mode is mute and exits 0 whatever happened, so it never blocks.
function say(msg) { if (TALK) process.stdout.write(msg + '\n'); }
function done(code) { process.exit(TALK ? code : 0); }

// --- --init: lay down the base the user only fills -------------------------
// The folder and a skeleton with empty values, so the user never has to create either by hand; they open
// the file and paste their token and chat id. Written with enabled:false, so an unfilled skeleton is off.
if (INIT) {
  fs.mkdirSync(path.dirname(CONFIG), { recursive: true });
  if (fs.existsSync(CONFIG)) {
    say('Config already at ' + CONFIG + '. Fill in "token" and "chat_id" if they are empty, then run --test.');
  } else {
    fs.writeFileSync(CONFIG, JSON.stringify({ enabled: false, token: '', chat_id: '' }, null, 2) + '\n');
    say('Laid down a skeleton at ' + CONFIG + '. Open it, paste your bot token and chat id, then run --test.');
  }
  done(0);
}

// --- config -----------------------------------------------------------------
let cfg;
try { cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8')); }
catch { say('No config at ' + CONFIG + '. Run --init to lay down a skeleton, then fill it in.'); done(0); }

const configured = !!(cfg && cfg.token && cfg.chat_id);
// Explicit off switch: enabled:false silences the channel without losing the saved values. A file that has
// real values but no enabled key stays on, so a hand-written config keeps working.
const on = configured && cfg.enabled !== false;

if (!TEST) {
  if (!on) done(0);                 // hook mode: silent unless truly on
} else if (!configured) {
  say('Fill "token" and "chat_id" in ' + CONFIG + ' first (run --init to lay down a skeleton).');
  done(1);                          // test mode ignores the switch, but needs real values
}

// --- who is ringing ---------------------------------------------------------
// One key serves many machines and agents, so every message must say which session rang. Codex sets
// PLUGIN_ROOT, Claude sets only CLAUDE_PLUGIN_ROOT — so PLUGIN_ROOT on its own is the Codex marker.
const agent = process.env.PLUGIN_ROOT ? 'Codex' : 'Claude Code';
const host = os.hostname();

// The Notification payload arrives on stdin in hook mode; carries cwd and the message text.
let payload = {};
if (!TEST && !process.stdin.isTTY) {
  try {
    const raw = fs.readFileSync(0, 'utf8').replace(/^﻿/, ''); // tolerate a stdin BOM
    if (raw) payload = JSON.parse(raw);
  } catch { /* no or invalid JSON on stdin: fall back to defaults below */ }
}

const cwd = (typeof payload.cwd === 'string' && payload.cwd) ? payload.cwd : process.cwd();
const dir = path.basename(cwd);

// Branch straight from git, no dependency beyond it; a detached head falls back to the short sha, and
// anything that is not a repo simply drops the /branch tail.
let branch = null;
try {
  branch = execFileSync('git', ['-C', cwd, 'rev-parse', '--abbrev-ref', 'HEAD'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  if (branch === 'HEAD') {
    branch = execFileSync('git', ['-C', cwd, 'rev-parse', '--short', 'HEAD'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  }
} catch { /* not a repo, or no git: no branch line */ }

let body = TEST ? 'Test ping from callbell. The channel works.'
  : String(payload.message || '').trim() || 'Waiting for your input.';
if (body.length > BODY_MAX) body = body.slice(0, BODY_MAX - 1).trimEnd() + '…';

// Dense header first, so the lock-screen preview already tells you which session rang before you open it.
const project = branch ? dir + '/' + branch : dir;
const text = '🔔 ' + host + ' · ' + agent + '\n' + project + '\n\n' + body;

// --- send -------------------------------------------------------------------
// Plain text, no parse_mode: branch names and message bodies carry characters that would break MarkdownV2.
const data = JSON.stringify({ chat_id: cfg.chat_id, text });
const req = https.request({
  hostname: 'api.telegram.org',
  path: '/bot' + cfg.token + '/sendMessage',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
  timeout: 8000,
}, (res) => {
  let out = '';
  res.on('data', (c) => { out += c; });
  res.on('end', () => {
    if (res.statusCode === 200) {
      // A confirmed send turns the channel on. Writes back only the flag, never the token.
      if (TEST && cfg.enabled !== true) {
        try { cfg.enabled = true; fs.writeFileSync(CONFIG, JSON.stringify(cfg, null, 2) + '\n'); }
        catch { /* the send worked; enabling is best-effort */ }
      }
      say('Sent. Check your Telegram.' + (TEST ? ' The channel is on.' : ''));
      done(0);
    }
    // Report Telegram's own error text, never the request URL (it holds the token).
    let why = 'HTTP ' + res.statusCode;
    try { const j = JSON.parse(out); if (j.description) why = j.description; } catch { /* keep the status */ }
    say('Telegram refused the message: ' + why);
    done(1);
  });
});
req.on('error', (e) => { say('Could not reach Telegram: ' + (e.code || e.message)); done(1); });
req.on('timeout', () => { req.destroy(); say('Telegram request timed out.'); done(1); });
req.write(data);
req.end();
