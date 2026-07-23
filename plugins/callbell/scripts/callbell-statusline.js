#!/usr/bin/env node
'use strict';
// callbell statusline renderer for Claude Code.
// Reads the session JSON on stdin, the widget config from ~/.callbell/statusline.json, and prints one or
// more lines to stdout. WIDGETS = code (how each renders); the config = data (which, order, layout).
// The setup skill copies this file to ~/.callbell/statusline.js so the statusLine command has a stable
// path that survives plugin updates.

const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// ---------------- config ----------------
const CONFIG_FILE = path.join(os.homedir(), '.callbell', 'statusline.json');
const DEFAULT_WIDGETS = ['model', 'thinking', 'dir', 'branch', 'diff', 'out', 'context', 'cost', 'reset', 'weekly-reset', 'method'];

function loadConfig() {
    try {
        const c = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        return {
            layout: c.layout === 'fixed' ? 'fixed' : 'wrap',
            widgets: Array.isArray(c.widgets) && c.widgets.length ? c.widgets : DEFAULT_WIDGETS
        };
    } catch { return { layout: 'wrap', widgets: DEFAULT_WIDGETS }; }
}

// ---------------- input ----------------
let data = {};
try { data = JSON.parse(fs.readFileSync(0, 'utf8')); } catch { }

const noColor = !!process.env.NO_COLOR;
const cols = parseInt(process.env.COLUMNS, 10) || 999;

// ---------------- colours ----------------
const C = {
    reset: '\x1b[0m', dim: '\x1b[2m', cyan: '\x1b[36m', green: '\x1b[32m',
    yellow: '\x1b[33m', orange: '\x1b[38;5;208m', red: '\x1b[38;5;196m',
    diffgreen: '\x1b[38;5;42m', diffred: '\x1b[38;5;203m'
};
const seg = (plain, color) => ({ plain, colored: noColor ? plain : color + plain + C.reset });
const k = (n) => Math.round(n / 1000) + 'K';

function hms(epochSec, withDays) {
    let s = epochSec - Math.floor(Date.now() / 1000);
    if (s < 0) s = 0;
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    return withDays ? `${d}d ${h}h ${m}m` : `${Math.floor(s / 3600)}h ${m}m`;
}

// ---------------- git (cached per session, 5s) ----------------
function run(cwd, cmd) {
    try { return execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
    catch { return null; }
}

function gitInfo(d) {
    const cwd = (d.workspace && d.workspace.current_dir) || d.cwd;
    if (!cwd) return null;
    const cache = path.join(os.tmpdir(), `callbell-sl-git-${d.session_id || 'nosession'}.json`);
    try {
        if (Date.now() - fs.statSync(cache).mtimeMs < 5000) return JSON.parse(fs.readFileSync(cache, 'utf8'));
    } catch { }

    let info = null;
    if (run(cwd, 'git --no-optional-locks rev-parse --git-dir') !== null) {
        const branch = run(cwd, 'git --no-optional-locks rev-parse --abbrev-ref HEAD');
        let add = 0, del = 0;
        const numstat = run(cwd, 'git --no-optional-locks diff HEAD --numstat') || '';
        for (const line of numstat.split('\n')) {
            const m = line.match(/^(\d+)\t(\d+)\t/);
            if (m) { add += +m[1]; del += +m[2]; }
        }
        const dirty = run(cwd, 'git --no-optional-locks status --porcelain');
        let sync;
        if (dirty && dirty.trim() !== '') sync = 'commit needed';
        else {
            const ahead = run(cwd, 'git --no-optional-locks rev-list --count @{u}..HEAD');
            sync = ahead === null ? 'pushed' : (parseInt(ahead, 10) > 0 ? 'push needed' : 'pushed');
        }
        info = { branch, add, del, sync };
    }
    try { fs.writeFileSync(cache, JSON.stringify(info)); } catch { }
    return info;
}

// ---------------- widgets: (data, git) -> {plain, colored} | null ----------------
const WIDGETS = {
    model: (d) => {
        const m = d.model && (d.model.display_name || d.model.id);
        return m ? seg('Model: ' + m.replace(/\s*\(.*\)$/, ''), C.cyan) : null;
    },
    thinking: (d) => {
        const e = d.effort && d.effort.level;
        return e ? seg('Thinking: ' + e, C.dim) : null;
    },
    dir: (d) => {
        const cwd = (d.workspace && d.workspace.current_dir) || d.cwd;
        return cwd ? seg('Dir: ' + path.basename(cwd), C.dim) : null;
    },
    branch: (d, g) => (g && g.branch) ? seg('Branch: ⎎ ' + g.branch, C.cyan) : null,
    diff: (d, g) => {
        if (!g) return null;
        const plain = `Diff: +${g.add} -${g.del} - ${g.sync}`;
        const colored = noColor ? plain
            : `${C.dim}Diff:${C.reset} ${C.diffgreen}+${g.add}${C.reset} ${C.diffred}-${g.del}${C.reset} ${C.dim}- ${g.sync}${C.reset}`;
        return { plain, colored };
    },
    out: (d) => {
        const o = d.context_window && d.context_window.total_output_tokens;
        return o != null ? seg('Out: ' + k(o), C.dim) : null;
    },
    context: (d) => {
        const cw = d.context_window || {};
        let tok = cw.total_input_tokens;
        if (tok == null && cw.current_usage) {
            const u = cw.current_usage;
            tok = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
        }
        const size = cw.context_window_size;
        if (tok == null || !size) return null;
        const pct = Math.round(100 * tok / size);
        const color = pct > 70 ? C.red : pct > 45 ? C.orange : pct > 35 ? C.yellow : C.green;
        const w = 10, f = Math.max(0, Math.min(w, Math.round(pct * w / 100)));
        const bar = '▓'.repeat(f) + '░'.repeat(w - f);
        const plain = `In: ${bar} ${pct}% (${k(tok)}/${k(size)})`;
        const colored = noColor ? plain
            : `${C.dim}In:${C.reset} ${color}${bar} ${pct}%${C.reset} ${C.dim}(${k(tok)}/${k(size)})${C.reset}`;
        return { plain, colored };
    },
    cost: (d) => {
        const c = d.cost && d.cost.total_cost_usd;
        return c != null ? seg('💰$' + Number(c).toFixed(2), C.green) : null;
    },
    reset: (d) => {
        const r = d.rate_limits && d.rate_limits.five_hour && d.rate_limits.five_hour.resets_at;
        return r != null ? seg('Reset: ' + hms(r, false), C.dim) : null;
    },
    'weekly-reset': (d) => {
        const r = d.rate_limits && d.rate_limits.seven_day && d.rate_limits.seven_day.resets_at;
        return r != null ? seg('Weekly Reset: ' + hms(r, true), C.dim) : null;
    },
    method: (d) => seg('Method: ' + (d.rate_limits ? 'Sub' : 'API'), C.dim)
};

// ---------------- compose ----------------
const cfg = loadConfig();
const git = gitInfo(data);
const render = (type) => (WIDGETS[type] ? WIDGETS[type](data, git) : null);
const SEP = '  ';
const rowText = (segs) => segs.map(s => s.colored).join(SEP);

let out;
if (cfg.layout === 'fixed') {
    const active = new Set(cfg.widgets);
    const ROWS = [
        ['model', 'thinking', 'dir'],
        ['branch', 'diff'],
        ['out', 'context', 'cost'],
        ['method', 'reset', 'weekly-reset']
    ];
    out = ROWS
        .map(row => row.filter(t => active.has(t)).map(render).filter(Boolean))
        .filter(segs => segs.length)
        .map(rowText)
        .join('\n');
} else {
    const segs = cfg.widgets.map(render).filter(Boolean);
    const avail = cols - 2;
    const width = (list) => list.reduce((n, s, i) => n + s.plain.length + (i > 0 ? SEP.length : 0), 0);
    const lines = [];
    let line = [];
    for (const s of segs) {
        if (line.length && width([...line, s]) > avail) { lines.push(line); line = []; }
        line.push(s);
    }
    if (line.length) lines.push(line);
    out = lines.map(rowText).join('\n');
}

process.stdout.write(out);
