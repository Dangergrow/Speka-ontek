// ==================== ONTEK v6.0.0 ====================
const DEFAULT_COLS = ['Артикул','Наименование','Ко-во, шт','Цена','Стоимость'];

let idC = 0, actId = null, hist = [], redoStack = [];
let theme = 'light', colorTheme = 'blue';
let recordingKey = null, recordingHk = null;
let activeWorkspace = 1;
let usdRate = 0, eurRate = 0;
let sortState = {};
let colWidths = {};
let selectedRows = {};
let lastSearch = { query: '', matches: [], idx: 0 };
let lastSelectedRow = null;
let cellSel = { tid: null, r1: -1, c1: -1, r2: -1, c2: -1, anchorR: -1, anchorC: -1, dragging: false };
let activeTbCell = null;

let tableSettings = {
    rowHeight: 38, fontSize: 13,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    padding: 10, wrapText: false,
    showRowNums: true, showTotals: true,
    zebra: true, vGrid: true, hGrid: true, rounded: true
};
let notifySettings = { enabled: true, position: 'toast-bottom-right', duration: 3000 };
let exportTheme = 'blue';

const workspaces = {};
for (let i = 1; i <= 5; i++) workspaces[i] = [];

const Q = s => document.querySelector(s);

const ICONS = {
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    plusBox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
    minusBox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
    convert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l4 4-4 4"/><path d="M21 7H9a4 4 0 0 0-4 4v1"/><path d="M7 21l-4-4 4-4"/><path d="M3 17h12a4 4 0 0 0 4-4v-1"/></svg>',
    paste: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="12" height="4" rx="1"/><path d="M16 5h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v5h-5"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16" y2="16"/></svg>',
    ruble: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4v16"/><path d="M8 4h5a4 4 0 0 1 0 8H8"/><path d="M6 16h10"/><path d="M6 20h10"/></svg>',
    dollar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 6a4 4 0 0 0-4-2h-2a4 4 0 0 0 0 8h2a4 4 0 0 1 0 8h-2a4 4 0 0 1-4-2"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>',
    undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6.7 3L3 13"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.9" y1="4.9" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.1" y2="19.1"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="6.3" y1="17.7" x2="4.9" y2="19.1"/><line x1="19.1" y1="4.9" x2="17.7" y2="6.3"/></svg>',
    palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2a10 10 0 1 0 0 20c1 0 2-.8 2-2 0-.5-.2-1-.5-1.4-.3-.4-.5-.9-.5-1.4a2 2 0 0 1 2-2h2.5A4.5 4.5 0 0 0 22 11c0-5-4.5-9-10-9z"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
};

const COLOR_PALETTE = [
    null,
    '#000000','#374151','#6b7280','#9ca3af','#d1d5db','#f3f4f6','#ffffff',
    '#dc2626','#ea580c','#d97706','#ca8a04','#65a30d','#16a34a','#059669','#0891b2',
    '#0284c7','#2563eb','#4f46e5','#7c3aed','#9333ea','#c026d3','#db2777','#e11d48',
    '#fecaca','#fed7aa','#fde68a','#fef08a','#d9f99d','#bbf7d0','#a7f3d0','#a5f3fc',
    '#bae6fd','#bfdbfe','#c7d2fe','#ddd6fe','#e9d5ff','#f5d0fe','#fbcfe8','#fecdd3'
];

const EXPORT_THEMES = {
    blue:   { name: 'Синяя',   header: 'FF64748B', headerText: 'FFFFFFFF', rowOdd: 'FFEFF6FF', rowEven: 'FFDBEAFE', total: 'FFE2E8F0', border: 'FFBFDBFE', borderDark: 'FF475569', section: 'FFDBEAFE', sectionText: 'FF1E293B', preview: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
    green:  { name: 'Зелёная', header: 'FF047857', headerText: 'FFFFFFFF', rowOdd: 'FFECFDF5', rowEven: 'FFD1FAE5', total: 'FFA7F3D0', border: 'FF6EE7B7', borderDark: 'FF065F46', section: 'FFD1FAE5', sectionText: 'FF065F46', preview: 'linear-gradient(135deg,#10b981,#047857)' },
    orange: { name: 'Оранжевая', header: 'FFC2410C', headerText: 'FFFFFFFF', rowOdd: 'FFFFF7ED', rowEven: 'FFFED7AA', total: 'FFFED7AA', border: 'FFFDBA74', borderDark: 'FF9A3412', section: 'FFFED7AA', sectionText: 'FF7C2D12', preview: 'linear-gradient(135deg,#f59e0b,#ea580c)' },
    gray:   { name: 'Серая',   header: 'FF334155', headerText: 'FFFFFFFF', rowOdd: 'FFF8FAFC', rowEven: 'FFF1F5F9', total: 'FFE2E8F0', border: 'FFCBD5E1', borderDark: 'FF1E293B', section: 'FFE2E8F0', sectionText: 'FF1E293B', preview: 'linear-gradient(135deg,#64748b,#334155)' },
    dark:   { name: 'Тёмная',  header: 'FF0F172A', headerText: 'FFFFFFFF', rowOdd: 'FF1E293B', rowEven: 'FF334155', total: 'FF475569', border: 'FF64748B', borderDark: 'FF0F172A', section: 'FF334155', sectionText: 'FFF1F5F9', preview: 'linear-gradient(135deg,#1e293b,#0f172a)' }
};

const RU_KEYS = { 'Ф':'A','А':'A','В':'D','Д':'D','С':'C','Ц':'C','Ч':'X','Х':'X','К':'R','Р':'R','М':'V','Ж':'V','Щ':'O','О':'O','Г':'U','У':'U','Ы':'S','Я':'Z','Ь':'DELETE','Т':'DELETE','1':'1','2':'2','3':'3','4':'4','5':'5' };

const DEFAULT_HOTKEYS = { addRow:'A', delRow:'D', addCol:'C', delCol:'X', recalc:'R', paste:'V', load:'O', newRUB:'1', newUSD:'2', dup:'U', clear:'DELETE', undo:'Z', save:'S', convert:'K' };
const KEY_LABELS = { addRow:'Добавить строку', delRow:'Удалить строку', addCol:'Добавить колонку', delCol:'Удалить колонку', recalc:'Пересчитать', paste:'Вставить', load:'Загрузить', newRUB:'Новая RUB', newUSD:'Новая USD', dup:'Дублировать', clear:'Очистить', undo:'Отменить', save:'Сохранить', convert:'Конвертировать валюту' };

const COLOR_THEMES = [
    { id:'blue',   name:'Синяя',      desc:'Классика',  gradient:'linear-gradient(135deg,#6366f1,#4f46e5)', letter:'S' },
    { id:'green',  name:'Зелёная',    desc:'Природа',   gradient:'linear-gradient(135deg,#10b981,#059669)', letter:'G' },
    { id:'purple', name:'Фиолетовая', desc:'Креатив',   gradient:'linear-gradient(135deg,#8b5cf6,#7c3aed)', letter:'P' },
    { id:'orange', name:'Оранжевая',  desc:'Тепло',     gradient:'linear-gradient(135deg,#f59e0b,#d97706)', letter:'O' },
    { id:'rose',   name:'Розовая',    desc:'Яркая',     gradient:'linear-gradient(135deg,#f43f5e,#e11d48)', letter:'R' },
    { id:'slate',  name:'Серая',      desc:'Строгая',   gradient:'linear-gradient(135deg,#475569,#1e293b)', letter:'N' }
];

let hotkeys = { ...DEFAULT_HOTKEYS };

// ========== UTILS ==========
function toast(msg, type = 'success', duration) {
    if (!notifySettings.enabled) return;
    const container = Q('#toastContainer'); if (!container) return;
    const dur = duration || notifySettings.duration;
    const icons = { success:'✓', error:'✕', info:'ℹ', warning:'⚠' };
    const el = document.createElement('div');
    el.className = `toast-item ${type}`;
    el.style.setProperty('--toast-duration', dur + 'ms');
    el.innerHTML = `<div class="toast-icon">${icons[type] || '✓'}</div><div class="toast-message">${escapeHtml(msg)}</div><div class="toast-progress"></div>`;
    container.appendChild(el);
    setTimeout(() => { el.classList.add('removing'); setTimeout(() => el.remove(), 250); }, dur);
}
function updateToastPosition() { const c = Q('#toastContainer'); if (c) c.className = 'toast-container ' + notifySettings.position; }
function escapeHtml(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function setStatus(text, type = 'ok') {
    const el = Q('#statusLeft'); if (!el) return;
    const dot = type === 'busy' ? 'var(--warning)' : type === 'error' ? 'var(--danger)' : 'var(--success)';
    el.innerHTML = `<span class="status-dot" style="background:${dot}"></span><span class="status-text">${escapeHtml(text)}</span>`;
}
function updateStatusBar() {
    const td = active(), center = Q('#statusCenter'); if (!center) return;
    if (!td) { center.innerHTML = ''; return; }
    const rows = td.rows.length, total = sumT(td).toFixed(2), curr = td.currency;
    const sel = cellSel.tid === td.id && cellSel.r1 >= 0
        ? `<span class="status-stat">Выделено: <b>${Math.abs(cellSel.r2 - cellSel.r1) + 1}×${Math.abs(cellSel.c2 - cellSel.c1) + 1}</b></span>` : '';
    center.innerHTML = `<span class="status-stat">Строк: <b>${rows}</b></span><span class="status-stat">Итого: <b>${total} ${curr}</b></span>${sel}`;
}
function active() { const ws = workspaces[activeWorkspace]; if (actId === null && ws.length) actId = ws[0].id; return ws.find(t => t.id === actId) || null; }
function setAct(id) { actId = id; document.querySelectorAll('.card').forEach(c => c.classList.toggle('active', +c.dataset.tid === actId)); updateStatusBar(); }
function getArea() { return Q('#workspaceArea_' + activeWorkspace); }
function upEmpty() {
    const a = getArea(); if (!a) return;
    const e = a.querySelector('.empty-state');
    if (!workspaces[activeWorkspace].length && !e) a.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-title">Нет таблиц</div><div class="empty-state-desc">Создайте новую — <span class="empty-state-kbd">Shift</span>+<span class="empty-state-kbd">1</span> RUB или <span class="empty-state-kbd">Shift</span>+<span class="empty-state-kbd">2</span> USD</div></div>`;
    else if (workspaces[activeWorkspace].length && e) e.remove();
}
function ci(cols, kw) { return cols.findIndex(c => c.toLowerCase().includes(kw.toLowerCase())); }
function cln(s) {
    if (!s) return '';
    let x = String(s).trim().replace(/\s/g, '').replace(/,/g, '.').replace(/[^\d.\-]/g, '');
    const p = x.split('.'); if (p.length > 2) x = p[0] + '.' + p.slice(1).join('');
    if (x.includes('-') && x.indexOf('-') > 0) x = x.replace(/-/g, '');
    return x;
}
function pn(v) { const c = cln(v); return (c === '' || c === '-' || c === '.') ? NaN : parseFloat(c); }
function isNumericCol(name) { const n = String(name || '').toLowerCase(); return n.includes('ко-во') || n.includes('количество') || n.startsWith('цена') || n.startsWith('стоимость'); }
function getQi(cols) { return ci(cols, 'Ко-во') >= 0 ? ci(cols, 'Ко-во') : ci(cols, 'Количество'); }
function calc(row, cols) {
    const qi = getQi(cols), pi = ci(cols, 'Цена'), ti = ci(cols, 'Стоимость');
    if (qi >= 0 && pi >= 0 && ti >= 0) row[ti] = ((pn(row[qi]) || 0) * (pn(row[pi]) || 0)).toFixed(2);
}
function sumT(td) { const ti = ci(td.cols, 'Стоимость'); if (ti < 0) return 0; return td.rows.reduce((s, r) => s + (pn(r[ti]) || 0), 0); }
function formatHeader(h, currency) {
    const t = String(h).trim();
    if (/^цена[,.]?\s*(с\s+ндс)?\s*$/i.test(t)) return `Цена, ${currency} с НДС`;
    if (/^стоимость[,.]?\s*(с\s+ндс)?\s*$/i.test(t)) return `Стоимость, ${currency} с НДС`;
    return h;
}
function cA(r, c) { let s = ''; while (c > 0) { c--; s = String.fromCharCode(65 + (c % 26)) + s; c = Math.floor(c / 26); } return s + r; }
function hkDisplay(key) { if (!key) return '—'; if (key === 'DELETE') return 'Del'; return key; }
function isEmptyRow(row) { return !row || row.every(c => String(c ?? '').trim() === ''); }

// ========== CELL STYLES ==========
function getCellStyle(td, ri, ci) { if (!td.styles) td.styles = {}; return td.styles[ri + ':' + ci] || {}; }
function setCellStyle(td, ri, ci, patch) {
    if (!td.styles) td.styles = {};
    const key = ri + ':' + ci;
    td.styles[key] = { ...(td.styles[key] || {}), ...patch };
    const s = td.styles[key];
    Object.keys(s).forEach(k => { if (s[k] === null || s[k] === undefined || s[k] === false || s[k] === '') delete s[k]; });
    if (Object.keys(s).length === 0) delete td.styles[key];
    const cell = td.el.querySelector(`.cell[data-r="${ri}"][data-c="${ci}"]`);
    if (cell) applyStyleToCell(cell, s);
    saveNow();
}
function applyStyleToCell(cell, style) {
    if (!cell) return;
    cell.classList.remove('cell-bold', 'cell-italic', 'cell-underline', 'cell-strike');
    if (style.bold) cell.classList.add('cell-bold');
    if (style.italic) cell.classList.add('cell-italic');
    if (style.underline) cell.classList.add('cell-underline');
    if (style.strike) cell.classList.add('cell-strike');
    cell.style.textAlign = style.align || '';
    cell.style.color = style.color || '';
    cell.style.background = style.bg || '';
    cell.style.fontSize = style.fontSize ? (style.fontSize + 'px') : '';
    cell.style.fontFamily = style.fontFamily || '';
}
function forEachSelectedCell(td, fn) {
    if (!cellSel.tid || cellSel.tid !== td.id || cellSel.r1 < 0) return;
    const r1 = Math.min(cellSel.r1, cellSel.r2), r2 = Math.max(cellSel.r1, cellSel.r2);
    const c1 = Math.min(cellSel.c1, cellSel.c2), c2 = Math.max(cellSel.c1, cellSel.c2);
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) fn(r, c);
}

// ========== MERGES ==========
function findMergeContaining(td, ri, ci) { if (!td.merges) return null; return td.merges.find(m => ri >= m.r1 && ri <= m.r2 && ci >= m.c1 && ci <= m.c2); }
function isMergeCovered(td, ri, ci) { const m = findMergeContaining(td, ri, ci); if (!m) return false; return !(m.r1 === ri && m.c1 === ci); }
function mergeRect(td, r1, c1, r2, c2) {
    if (r1 > r2) [r1, r2] = [r2, r1];
    if (c1 > c2) [c1, c2] = [c2, c1];
    if (r1 === r2 && c1 === c2) { toast('Нужно выделить минимум 2 ячейки', 'warning'); return; }
    td.merges = (td.merges || []).filter(m => !(!(m.r2 < r1 || m.r1 > r2 || m.c2 < c1 || m.c1 > c2)));
    const val = td.rows[r1][c1];
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) { if (r === r1 && c === c1) continue; td.rows[r][c] = ''; }
    td.rows[r1][c1] = val;
    td.merges.push({ r1, c1, r2, c2 });
    render(td);
    toast(`Объединено ${(r2 - r1 + 1) * (c2 - c1 + 1)} ячеек`, 'success');
}
function unmergeAt(td, ri, ci) {
    const m = findMergeContaining(td, ri, ci);
    if (!m) { toast('Не объединена', 'warning'); return; }
    td.merges = td.merges.filter(x => x !== m);
    render(td);
    toast('Разъединено', 'info');
}

// ========== TABLE SETTINGS ==========
function applyTableSettings() {
    const root = document.documentElement;
    root.style.setProperty('--font-size-table', tableSettings.fontSize + 'px');
    root.style.setProperty('--font-family', tableSettings.fontFamily);
    root.style.setProperty('--row-height', tableSettings.rowHeight + 'px');
    root.style.setProperty('--cell-padding', tableSettings.padding + 'px');
    root.style.setProperty('--wrap-text', tableSettings.wrapText ? 'pre-wrap' : 'nowrap');
    document.body.classList.toggle('no-zebra', !tableSettings.zebra);
    document.body.classList.toggle('no-gridlines', !tableSettings.vGrid);
    document.body.classList.toggle('no-hgridlines', !tableSettings.hGrid);
    document.body.classList.toggle('no-rounded', !tableSettings.rounded);
    Object.keys(workspaces).forEach(ws => { workspaces[ws].forEach(td => render(td)); });
    saveNow();
}
function resetTableSettings() {
    tableSettings = { rowHeight: 38, fontSize: 13, fontFamily: "'Segoe UI', system-ui, sans-serif", padding: 10, wrapText: false, showRowNums: true, showTotals: true, zebra: true, vGrid: true, hGrid: true, rounded: true };
    colWidths = {};
    applyAllSettings();
    toast('Настройки сброшены', 'success');
}

// ========== PERSISTENCE ==========
function saveNow() {
    const s = { theme, color: colorTheme, hotkeys, activeWorkspace, tableSettings, notifySettings, colWidths, exportTheme };
    const json = JSON.stringify(s);
    localStorage.setItem('ontek_settings', json);
    if (window.pywebview && window.pywebview.api) window.pywebview.api.save_settings(json).catch(() => {});
}
async function loadSettings() {
    for (let i = 0; i < 30; i++) { if (window.pywebview && window.pywebview.api) break; await new Promise(r => setTimeout(r, 100)); }
    let raw = null;
    if (window.pywebview && window.pywebview.api) {
        try { raw = await window.pywebview.api.load_settings(); } catch (e) {}
    }
    if (!raw || raw === '{}') raw = localStorage.getItem('ontek_settings');
    if (raw && raw !== '{}') {
        try {
            const s = JSON.parse(raw);
            if (s.theme) theme = s.theme;
            if (s.color) colorTheme = s.color;
            if (s.hotkeys) hotkeys = s.hotkeys;
            if (s.activeWorkspace) activeWorkspace = s.activeWorkspace;
            if (s.tableSettings) tableSettings = { ...tableSettings, ...s.tableSettings };
            if (s.notifySettings) notifySettings = { ...notifySettings, ...s.notifySettings };
            if (s.colWidths) colWidths = s.colWidths;
            if (s.exportTheme) exportTheme = s.exportTheme;
        } catch (e) {}
    }
}
function updateAllHKDisplays() {
    document.querySelectorAll('.s-hotkey[data-hk]').forEach(el => {
        const k = el.dataset.hk;
        if (hotkeys[k]) el.textContent = 'Shift+' + hkDisplay(hotkeys[k]);
    });
}
function applyAllSettings() {
    document.body.classList.toggle('dark', theme === 'dark');
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add('theme-' + colorTheme);
    const ti = Q('#themeIcon'); if (ti) ti.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
    document.querySelectorAll('.workspace-tab').forEach(t => t.classList.toggle('active', +t.dataset.ws === activeWorkspace));
    document.querySelectorAll('.workspace-panel').forEach(p => p.classList.toggle('active', +p.dataset.ws === activeWorkspace));
    document.querySelectorAll('.theme-card').forEach(c => c.classList.toggle('active', c.dataset.theme === colorTheme));
    document.querySelectorAll('.export-theme').forEach(c => c.classList.toggle('active', c.dataset.theme === exportTheme));
    updateAllHKDisplays();
    updateToastPosition();
    const set = (id, v) => { const el = Q('#' + id); if (el) el.value = v; };
    const setC = (id, v) => { const el = Q('#' + id); if (el) el.checked = v; };
    set('setRowHeight', tableSettings.rowHeight); Q('#valRowHeight') && (Q('#valRowHeight').textContent = tableSettings.rowHeight + ' px');
    set('setFontSize', tableSettings.fontSize); Q('#valFontSize') && (Q('#valFontSize').textContent = tableSettings.fontSize + ' px');
    set('setFontFamily', tableSettings.fontFamily);
    set('setPadding', tableSettings.padding); Q('#valPadding') && (Q('#valPadding').textContent = tableSettings.padding + ' px');
    setC('setWrapText', tableSettings.wrapText); setC('setShowRowNums', tableSettings.showRowNums);
    setC('setShowTotals', tableSettings.showTotals); setC('setZebra', tableSettings.zebra);
    setC('setVGrid', tableSettings.vGrid); setC('setHGrid', tableSettings.hGrid); setC('setRounded', tableSettings.rounded);
    setC('setShowToasts', notifySettings.enabled);
    set('setToastPos', notifySettings.position); set('setToastDur', notifySettings.duration);
    Q('#valToastDur') && (Q('#valToastDur').textContent = (notifySettings.duration / 1000).toFixed(1) + ' s');
    applyTableSettings();
}
function switchWorkspace(ws) { activeWorkspace = ws; actId = null; clearCellSelection(); applyAllSettings(); saveNow(); updateStatusBar(); }
function toggleTheme() { theme = theme === 'light' ? 'dark' : 'light'; applyAllSettings(); saveNow(); }
function setColorTheme(t) { colorTheme = t; applyAllSettings(); saveNow(); }
function setExportTheme(t) { exportTheme = t; document.querySelectorAll('.export-theme').forEach(c => c.classList.toggle('active', c.dataset.theme === t)); saveNow(); toast('Тема экспорта: ' + EXPORT_THEMES[t].name, 'success'); }

// ========== CURRENCY ==========
function convertCurrency(td) {
    if (usdRate <= 0) { toast('Курс USD не загружен', 'error'); return; }
    const oldCur = td.currency, newCur = oldCur === 'USD' ? 'RUB' : 'USD';
    const pi = ci(td.cols, 'Цена');
    if (pi >= 0) td.rows.forEach(row => {
        const price = parseFloat(row[pi]);
        if (!isNaN(price)) { if (oldCur === 'USD') row[pi] = (price * usdRate).toFixed(2); else row[pi] = (price / usdRate).toFixed(2); }
    });
    td.currency = newCur;
    td.rows.forEach(r => calc(r, td.cols));
    if (td.card) { const oldHdr = td.card.querySelector('.card-hdr'); if (oldHdr) oldHdr.replaceWith(buildCardHeader(td)); }
    render(td); saveNow();
    toast(`${oldCur} → ${newCur} (курс ${usdRate.toFixed(2)} ₽)`, 'success');
}
async function loadRates() {
    const bar = Q('#ratesBar');
    const renderRates = (usd, eur, usdPrev, eurPrev) => {
        if (!bar) return;
        const usdCls = usdPrev ? (usd > usdPrev ? 'up' : 'down') : '';
        const eurCls = eurPrev ? (eur > eurPrev ? 'up' : 'down') : '';
        bar.innerHTML = `<span class="rate"><span>💵</span> USD: <span class="rate-value ${usdCls}">${usd.toFixed(2)} ₽</span></span><span class="rate"><span>💶</span> EUR: <span class="rate-value ${eurCls}">${eur.toFixed(2)} ₽</span></span>`;
    };
    try {
        const r = await fetch('https://www.cbr-xml-daily.ru/daily_json.js', { cache: 'no-cache' });
        if (!r.ok) throw new Error('HTTP');
        const d = await r.json();
        usdRate = d.Valute.USD.Value; eurRate = d.Valute.EUR.Value;
        renderRates(usdRate, eurRate, d.Valute.USD.Previous, d.Valute.EUR.Previous);
        return;
    } catch (e1) {}
    try {
        const r2 = await fetch('https://api.exchangerate-api.com/v4/latest/USD', { cache: 'no-cache' });
        if (!r2.ok) throw new Error('HTTP');
        const d2 = await r2.json();
        usdRate = d2.rates.RUB; eurRate = usdRate / d2.rates.EUR;
        renderRates(usdRate, eurRate, 0, 0);
    } catch (e2) { if (bar) bar.textContent = 'Курсы недоступны'; }
}

// ========== SIDEBAR ==========
function buildSidebarV2() {
    const sb = Q('#sidebarContent'); if (!sb) return;
    const sections = [
        { t: 'Таблица', buttons: [
            { id: 'btnAddRow',  icon: ICONS.plus,     label: 'Добавить строку',  hk: 'addRow' },
            { id: 'btnAddSection', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="8" rx="2"/><path d="M8 12h8"/></svg>', label: 'Строка-заголовок', hk: null },
            { id: 'btnDelRow',  icon: ICONS.minus,    label: 'Удалить строку',   hk: 'delRow' },
            { id: 'btnAddCol',  icon: ICONS.plusBox,  label: 'Добавить колонку', hk: 'addCol' },
            { id: 'btnDelCol',  icon: ICONS.minusBox, label: 'Удалить колонку',  hk: 'delCol' }
        ]},
        { t: 'Действия', buttons: [
            { id: 'btnConvert', icon: ICONS.convert, label: 'Конвертировать', hk: 'convert' },
            { id: 'btnPaste',   icon: ICONS.paste,   label: 'Вставить',       hk: 'paste' },
            { id: 'btnDup',     icon: ICONS.copy,    label: 'Дублировать',    hk: 'dup' },
            { id: 'btnRecalc',  icon: ICONS.refresh, label: 'Пересчёт',       hk: 'recalc' },
            { id: 'btnFind',    icon: ICONS.search,  label: 'Найти',          hk: null },
            { id: 'btnReplace', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v6"/><path d="M12 14v6"/><path d="M8 12h8"/></svg>', label: 'Заменить', hk: null },
            { id: 'btnTemplates', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>', label: 'Шаблоны', hk: null }
        ]},
        { t: 'Создать', buttons: [
            { id: 'btnNewRUB', icon: ICONS.ruble,  label: 'Новая RUB', hk: 'newRUB' },
            { id: 'btnNewUSD', icon: ICONS.dollar, label: 'Новая USD', hk: 'newUSD' }
        ]},
        { t: 'Файл', buttons: [
            { id: 'btnLoad',     icon: ICONS.folder, label: 'Открыть',     hk: 'load' },
            { id: 'btnSave',     icon: ICONS.save,   label: 'Сохранить Excel', hk: 'save' },
            { id: 'btnExportCSV', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="M8 11l4 4 4-4"/><path d="M4 21h16"/></svg>', label: 'Экспорт CSV', hk: null },
            { id: 'btnPrint',    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="3" width="12" height="6"/><rect x="4" y="9" width="16" height="8" rx="2"/><rect x="8" y="15" width="8" height="6"/></svg>', label: 'Печать', hk: null },
            { id: 'btnClear',    icon: ICONS.trash,  label: 'Очистить',    hk: 'clear' },
            { id: 'btnUndo',     icon: ICONS.undo,   label: 'Отменить',    hk: 'undo' }
        ]}
    ];
    sb.innerHTML = sections.map(sec => `<div class="sidebar-section"><div class="sidebar-section-title">${sec.t}</div>${sec.buttons.map(b => `<button class="sidebar-btn" id="${b.id}" title="${escapeHtml(b.label)}"><span class="s-icon">${b.icon}</span><span class="s-label">${escapeHtml(b.label)}</span>${b.hk ? `<span class="s-hotkey" data-hk="${b.hk}">Shift+${hkDisplay(hotkeys[b.hk])}</span>` : ''}</button>`).join('')}</div>`).join('');
    const tc = Q('#btnColorTheme'); if (tc) tc.innerHTML = ICONS.palette;
    const ts = Q('#btnSettings'); if (ts) ts.innerHTML = ICONS.settings;
    const ti = Q('#themeIcon'); if (ti) ti.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
}

// ========== WORKSPACES ==========
function buildWorkspaces() {
    const tabs = Q('#workspaceTabs'), container = Q('#workspaceContainer');
    tabs.innerHTML = ''; container.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        tabs.innerHTML += `<button class="workspace-tab ${i === activeWorkspace ? 'active' : ''}" data-ws="${i}">Окно ${i}</button>`;
        container.innerHTML += `<div class="workspace-panel ${i === activeWorkspace ? 'active' : ''}" data-ws="${i}"><div class="tables-area" id="workspaceArea_${i}"></div></div>`;
    }
    tabs.querySelectorAll('.workspace-tab').forEach(t => { t.onclick = () => switchWorkspace(+t.dataset.ws); });
    upEmpty();
}

// ========== CARDS ==========
function buildCardHeader(td) {
    const hdr = document.createElement('div');
    hdr.className = 'card-hdr';
    hdr.innerHTML = `<div class="card-hdr-left"><div class="card-title"><span>📋</span><span>Таблица ${td.currency}</span><span class="card-badge ${td.currency === 'USD' ? 'usd' : 'rub'}">${td.currency}</span><span class="card-badge active-badge">●</span></div><div class="card-stats"><span class="card-stat">Строк: <b class="stat-rows">${td.rows.length}</b></span><span class="card-stat">Итого: <b class="stat-total">${sumT(td).toFixed(2)}</b></span></div></div><div class="card-hdr-right"><button class="card-btn cur-btn" title="Конвертировать">${td.currency === 'USD' ? '💵 USD' : '💰 RUB'}</button><button class="card-btn icon-only dup-btn" title="Дублировать">⎘</button><button class="card-btn icon-only danger del-btn" title="Удалить">🗑</button></div>`;
    hdr.querySelector('.cur-btn').onclick = e => { e.stopPropagation(); convertCurrency(td); };
    hdr.querySelector('.dup-btn').onclick = e => { e.stopPropagation(); dupTable(td); };
    hdr.querySelector('.del-btn').onclick = e => {
        e.stopPropagation();
        const ws = workspaces[activeWorkspace];
        if (ws.length <= 1) { toast('Нужна хотя бы одна таблица', 'warning'); return; }
        openConfirm('Удалить таблицу?', 'Без возможности восстановления.', () => {
            td.card.remove(); ws.splice(ws.indexOf(td), 1);
            if (actId === td.id) actId = ws.length ? ws[0].id : null;
            upEmpty(); updateStatusBar(); toast('Удалена', 'info');
        });
    };
    return hdr;
}
function addTable(cur = 'RUB') {
    const ws = workspaces[activeWorkspace]; upEmpty(); idC++;
    const td = { id: idC, cols: [...DEFAULT_COLS], rows: [['', '', '', '', '']], currency: cur, el: null, card: null, merges: [], styles: {}, rowTypes: {}, notes: {} };
    ws.push(td);
    const area = getArea(); const emptyEl = area.querySelector('.empty-state'); if (emptyEl) emptyEl.remove();
    const card = buildCardDOM(td); area.appendChild(card); td.card = card;
    setAct(td.id); render(td);
    toast(`Таблица ${cur} создана`, 'success');
}
function dupTable(src) {
    if (!src) src = active(); if (!src) { toast('Выберите таблицу', 'warning'); return; }
    const ws = workspaces[activeWorkspace]; idC++;
    const td = { id: idC, cols: [...src.cols], rows: src.rows.map(r => [...r]), currency: src.currency, el: null, card: null,
        merges: src.merges ? src.merges.map(m => ({ ...m })) : [],
        styles: src.styles ? JSON.parse(JSON.stringify(src.styles)) : {},
        rowTypes: src.rowTypes ? { ...src.rowTypes } : {},
        notes: src.notes ? { ...src.notes } : {} };
    ws.push(td);
    const area = getArea(); const card = buildCardDOM(td); area.appendChild(card); td.card = card;
    setAct(td.id); render(td);
    toast('Таблица дублирована', 'success');
}
function buildCardDOM(td) {
    const card = document.createElement('div');
    card.className = 'card'; card.dataset.tid = td.id;
    card.addEventListener('click', e => {
        if (!e.target.closest('button') && !e.target.closest('.cell') && !e.target.closest('.resize-handle') && !e.target.closest('.row-num')) setAct(td.id);
    });
    card.addEventListener('contextmenu', e => {
        e.preventDefault(); e.stopPropagation();
        const thEl = e.target.closest('thead th:not(.row-num):not(.actions-col)');
        const trEl = e.target.closest('tbody tr');
        let ri = null, ci = null;
        if (thEl) { const ths = [...card.querySelectorAll('thead th:not(.row-num):not(.actions-col)')]; ci = ths.indexOf(thEl); if (ci >= td.cols.length) ci = null; }
        if (trEl && !trEl.classList.contains('row-total')) {
            ri = +trEl.dataset.ri;
            const cellEl = e.target.closest('.cell'); if (cellEl) { ri = +cellEl.dataset.r; ci = +cellEl.dataset.c; }
        }
        window._ctxD = { tid: td.id, ri, ci };
        setAct(td.id);
        showCtx(e.clientX, e.clientY);
    });
    const hdr = buildCardHeader(td);
    const wrap = document.createElement('div'); wrap.className = 'table-wrap';
    const tbl = document.createElement('table'); tbl.className = 'data-table';
    tbl.innerHTML = '<thead></thead><tbody></tbody>';
    wrap.appendChild(tbl); card.appendChild(hdr); card.appendChild(wrap);
    td.el = tbl;
    return card;
}
function updateCardStats(td) {
    if (!td.card) return;
    const sr = td.card.querySelector('.stat-rows'), st = td.card.querySelector('.stat-total');
    if (sr) sr.textContent = td.rows.length;
    if (st) st.textContent = sumT(td).toFixed(2);
    updateStatusBar();
}

// ========== CELL SELECTION ==========
function clearCellSelection() {
    cellSel = { tid: null, r1: -1, c1: -1, r2: -1, c2: -1, anchorR: -1, anchorC: -1, dragging: false };
    document.querySelectorAll('.cell.selected-cell, .cell.anchor-cell').forEach(c => c.classList.remove('selected-cell', 'anchor-cell'));
    updateStatusBar();
}
function selectCell(td, ri, ci, shift) {
    if (shift && cellSel.tid === td.id && cellSel.anchorR >= 0) { cellSel.r1 = cellSel.anchorR; cellSel.c1 = cellSel.anchorC; cellSel.r2 = ri; cellSel.c2 = ci; }
    else { cellSel.tid = td.id; cellSel.anchorR = ri; cellSel.anchorC = ci; cellSel.r1 = ri; cellSel.c1 = ci; cellSel.r2 = ri; cellSel.c2 = ci; }
    updateCellSelectionUI(td); updateStatusBar();
}
function updateCellSelectionUI(td) {
    document.querySelectorAll('.cell.selected-cell, .cell.anchor-cell').forEach(c => c.classList.remove('selected-cell', 'anchor-cell'));
    if (!cellSel.tid || cellSel.tid !== td.id || cellSel.r1 < 0) return;
    const r1 = Math.min(cellSel.r1, cellSel.r2), r2 = Math.max(cellSel.r1, cellSel.r2);
    const c1 = Math.min(cellSel.c1, cellSel.c2), c2 = Math.max(cellSel.c1, cellSel.c2);
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) {
        const cell = td.el.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
        if (cell) {
            cell.classList.add('selected-cell');
            if (r === cellSel.anchorR && c === cellSel.anchorC) cell.classList.add('anchor-cell');
        }
    }
}

// ========== RENDER ==========
function render(td) {
    if (!td.el) return;
    const thead = td.el.querySelector('thead'), tbody = td.el.querySelector('tbody');
    const sort = sortState[td.id];
    let theadHtml = '<tr>';
    if (tableSettings.showRowNums) theadHtml += '<th class="row-num">№</th>';
    td.cols.forEach((col, i) => {
        const w = colWidths[col];
        const styleW = w ? `style="width:${w}px;min-width:${w}px;max-width:${w}px"` : '';
        const sorted = sort && sort.col === i;
        const sortCls = sorted ? (sort.dir === 'asc' ? 'sorted-asc' : 'sorted-desc') : '';
        const sortIcon = sorted ? (sort.dir === 'asc' ? '▲' : '▼') : '⇅';
        theadHtml += `<th class="sortable ${sortCls}" data-col="${i}" ${styleW}>${escapeHtml(formatHeader(col, td.currency))}<span class="sort-indicator">${sortIcon}</span><span class="resize-handle" data-col="${i}"></span></th>`;
    });
    theadHtml += '<th class="actions-col"></th></tr>';
    thead.innerHTML = theadHtml;
    thead.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', e => { if (e.target.classList.contains('resize-handle')) return; sortByColumn(td, +th.dataset.col); });
        th.addEventListener('dblclick', e => { if (e.target.classList.contains('resize-handle')) return; autoFitColumn(td, +th.dataset.col); });
    });
    thead.querySelectorAll('.resize-handle').forEach(handle => {
        handle.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); startResize(td, +handle.dataset.col, e, handle); });
    });

    tbody.innerHTML = '';
    const rows = td.rows;
    rows.forEach((row, ri) => {
        const isSection = td.rowTypes && td.rowTypes[ri] === 'section';
        const tr = document.createElement('tr');
        tr.dataset.ri = ri;
        if (isSection) tr.classList.add('section-row');
        if (selectedRows[td.id]?.has(ri) && !isSection) tr.classList.add('selected');

        if (isSection) {
            // Section header row: single cell spanning all columns
            const tdEl = document.createElement('td');
            tdEl.colSpan = td.cols.length + (tableSettings.showRowNums ? 1 : 0) + 1;
            tdEl.style.padding = '0';
            const cell = document.createElement('div');
            cell.className = 'cell section-cell';
            cell.contentEditable = 'true';
            cell.dataset.r = ri;
            cell.dataset.c = '0';
            cell.dataset.section = '1';
            cell.textContent = row[0] ?? '';
            cell.addEventListener('focus', () => { cell.dataset.old = cell.innerText; setAct(td.id); });
            cell.addEventListener('input', () => { let v = cell.innerText; if (v.endsWith('\n')) v = v.slice(0, -1); td.rows[ri][0] = v; });
            cell.addEventListener('blur', () => {
                let v = cell.innerText; if (v.endsWith('\n')) v = v.slice(0, -1);
                td.rows[ri][0] = v;
                if (cell.dataset.old !== undefined && cell.dataset.old !== v) hist.push({ a: 'editCell', tid: td.id, d: { ri, ci: 0, old: cell.dataset.old, val: v } });
            });
            cell.addEventListener('keydown', e => {
                if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); document.execCommand('insertLineBreak'); return; }
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (ri === rows.length - 1) addRowEnd(td); moveFocus(td, ri, 0, 0, 1); return; }
                if (e.key === 'Tab') { e.preventDefault(); moveFocus(td, ri, 0, e.shiftKey ? -1 : 1); return; }
                if (e.key === 'Escape') { cell.blur(); return; }
            });
            tdEl.appendChild(cell);
            tr.appendChild(tdEl);

            // Actions for section
            const at = document.createElement('td');
            at.className = 'actions-col';
            at.innerHTML = '<div class="row-actions"><button class="row-action-btn add" title="Добавить строку ниже">+</button><button class="row-action-btn del" title="Удалить строку">✕</button></div>';
            at.querySelector('.add').onclick = e => { e.stopPropagation(); insRowBelow(td, ri); };
            at.querySelector('.del').onclick = e => { e.stopPropagation(); delRow(td, ri); };
            tr.appendChild(at);
            tbody.appendChild(tr);
            return;
        }

        if (tableSettings.showRowNums) {
            const numTd = document.createElement('td');
            numTd.className = 'row-num';
            numTd.textContent = ri + 1;
            numTd.addEventListener('click', e => {
                if (!selectedRows[td.id]) selectedRows[td.id] = new Set();
                const sel = selectedRows[td.id];
                if (e.shiftKey && lastSelectedRow !== null) { const from = Math.min(lastSelectedRow, ri), to = Math.max(lastSelectedRow, ri); for (let i = from; i <= to; i++) sel.add(i); }
                else if (e.ctrlKey) { if (sel.has(ri)) sel.delete(ri); else sel.add(ri); lastSelectedRow = ri; }
                else { if (sel.size === 1 && sel.has(ri)) sel.clear(); else { sel.clear(); sel.add(ri); } lastSelectedRow = ri; }
                render(td);
            });
            tr.appendChild(numTd);
        }
        row.forEach((v, colIdx) => {
            if (isMergeCovered(td, ri, colIdx)) return;
            const tdEl = document.createElement('td');
            const cell = document.createElement('div');
            const cn = (td.cols[colIdx] || '').toLowerCase();
            const isTotal = cn.startsWith('стоимость'), isNum = isNumericCol(cn);
            const mergeAt = findMergeContaining(td, ri, colIdx);
            cell.className = 'cell';
            cell.contentEditable = isTotal ? 'false' : 'true';
            cell.dataset.r = ri; cell.dataset.c = colIdx;
            if (isNum) cell.classList.add('num');
            if (isTotal) cell.classList.add('total');
            if (tableSettings.wrapText) cell.classList.add('wrap');
            const w = colWidths[td.cols[colIdx]];
            if (w) { tdEl.style.width = w + 'px'; tdEl.style.minWidth = w + 'px'; tdEl.style.maxWidth = w + 'px'; }
            if (mergeAt && mergeAt.r1 === ri && mergeAt.c1 === colIdx) { tdEl.rowSpan = mergeAt.r2 - mergeAt.r1 + 1; tdEl.colSpan = mergeAt.c2 - mergeAt.c1 + 1; tdEl.classList.add('merged-start'); }
            const style = getCellStyle(td, ri, colIdx);
            applyStyleToCell(cell, style);
            const note = td.notes && td.notes[ri + ':' + colIdx];
            if (note) cell.classList.add('has-note');
            cell.textContent = v ?? '';

            cell.addEventListener('focus', () => { cell.dataset.old = cell.innerText; setAct(td.id); activeTbCell = { r: ri, c: colIdx }; updateTbFromCell(td, ri, colIdx); });
            cell.addEventListener('input', () => { let val = cell.innerText; if (val.endsWith('\n')) val = val.slice(0, -1); td.rows[ri][colIdx] = val; if (isNum && !isTotal) updCalcRow(td, ri, true); });
            cell.addEventListener('blur', () => {
                let val = cell.innerText; if (val.endsWith('\n')) val = val.slice(0, -1);
                if (isNum && !isTotal) { const n = pn(val); if (!isNaN(n)) { val = n.toFixed(2); td.rows[ri][colIdx] = val; cell.textContent = val; } updCalcRow(td, ri, false); }
                else td.rows[ri][colIdx] = val;
                if (cell.dataset.old !== undefined && cell.dataset.old !== val) hist.push({ a: 'editCell', tid: td.id, d: { ri, ci: colIdx, old: cell.dataset.old, val: val } });
            });
            cell.addEventListener('keydown', e => {
                if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); document.execCommand('insertLineBreak'); return; }
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (ri === rows.length - 1) addRowEnd(td); moveFocus(td, ri, colIdx, 0, 1); return; }
                if (e.key === 'Tab') { e.preventDefault(); moveFocus(td, ri, colIdx, e.shiftKey ? -1 : 1); return; }
                if (e.key === 'Escape') { cell.blur(); return; }
                if (e.ctrlKey && !e.shiftKey && !e.altKey) {
                    const k = e.key.toLowerCase();
                    if (k === 'b') { e.preventDefault(); toggleStyle('bold'); return; }
                    if (k === 'i') { e.preventDefault(); toggleStyle('italic'); return; }
                    if (k === 'u') { e.preventDefault(); toggleStyle('underline'); return; }
                }
            });
            cell.addEventListener('paste', e => {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text/plain');
                if (!text) return;
                if (text.includes('\t') || text.split('\n').length > 1) { const parsed = parseClipboard(text); if (parsed.length > 1 || (parsed[0] && parsed[0].length > 1)) { pasteAt(td, ri, colIdx, parsed); return; } }
                document.execCommand('insertText', false, text);
            });
            cell.addEventListener('mousedown', e => {
                if (e.button !== 0) return;
                if (e.shiftKey) { e.preventDefault(); selectCell(td, ri, colIdx, true); return; }
                cellSel.tid = td.id; cellSel.anchorR = ri; cellSel.anchorC = colIdx;
                cellSel.r1 = ri; cellSel.c1 = colIdx; cellSel.r2 = ri; cellSel.c2 = colIdx; cellSel.dragging = true;
                updateCellSelectionUI(td); updateStatusBar();
            });
            cell.addEventListener('mouseenter', () => {
                if (cellSel.dragging && cellSel.tid === td.id) { cellSel.r2 = ri; cellSel.c2 = colIdx; updateCellSelectionUI(td); updateStatusBar(); }
                const note = td.notes && td.notes[ri + ':' + colIdx];
                if (note) { const popup = Q('#notePopup'); const rect = cell.getBoundingClientRect(); popup.textContent = note; popup.style.left = Math.min(rect.left, window.innerWidth - 340) + 'px'; popup.style.top = (rect.bottom + 6) + 'px'; popup.classList.add('show'); }
            });
            cell.addEventListener('mouseleave', () => { const popup = Q('#notePopup'); if (popup) popup.classList.remove('show'); });
            tdEl.appendChild(cell);
            tr.appendChild(tdEl);
        });
        const at = document.createElement('td');
        at.className = 'actions-col';
        at.innerHTML = '<div class="row-actions"><button class="row-action-btn add" title="Добавить строку ниже">+</button><button class="row-action-btn del" title="Удалить строку">✕</button></div>';
        at.querySelector('.add').onclick = e => { e.stopPropagation(); insRowBelow(td, ri); };
        at.querySelector('.del').onclick = e => { e.stopPropagation(); delRow(td, ri); };
        tr.appendChild(at);
        tbody.appendChild(tr);
    });
    if (tableSettings.showTotals && rows.length > 0) {
        const totTr = document.createElement('tr');
        totTr.className = 'row-total';
        const ti = ci(td.cols, 'Стоимость');
        let html = '';
        if (tableSettings.showRowNums) html += '<td class="row-num"></td>';
        td.cols.forEach((_, i) => {
            if (i === (ti >= 0 ? ti - 1 : td.cols.length - 2)) html += '<td style="text-align:right;padding:10px 12px;font-weight:700">Итого</td>';
            else if (i === ti) html += `<td style="padding:0"><div class="cell total" style="padding:var(--cell-padding) 12px">${sumT(td).toFixed(2)}</div></td>`;
            else html += '<td></td>';
        });
        html += '<td class="actions-col"></td>';
        totTr.innerHTML = html;
        tbody.appendChild(totTr);
    }
    updateCellSelectionUI(td);
    updateCardStats(td);
}
function updCalcRow(td, ri, skipRecalc) {
    if (!skipRecalc) calc(td.rows[ri], td.cols);
    const ti = ci(td.cols, 'Стоимость');
    if (ti < 0) return;
    const cell = td.el.querySelector(`.cell[data-r="${ri}"][data-c="${ti}"]`);
    if (cell) cell.textContent = td.rows[ri][ti] ?? '';
    const totTr = td.el.querySelector('tbody tr.row-total');
    if (totTr) totTr.querySelectorAll('.cell.total').forEach(c => { c.textContent = sumT(td).toFixed(2); });
    updateCardStats(td);
}
function moveFocus(td, ri, ci, dc, dr = 0) {
    let nr = ri + dr, nc = ci + dc;
    if (nc >= td.cols.length) { nc = 0; nr++; }
    if (nc < 0) { nc = td.cols.length - 1; nr--; }
    if (nr >= td.rows.length || nr < 0) return;
    while (isMergeCovered(td, nr, nc)) { nc += dc >= 0 ? 1 : -1; if (nc >= td.cols.length || nc < 0) return; }
    const cell = td.el.querySelector(`.cell[data-r="${nr}"][data-c="${nc}"]`);
    if (cell) { cell.focus(); const range = document.createRange(); range.selectNodeContents(cell); range.collapse(false); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range); }
}
function updateTbFromCell(td, ri, ci) {
    const st = getCellStyle(td, ri, ci);
    document.querySelectorAll('[data-cmd="bold"]').forEach(b => b.classList.toggle('active', !!st.bold));
    document.querySelectorAll('[data-cmd="italic"]').forEach(b => b.classList.toggle('active', !!st.italic));
    document.querySelectorAll('[data-cmd="underline"]').forEach(b => b.classList.toggle('active', !!st.underline));
    document.querySelectorAll('[data-cmd="strike"]').forEach(b => b.classList.toggle('active', !!st.strike));
    document.querySelectorAll('[data-cmd="alignLeft"]').forEach(b => b.classList.toggle('active', st.align === 'left'));
    document.querySelectorAll('[data-cmd="alignCenter"]').forEach(b => b.classList.toggle('active', st.align === 'center'));
    document.querySelectorAll('[data-cmd="alignRight"]').forEach(b => b.classList.toggle('active', st.align === 'right'));
}

// ========== STYLE TOGGLES ==========
function toggleStyle(prop) {
    const td = active(); if (!td) return;
    if (cellSel.r1 < 0 && activeTbCell) selectCell(td, activeTbCell.r, activeTbCell.c, false);
    if (cellSel.r1 < 0) { toast('Выделите ячейку', 'warning'); return; }
    const currentStyle = getCellStyle(td, cellSel.anchorR, cellSel.anchorC);
    const newVal = !currentStyle[prop];
    forEachSelectedCell(td, (r, c) => setCellStyle(td, r, c, { [prop]: newVal }));
    render(td);
}
function setAlign(align) {
    const td = active(); if (!td) return;
    if (cellSel.r1 < 0 && activeTbCell) selectCell(td, activeTbCell.r, activeTbCell.c, false);
    if (cellSel.r1 < 0) { toast('Выделите ячейку', 'warning'); return; }
    forEachSelectedCell(td, (r, c) => setCellStyle(td, r, c, { align }));
    render(td);
}
function clearFormat() {
    const td = active(); if (!td) return;
    if (cellSel.r1 < 0) { toast('Выделите ячейку', 'warning'); return; }
    forEachSelectedCell(td, (r, c) => { if (td.styles) delete td.styles[r + ':' + c]; });
    render(td); toast('Формат очищен', 'info');
}
function setCellColor(prop, value) {
    const td = active(); if (!td) return;
    if (cellSel.r1 < 0 && activeTbCell) selectCell(td, activeTbCell.r, activeTbCell.c, false);
    if (cellSel.r1 < 0) { toast('Выделите ячейку', 'warning'); return; }
    forEachSelectedCell(td, (r, c) => setCellStyle(td, r, c, { [prop]: value }));
    render(td);
}

// ========== SECTION ROWS ==========
function addSectionRow(td, atIdx) {
    if (!td) { toast('Выберите таблицу', 'warning'); return; }
    const idx = (atIdx !== undefined && atIdx !== null) ? atIdx : td.rows.length;
    const newRow = Array(td.cols.length).fill('');
    newRow[0] = 'Заголовок раздела';
    td.rows.splice(idx, 0, newRow);
    if (!td.rowTypes) td.rowTypes = {};
    // Сдвигаем существующие типы
    const newTypes = {};
    for (const [k, v] of Object.entries(td.rowTypes)) {
        const n = +k;
        newTypes[n >= idx ? n + 1 : n] = v;
    }
    newTypes[idx] = 'section';
    td.rowTypes = newTypes;
    // Сдвигаем merges
    if (td.merges) td.merges = td.merges.map(m => ({ ...m, r1: m.r1 >= idx ? m.r1 + 1 : m.r1, r2: m.r2 >= idx ? m.r2 + 1 : m.r2 }));
    render(td);
    toast('Строка-заголовок добавлена', 'success');
    setTimeout(() => {
        const cell = td.el.querySelector(`.cell[data-r="${idx}"][data-c="0"]`);
        if (cell) { cell.focus(); const range = document.createRange(); range.selectNodeContents(cell); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range); }
    }, 50);
}

// ========== ROW/COL OPS ==========
function insRowBelow(td, idx) { insRow(td, idx + 1); }
function insRowAbove(td, idx) { insRow(td, idx); }
function insRow(td, idx) {
    td.rows.splice(idx, 0, Array(td.cols.length).fill(''));
    calc(td.rows[idx], td.cols);
    if (td.merges) td.merges = td.merges.map(m => ({ ...m, r1: m.r1 >= idx ? m.r1 + 1 : m.r1, r2: m.r2 >= idx ? m.r2 + 1 : m.r2 }));
    if (td.styles) { const ns = {}; for (const [k, v] of Object.entries(td.styles)) { const [r, c] = k.split(':').map(Number); ns[(r >= idx ? r + 1 : r) + ':' + c] = v; } td.styles = ns; }
    if (td.rowTypes) { const nt = {}; for (const [k, v] of Object.entries(td.rowTypes)) { const n = +k; nt[n >= idx ? n + 1 : n] = v; } td.rowTypes = nt; }
    if (td.notes) { const nn = {}; for (const [k, v] of Object.entries(td.notes)) { const [r, c] = k.split(':').map(Number); nn[(r >= idx ? r + 1 : r) + ':' + c] = v; } td.notes = nn; }
    render(td);
}
function delRow(td, idx) {
    if (td.rows.length <= 1) { toast('Нельзя удалить последнюю', 'warning'); return; }
    hist.push({ a: 'delRow', tid: td.id, d: { i: idx, r: [...td.rows[idx]], merges: td.merges ? td.merges.map(m => ({ ...m })) : [], styles: td.styles ? JSON.parse(JSON.stringify(td.styles)) : {}, rowTypes: td.rowTypes ? { ...td.rowTypes } : {}, notes: td.notes ? { ...td.notes } : {} } });
    td.rows.splice(idx, 1);
    if (td.merges) td.merges = td.merges.map(m => ({ ...m, r1: m.r1 > idx ? m.r1 - 1 : m.r1, r2: m.r2 >= idx ? m.r2 - 1 : m.r2 })).filter(m => m.r1 <= m.r2);
    if (td.styles) { const ns = {}; for (const [k, v] of Object.entries(td.styles)) { const [r, c] = k.split(':').map(Number); if (r === idx) continue; ns[(r > idx ? r - 1 : r) + ':' + c] = v; } td.styles = ns; }
    if (td.rowTypes) { const nt = {}; for (const [k, v] of Object.entries(td.rowTypes)) { const n = +k; if (n === idx) continue; nt[n > idx ? n - 1 : n] = v; } td.rowTypes = nt; }
    if (td.notes) { const nn = {}; for (const [k, v] of Object.entries(td.notes)) { const [r, c] = k.split(':').map(Number); if (r === idx) continue; nn[(r > idx ? r - 1 : r) + ':' + c] = v; } td.notes = nn; }
    render(td);
}
function addRowEnd(td) {
    td.rows.push(Array(td.cols.length).fill(''));
    calc(td.rows[td.rows.length - 1], td.cols);
    render(td);
    setTimeout(() => { const cell = td.el.querySelector(`.cell[data-r="${td.rows.length - 1}"][data-c="0"]`); if (cell) cell.focus(); }, 50);
}
function delRowEnd(td) {
    if (td.rows.length <= 1) { toast('Нельзя удалить последнюю', 'warning'); return; }
    delRow(td, td.rows.length - 1);
}
function insCol(td, idx) {
    openPrompt('Название новой колонки:', '', (name) => {
        if (!name.trim()) return;
        td.cols.splice(idx, 0, name.trim());
        td.rows.forEach(r => r.splice(idx, 0, ''));
        if (td.merges) td.merges = td.merges.map(m => ({ ...m, c1: m.c1 >= idx ? m.c1 + 1 : m.c1, c2: m.c2 >= idx ? m.c2 + 1 : m.c2 }));
        if (td.styles) { const ns = {}; for (const [k, v] of Object.entries(td.styles)) { const [r, c] = k.split(':').map(Number); ns[r + ':' + (c >= idx ? c + 1 : c)] = v; } td.styles = ns; }
        render(td);
    });
}
function delCol(td, idx) {
    if (td.cols.length <= 2) { toast('Минимум 2 колонки', 'warning'); return; }
    hist.push({ a: 'delCol', tid: td.id, d: { i: idx, n: td.cols[idx], c: td.rows.map(r => r[idx]) } });
    td.cols.splice(idx, 1); td.rows.forEach(r => r.splice(idx, 1));
    if (td.merges) td.merges = td.merges.filter(m => !(m.c1 === idx && m.c2 === idx)).map(m => ({ ...m, c1: m.c1 > idx ? m.c1 - 1 : m.c1, c2: m.c2 > idx ? m.c2 - 1 : m.c2 })).filter(m => m.c1 <= m.c2);
    if (td.styles) { const ns = {}; for (const [k, v] of Object.entries(td.styles)) { const [r, c] = k.split(':').map(Number); if (c === idx) continue; ns[r + ':' + (c > idx ? c - 1 : c)] = v; } td.styles = ns; }
    render(td);
}
function renameCol(td, idx) {
    openPrompt('Новое название:', td.cols[idx], (name) => {
        if (!name.trim() || name.trim() === td.cols[idx]) return;
        const oldName = td.cols[idx]; const w = colWidths[oldName];
        td.cols[idx] = name.trim();
        if (w) { delete colWidths[oldName]; colWidths[name.trim()] = w; }
        render(td);
    });
}
function dupCol(td, idx) {
    const name = td.cols[idx] + ' (копия)';
    td.cols.splice(idx + 1, 0, name);
    td.rows.forEach(r => r.splice(idx + 1, 0, r[idx]));
    if (td.merges) td.merges = td.merges.map(m => ({ ...m, c1: m.c1 > idx ? m.c1 + 1 : m.c1, c2: m.c2 > idx ? m.c2 + 1 : m.c2 }));
    render(td); toast('Колонка дублирована', 'info');
}
function addColEnd(td) {
    openPrompt('Название новой колонки:', '', (name) => {
        if (!name.trim()) return;
        td.cols.push(name.trim()); td.rows.forEach(r => r.push(''));
        render(td);
    });
}
function delColEnd(td) {
    if (td.cols.length <= 2) { toast('Минимум 2 колонки', 'warning'); return; }
    delCol(td, td.cols.length - 1);
}
function dupRow(td, idx) {
    const copy = [...td.rows[idx]];
    td.rows.splice(idx + 1, 0, copy);
    if (td.styles) { const ns = {}; for (const [k, v] of Object.entries(td.styles)) { const [r, c] = k.split(':').map(Number); if (r === idx) ns[(idx + 1) + ':' + c] = { ...v }; } Object.assign(td.styles, ns); }
    if (td.rowTypes && td.rowTypes[idx]) td.rowTypes[idx + 1] = td.rowTypes[idx];
    if (td.merges) td.merges = td.merges.map(m => ({ ...m, r1: m.r1 > idx ? m.r1 + 1 : m.r1, r2: m.r2 > idx ? m.r2 + 1 : m.r2 }));
    render(td); toast('Строка дублирована', 'info');
}

// ========== SORT / AUTOFIT ==========
function sortByColumn(td, col) {
    const st = sortState[td.id] || { col: -1, dir: 'asc' };
    let dir = 'asc'; if (st.col === col && st.dir === 'asc') dir = 'desc'; else if (st.col === col && st.dir === 'desc') dir = 'asc';
    sortState[td.id] = { col, dir };
    const sectionIdx = new Set(Object.entries(td.rowTypes || {}).filter(([k, v]) => v === 'section').map(([k]) => +k));
    const dataRows = [];
    const otherRows = [];
    td.rows.forEach((r, i) => { if (sectionIdx.has(i)) otherRows.push({ r: [...r], i, type: 'section' }); else dataRows.push({ r: [...r], i, type: 'normal' }); });
    dataRows.sort((a, b) => {
        let av = a.r[col] ?? '', bv = b.r[col] ?? '';
        const an = pn(av), bn = pn(bv);
        if (!isNaN(an) && !isNaN(bn)) return dir === 'asc' ? an - bn : bn - an;
        av = String(av).toLowerCase(); bv = String(bv).toLowerCase();
        if (av < bv) return dir === 'asc' ? -1 : 1;
        if (av > bv) return dir === 'asc' ? 1 : -1;
        return 0;
    });
    td.rows = dataRows.map(x => x.r);
    if (td.merges && td.merges.length) { td.merges = []; toast('Объединения сброшены', 'info'); }
    render(td);
}
function autoFitColumn(td, col) {
    const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
    ctx.font = tableSettings.fontSize + 'px ' + tableSettings.fontFamily;
    let maxW = 100;
    maxW = Math.max(maxW, ctx.measureText(formatHeader(td.cols[col], td.currency)).width + 60);
    td.rows.forEach(r => { const w = ctx.measureText(String(r[col] ?? '')).width + 40; if (w > maxW) maxW = w; });
    maxW = Math.min(maxW, 600);
    colWidths[td.cols[col]] = maxW;
    saveNow(); render(td); toast('Ширина подогнана', 'success');
}
function startResize(td, col, e, handle) {
    document.body.classList.add('resizing'); handle.classList.add('active');
    const th = handle.closest('th'), startX = e.clientX, startW = th.offsetWidth;
    const overlay = document.createElement('div'); overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;cursor:col-resize'; document.body.appendChild(overlay);
    const onMove = ev => {
        const w = Math.max(60, startW + (ev.clientX - startX));
        colWidths[td.cols[col]] = w;
        th.style.width = w + 'px'; th.style.minWidth = w + 'px'; th.style.maxWidth = w + 'px';
        td.el.querySelectorAll('tbody tr').forEach(row => {
            const cell = row.querySelector(`.cell[data-c="${col}"]`);
            if (cell) { const p = cell.parentElement; p.style.width = w + 'px'; p.style.minWidth = w + 'px'; p.style.maxWidth = w + 'px'; }
        });
    };
    const onUp = () => { document.body.classList.remove('resizing'); handle.classList.remove('active'); overlay.remove(); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); saveNow(); };
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
}

// ========== UNDO ==========
function undo() {
    if (!hist.length) { toast('Нечего отменять', 'warning'); return; }
    const l = hist.pop();
    const td = workspaces[activeWorkspace].find(t => t.id === l.tid);
    if (!td) { toast('Таблица не найдена', 'error'); return; }
    switch (l.a) {
        case 'editCell': td.rows[l.d.ri][l.d.ci] = l.d.old; render(td); toast('Отменено', 'info'); break;
        case 'delRow':
        case 'delRowEnd':
            td.rows.splice(l.d.i, 0, l.d.r);
            if (l.d.merges) td.merges = l.d.merges.map(m => ({ ...m }));
            if (l.d.styles) td.styles = JSON.parse(JSON.stringify(l.d.styles));
            if (l.d.rowTypes) td.rowTypes = { ...l.d.rowTypes };
            if (l.d.notes) td.notes = { ...l.d.notes };
            render(td); toast('Строка возвращена', 'info'); break;
        case 'paste': td.rows.splice(l.d.si, l.d.count); render(td); toast('Удалено', 'info'); break;
    }
}

// ========== PASTE ==========
function parseClipboard(text) {
    if (!text || !text.trim()) return [];
    return text.trim().split(/\r?\n/).map(line => {
        if (line.includes('\t')) return line.split('\t');
        if (line.includes('|')) return line.split('|').map(c => c.trim()).filter(c => c);
        return [line];
    }).filter(r => r.some(c => String(c).trim()));
}
function paste() {
    const td = active(); if (!td) { toast('Выберите таблицу', 'warning'); return; }
    navigator.clipboard.readText().then(text => {
        const p = parseClipboard(text);
        if (!p.length) { toast('Нет данных', 'warning'); return; }
        insertRowsIntoTable(td, p);
    }).catch(() => { openPrompt('Вставьте данные:', '', (val) => { if (!val) return; const p = parseClipboard(val); if (p.length) insertRowsIntoTable(td, p); }); });
}
function insertRowsIntoTable(td, parsedRows) {
    if (!td || !parsedRows.length) return;
    let startIdx;
    if (td.rows.length === 1 && isEmptyRow(td.rows[0])) startIdx = 0;
    else startIdx = td.rows.length;
    parsedRows.forEach((r, pi) => {
        const nr = Array(td.cols.length).fill('');
        for (let i = 0; i < td.cols.length; i++) {
            let v = r[i] ?? '';
            const cn = td.cols[i].toLowerCase();
            if (isNumericCol(cn)) { const n = pn(v); if (!isNaN(n) && v !== '') v = n.toFixed(2); }
            nr[i] = v;
        }
        if (startIdx === 0 && pi === 0) td.rows[0] = nr;
        else td.rows.push(nr);
        calc(nr, td.cols);
    });
    hist.push({ a: 'paste', tid: td.id, d: { si: startIdx, count: parsedRows.length } });
    render(td);
    toast(`Вставлено ${parsedRows.length} строк`, 'success');
}
function pasteAt(td, ri, ci, parsed) {
    for (let r = 0; r < parsed.length; r++) {
        const targetR = ri + r;
        if (targetR >= td.rows.length) td.rows.push(Array(td.cols.length).fill(''));
        for (let c = 0; c < parsed[r].length; c++) {
            const targetC = ci + c;
            if (targetC >= td.cols.length) break;
            let v = parsed[r][c] ?? '';
            const cn = td.cols[targetC].toLowerCase();
            if (isNumericCol(cn)) { const n = pn(v); if (!isNaN(n) && v !== '') v = n.toFixed(2); }
            td.rows[targetR][targetC] = v;
        }
        calc(td.rows[targetR], td.cols);
    }
    render(td);
    toast(`Вставлено ${parsed.length}×${parsed[0].length}`, 'success');
}

// ========== FIND ==========
function openSearch() { const bar = Q('#searchBar'); bar.classList.add('show'); setTimeout(() => Q('#searchInput').focus(), 100); }
function closeSearch() {
    Q('#searchBar').classList.remove('show');
    lastSearch = { query: '', matches: [], idx: 0 };
    document.querySelectorAll('.search-hit, .search-active').forEach(el => el.classList.remove('search-hit', 'search-active'));
    Q('#searchCount') && (Q('#searchCount').textContent = '0/0');
}
function doSearch() {
    const td = active(); if (!td) return;
    const query = Q('#searchInput').value.trim();
    document.querySelectorAll('.search-hit, .search-active').forEach(el => el.classList.remove('search-hit', 'search-active'));
    if (!query) { lastSearch = { query: '', matches: [], idx: 0 }; Q('#searchCount').textContent = '0/0'; return; }
    const matches = [];
    td.rows.forEach((row, ri) => { row.forEach((v, ci) => { if (String(v ?? '').toLowerCase().includes(query.toLowerCase())) matches.push({ ri, ci }); }); });
    lastSearch = { query, matches, idx: 0 };
    Q('#searchCount').textContent = matches.length ? `1/${matches.length}` : '0/0';
    if (matches.length) highlightMatch(td, 0);
}
function highlightMatch(td, i) {
    document.querySelectorAll('.search-hit, .search-active').forEach(el => el.classList.remove('search-hit', 'search-active'));
    const m = lastSearch.matches[i]; if (!m) return;
    const tr = td.el.querySelector(`tbody tr[data-ri="${m.ri}"]`); if (!tr) return;
    const cell = tr.querySelector(`.cell[data-c="${m.ci}"]`);
    if (cell) { cell.parentElement.classList.add('search-hit'); tr.classList.add('search-active'); cell.focus(); cell.parentElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    Q('#searchCount').textContent = `${i + 1}/${lastSearch.matches.length}`;
}
function searchNext() { if (!lastSearch.matches.length) return; lastSearch.idx = (lastSearch.idx + 1) % lastSearch.matches.length; highlightMatch(active(), lastSearch.idx); }
function searchPrev() { if (!lastSearch.matches.length) return; lastSearch.idx = (lastSearch.idx - 1 + lastSearch.matches.length) % lastSearch.matches.length; highlightMatch(active(), lastSearch.idx); }

// ========== FIND & REPLACE ==========
let frMatches = [], frIdx = 0;
function openFR() {
    Q('#frModal').classList.add('show');
    Q('#frInfo').textContent = '';
    frMatches = []; frIdx = 0;
    setTimeout(() => Q('#frFind').focus(), 100);
}
function closeFR() { Q('#frModal').classList.remove('show'); }
function frDoSearch() {
    const td = active(); if (!td) return;
    const q = Q('#frFind').value;
    if (!q) { frMatches = []; Q('#frInfo').textContent = ''; return; }
    const caseSens = Q('#frCase').checked;
    const whole = Q('#frWhole').checked;
    frMatches = [];
    td.rows.forEach((row, ri) => row.forEach((v, ci) => {
        const s = String(v ?? '');
        let hay = caseSens ? s : s.toLowerCase();
        let needle = caseSens ? q : q.toLowerCase();
        let idx = hay.indexOf(needle);
        if (idx >= 0) {
            if (whole) {
                const before = idx === 0 || /\W/.test(hay[idx - 1]);
                const after = idx + needle.length === hay.length || /\W/.test(hay[idx + needle.length]);
                if (!before || !after) return;
            }
            frMatches.push({ ri, ci });
        }
    }));
    frIdx = 0;
    Q('#frInfo').textContent = frMatches.length ? `Найдено: ${frMatches.length}` : 'Ничего не найдено';
    if (frMatches.length) frHighlight(0);
}
function frHighlight(i) {
    const td = active(); if (!td || !frMatches.length) return;
    document.querySelectorAll('.search-hit').forEach(el => el.classList.remove('search-hit'));
    const m = frMatches[i];
    const tr = td.el.querySelector(`tbody tr[data-ri="${m.ri}"]`);
    if (!tr) return;
    const cell = tr.querySelector(`.cell[data-c="${m.ci}"]`);
    if (cell) { cell.parentElement.classList.add('search-hit'); cell.focus(); cell.parentElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    Q('#frInfo').textContent = `Найдено: ${frMatches.length} (${i + 1}/${frMatches.length})`;
}
function frFindNext() { if (!frMatches.length) return; frIdx = (frIdx + 1) % frMatches.length; frHighlight(frIdx); }
function frReplaceOne() {
    const td = active(); if (!td || !frMatches.length) return;
    const m = frMatches[frIdx];
    const q = Q('#frFind').value;
    const r = Q('#frReplace').value;
    const caseSens = Q('#frCase').checked;
    const s = String(td.rows[m.ri][m.ci] ?? '');
    const newS = caseSens ? s.replace(q, r) : s.replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), r);
    td.rows[m.ri][m.ci] = newS;
    render(td);
    frDoSearch();
}
function frReplaceAll() {
    const td = active(); if (!td) return;
    const q = Q('#frFind').value, r = Q('#frReplace').value;
    if (!q) return;
    const caseSens = Q('#frCase').checked;
    let count = 0;
    td.rows.forEach((row, ri) => row.forEach((v, ci) => {
        const s = String(v ?? '');
        if (!s) return;
        let newS;
        if (caseSens) newS = s.split(q).join(r);
        else newS = s.replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), r);
        if (newS !== s) { td.rows[ri][ci] = newS; count++; }
    }));
    if (count) { render(td); toast(`Заменено: ${count}`, 'success'); }
    else toast('Ничего не найдено', 'warning');
    frDoSearch();
}

// ========== TEMPLATES ==========
let templates = [];
function loadTemplates() {
    try { const raw = localStorage.getItem('ontek_templates'); if (raw) templates = JSON.parse(raw); } catch (e) {}
}
function saveTemplates() { localStorage.setItem('ontek_templates', JSON.stringify(templates)); }
function openTemplates() { Q('#tplModal').classList.add('show'); renderTemplates(); }
function closeTemplates() { Q('#tplModal').classList.remove('show'); }
function renderTemplates() {
    const el = Q('#tplList');
    if (!templates.length) { el.innerHTML = '<div style="color:var(--text-secondary);text-align:center;padding:20px 0;font-size:13px">Нет сохранённых шаблонов</div>'; return; }
    el.innerHTML = templates.map((t, i) => `<div class="tpl-item"><div><div class="tpl-item-name">${escapeHtml(t.name)}</div><div class="tpl-item-cols">${escapeHtml(t.cols.join(', '))}</div></div><div class="tpl-item-btns"><button class="tpl-item-btn" data-idx="${i}" data-act="apply">Применить</button><button class="tpl-item-btn danger" data-idx="${i}" data-act="del">Удалить</button></div></div>`).join('');
    el.querySelectorAll('button').forEach(b => {
        b.onclick = () => {
            const idx = +b.dataset.idx;
            if (b.dataset.act === 'apply') applyTemplate(templates[idx]);
            else { templates.splice(idx, 1); saveTemplates(); renderTemplates(); }
        };
    });
}
function applyTemplate(tpl) {
    const td = active(); if (!td) { toast('Выберите таблицу', 'warning'); return; }
    td.cols = [...tpl.cols];
    td.rows = td.rows.map(r => { const nr = [...r]; while (nr.length < td.cols.length) nr.push(''); return nr.slice(0, td.cols.length); });
    if (td.rows.length === 0) td.rows.push(Array(td.cols.length).fill(''));
    td.merges = []; td.styles = {}; td.rowTypes = {};
    render(td); closeTemplates();
    toast('Шаблон применён: ' + tpl.name, 'success');
}

// ========== PROMPT / CONFIRM ==========
function openPrompt(title, defaultValue, onOk) {
    const modal = Q('#promptModal');
    Q('#promptTitle').textContent = title;
    const input = Q('#promptInput');
    input.value = defaultValue || '';
    modal.classList.add('show');
    setTimeout(() => { input.focus(); input.select(); }, 50);
    window._promptOk = () => { modal.classList.remove('show'); if (onOk) onOk(input.value); };
    window._promptCancel = () => modal.classList.remove('show');
}
function openConfirm(title, message, onOk) {
    const modal = Q('#confirmModal');
    Q('#confirmTitle').textContent = title;
    Q('#confirmMessage').textContent = message;
    modal.classList.add('show');
    window._confirmOk = () => { modal.classList.remove('show'); if (onOk) onOk(); };
    window._confirmCancel = () => modal.classList.remove('show');
}

// ========== CTX ==========
function showCtx(x, y) {
    const cm = Q('#ctxMenu');
    cm.style.display = 'block';
    cm.style.left = Math.min(x, window.innerWidth - 260) + 'px';
    cm.style.top = Math.min(y, window.innerHeight - 600) + 'px';
}
function hideCtx() { Q('#ctxMenu').style.display = 'none'; }

// ========== COPY ==========
function copySelectedCells() {
    const td = active(); if (!td) return;
    if (cellSel.tid === td.id && cellSel.r1 >= 0) {
        const r1 = Math.min(cellSel.r1, cellSel.r2), r2 = Math.max(cellSel.r1, cellSel.r2);
        const c1 = Math.min(cellSel.c1, cellSel.c2), c2 = Math.max(cellSel.c1, cellSel.c2);
        const lines = [];
        for (let r = r1; r <= r2; r++) { const row = []; for (let c = c1; c <= c2; c++) row.push(td.rows[r][c] ?? ''); lines.push(row.join('\t')); }
        navigator.clipboard.writeText(lines.join('\n')).then(() => toast(`Скопировано ${r2 - r1 + 1}×${c2 - c1 + 1}`, 'success')).catch(() => toast('Ошибка', 'error'));
        return;
    }
    const sel = selectedRows[td.id];
    if (!sel || !sel.size) { toast('Выделите ячейки или строки', 'warning'); return; }
    const indices = [...sel].sort((a, b) => a - b);
    const lines = indices.map(i => td.rows[i].join('\t'));
    navigator.clipboard.writeText(lines.join('\n')).then(() => toast(`Скопировано ${indices.length} строк`, 'success')).catch(() => toast('Ошибка', 'error'));
}

// ========== SAVE (Excel) ==========
function save() {
    const ws = workspaces[activeWorkspace];
    if (!ws.length) { toast('Нет таблиц', 'warning'); return; }
    const palette = EXPORT_THEMES[exportTheme] || EXPORT_THEMES.blue;
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('Заказы');
    let cr = 1;
    const mc = Math.max(...ws.map(t => t.cols.length), 5);
    sheet.columns = Array(mc).fill({ width: 24 });
    ws.forEach(td => {
        const ni = ci(td.cols, 'Наименование'); if (ni >= 0) sheet.getColumn(ni + 1).width = 88;
        const qi = getQi(td.cols); if (qi >= 0) sheet.getColumn(qi + 1).width = 18;
        const pi = ci(td.cols, 'Цена'); if (pi >= 0) sheet.getColumn(pi + 1).width = 22;
        const ti = ci(td.cols, 'Стоимость'); if (ti >= 0) sheet.getColumn(ti + 1).width = 22;
    });

    ws.forEach(td => {
        if (!td.rows.length) return;
        const tc = td.cols.length;
        const qi = getQi(td.cols), pi = ci(td.cols, 'Цена'), ti = ci(td.cols, 'Стоимость'), ni = ci(td.cols, 'Наименование');

        // Header
        const hr = sheet.getRow(cr);
        td.cols.forEach((col, i) => {
            const cell = hr.getCell(i + 1);
            cell.value = formatHeader(col, td.currency);
            cell.font = { bold: true, size: 12, color: { argb: palette.headerText }, name: 'Calibri' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: palette.header } };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = { top: { style: 'thin', color: { argb: palette.borderDark } }, bottom: { style: 'thin', color: { argb: palette.borderDark } }, left: { style: 'thin', color: { argb: palette.borderDark } }, right: { style: 'thin', color: { argb: palette.borderDark } } };
        });
        hr.height = 28;
        cr++;
        const fdr = cr;

        // Data + sections
        for (let r = 0; r < td.rows.length; r++) {
            const isSection = td.rowTypes && td.rowTypes[r] === 'section';
            if (isSection) {
                try { sheet.mergeCells(cr, 1, cr, tc); } catch (e) {}
                const cell = sheet.getCell(cr, 1);
                cell.value = td.rows[r][0] ?? '';
                cell.font = { bold: true, size: 12, color: { argb: palette.sectionText }, name: 'Calibri' };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: palette.section } };
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                for (let c = 1; c <= tc; c++) {
                    const cc = sheet.getCell(cr, c);
                    cc.border = { top: { style: 'thin', color: { argb: palette.border } }, bottom: { style: 'thin', color: { argb: palette.border } }, left: { style: 'thin', color: { argb: palette.border } }, right: { style: 'thin', color: { argb: palette.border } } };
                }
                sheet.getRow(cr).height = 24;
                cr++;
                continue;
            }
            const row = sheet.getRow(cr);
            const bg = r % 2 === 0 ? palette.rowOdd : palette.rowEven;
            for (let c = 0; c < tc; c++) {
                const cell = row.getCell(c + 1);
                if (c === ti) cell.value = { formula: `${cA(cr, qi + 1)}*${cA(cr, pi + 1)}`, result: pn(td.rows[r][c]) || 0 };
                else if (c === qi || c === pi) { const v = pn(td.rows[r][c]); cell.value = isNaN(v) ? td.rows[r][c] : v; }
                else cell.value = td.rows[r][c] ?? '';
                if (c === ti || c === qi || c === pi) cell.numFmt = '#,##0.00';
                cell.font = { size: 11, color: { argb: 'FF1E293B' }, name: 'Calibri' };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                cell.border = { top: { style: 'thin', color: { argb: palette.border } }, bottom: { style: 'thin', color: { argb: palette.border } }, left: { style: 'thin', color: { argb: palette.border } }, right: { style: 'thin', color: { argb: palette.border } } };
                const st = getCellStyle(td, r, c);
                if (st.bold) cell.font = { ...cell.font, bold: true };
                if (st.italic) cell.font = { ...cell.font, italic: true };
                if (st.underline) cell.font = { ...cell.font, underline: true };
                if (st.strike) cell.font = { ...cell.font, strike: true };
                if (st.color) cell.font = { ...cell.font, color: { argb: 'FF' + st.color.replace('#','').toUpperCase() } };
                if (st.bg) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + st.bg.replace('#','').toUpperCase() } };
                if (st.fontSize) cell.font = { ...cell.font, size: st.fontSize };
                if (st.fontFamily) cell.font = { ...cell.font, name: st.fontFamily.split(',')[0].replace(/['"]/g,'').trim() };
                if (st.align) cell.alignment = { ...cell.alignment, horizontal: st.align };
                if (c === ni && !st.align) cell.alignment = { ...cell.alignment, horizontal: 'left' };
                if ((c === qi || c === pi || c === ti) && !st.align) cell.alignment = { ...cell.alignment, horizontal: 'right' };
            }
            cr++;
        }
        // Merges
        if (td.merges) td.merges.forEach(m => { try { sheet.mergeCells(fdr + m.r1, m.c1 + 1, fdr + m.r2, m.c2 + 1); } catch (e) {} });

        // Total
        const ldr = cr - 1;
        const tr = sheet.getRow(cr);
        for (let c = 0; c < tc; c++) {
            const cell = tr.getCell(c + 1);
            if (c === (ti >= 0 ? ti - 1 : tc - 2)) cell.value = 'Итого';
            else if (c === ti) cell.value = { formula: `SUM(${cA(fdr, ti + 1)}:${cA(ldr, ti + 1)})`, result: sumT(td) };
            if (c === ti) cell.numFmt = '#,##0.00';
            cell.font = { bold: true, size: 12, name: 'Calibri' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: palette.total } };
            cell.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
            cell.border = { top: { style: 'medium', color: { argb: palette.borderDark } }, bottom: { style: 'medium', color: { argb: palette.borderDark } }, left: { style: 'thin', color: { argb: palette.border } }, right: { style: 'thin', color: { argb: palette.border } } };
        }
        tr.height = 28;
        cr += 2;
    });

    wb.xlsx.writeBuffer().then(buf => {
        const fn = `Заказы_ONTEK_${new Date().toISOString().slice(0, 10)}.xlsx`;
        if (window.pywebview && window.pywebview.api) {
            const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
            window.pywebview.api.save_file(b64, fn).then(r => { const j = JSON.parse(r); if (j.success) toast('Файл сохранён', 'success'); else toast('Отменено', 'info'); });
        } else {
            const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = fn;
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
            toast('Файл сохранён', 'success');
        }
    }).catch(() => toast('Ошибка сохранения', 'error'));
}

// ========== CSV EXPORT ==========
function exportCSV() {
    const td = active(); if (!td) { toast('Выберите таблицу', 'warning'); return; }
    const lines = [];
    lines.push(td.cols.map(c => formatHeader(c, td.currency)).join(';'));
    td.rows.forEach((row, ri) => {
        if (td.rowTypes && td.rowTypes[ri] === 'section') { lines.push('"' + String(row[0] ?? '').replace(/"/g, '""') + '"'); return; }
        lines.push(row.map(v => { const s = String(v ?? ''); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(';'));
    });
    const csv = '\ufeff' + lines.join('\n');
    const fn = `Заказы_ONTEK_${new Date().toISOString().slice(0, 10)}.csv`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    if (window.pywebview && window.pywebview.api) {
        const reader = new FileReader();
        reader.onload = () => {
            const b64 = reader.result.split(',')[1];
            window.pywebview.api.save_file(b64, fn).then(r => { const j = JSON.parse(r); if (j.success) toast('CSV сохранён', 'success'); else toast('Отменено', 'info'); });
        };
        reader.readAsDataURL(blob);
    } else {
        const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = fn;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        toast('CSV сохранён', 'success');
    }
}

// ========== PRINT ==========
function printView() {
    const td = active(); if (!td) { toast('Выберите таблицу', 'warning'); return; }
    const palette = EXPORT_THEMES[exportTheme] || EXPORT_THEMES.blue;
    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Печать</title><style>
        body { font-family: 'Segoe UI', sans-serif; padding: 20px; }
        h1 { font-size: 18px; margin-bottom: 20px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th { background: #${palette.header.substring(2)}; color: #fff; padding: 8px; font-size: 11px; border: 1px solid #${palette.borderDark.substring(2)}; }
        td { padding: 6px 10px; font-size: 11px; border: 1px solid #${palette.border.substring(2)}; }
        tr:nth-child(even) td { background: #${palette.rowEven.substring(2)}; }
        .section { background: #${palette.section.substring(2)}; color: #${palette.sectionText.substring(2)}; text-align: center; font-weight: 700; padding: 10px; }
        .total { background: #${palette.total.substring(2)}; font-weight: 700; }
        @media print { body { padding: 0; } }
    </style></head><body><h1>Таблица ${td.currency}</h1><table><thead><tr>`;
    td.cols.forEach(c => html += `<th>${escapeHtml(formatHeader(c, td.currency))}</th>`);
    html += '</tr></thead><tbody>';
    td.rows.forEach((row, ri) => {
        if (td.rowTypes && td.rowTypes[ri] === 'section') { html += `<tr><td colspan="${td.cols.length}" class="section">${escapeHtml(row[0])}</td></tr>`; return; }
        html += '<tr>';
        row.forEach(v => html += `<td>${escapeHtml(v)}</td>`);
        html += '</tr>';
    });
    if (tableSettings.showTotals) {
        html += `<tr class="total"><td colspan="${td.cols.length - 1}" style="text-align:right">Итого</td><td style="text-align:right">${sumT(td).toFixed(2)}</td></tr>`;
    }
    html += '</tbody></table></body></html>';
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 300); }
    else toast('Разрешите всплывающие окна', 'warning');
}

// ========== LOAD ==========
function loadFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const name = (file.name || '').toLowerCase();
            if (name.endsWith('.csv')) {
                const text = new TextDecoder('utf-8').decode(new Uint8Array(e.target.result));
                const rows = text.split(/\r?\n/).filter(l => l.trim()).map(l => {
                    const parts = []; let cur = '', inQ = false;
                    for (let i = 0; i < l.length; i++) {
                        const ch = l[i];
                        if (ch === '"') { if (inQ && l[i+1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
                        else if ((ch === ';' || ch === ',') && !inQ) { parts.push(cur); cur = ''; }
                        else cur += ch;
                    }
                    parts.push(cur);
                    return parts;
                });
                processCSV(rows);
            } else {
                const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                processWB(wb);
            }
        } catch (er) {
            toast('Ошибка чтения файла', 'error');
            if (!workspaces[activeWorkspace].length) addTable('USD');
        }
    };
    reader.readAsArrayBuffer(file);
}
async function loadViaDialog() {
    if (window.pywebview && window.pywebview.api) {
        const r = JSON.parse(await window.pywebview.api.load_file());
        if (r.success) {
            const bs = atob(r.data); const bytes = new Uint8Array(bs.length);
            for (let i = 0; i < bs.length; i++) bytes[i] = bs.charCodeAt(i);
            processWB(XLSX.read(bytes, { type: 'array' }));
        }
    } else Q('#fileInput').click();
}
function processCSV(rows) {
    if (!rows.length) return;
    const area = getArea(); area.innerHTML = '';
    const ws = workspaces[activeWorkspace]; ws.length = 0; idC = 0; actId = null;
    let cols = null, dataRows = [];
    for (const row of rows) {
        const lower = row.map(c => c.toLowerCase());
        if (!cols && lower.some(c => c.includes('артикул') || c.includes('наименование'))) {
            cols = row.filter(h => h.trim());
        } else if (cols) {
            if (row.every(c => !c.trim())) continue;
            dataRows.push(row);
        }
    }
    if (!cols) { cols = [...DEFAULT_COLS]; dataRows = rows; }
    idC++;
    const td = { id: idC, cols, rows: dataRows, currency: 'RUB', el: null, card: null, merges: [], styles: {}, rowTypes: {}, notes: {} };
    ws.push(td);
    const card = buildCardDOM(td); area.appendChild(card); td.card = card;
    render(td); setAct(td.id); updateStatusBar();
    toast('CSV загружен', 'success');
}
function processWB(wb) {
    setStatus('Загрузка файла...', 'busy');
    const area = getArea(); area.innerHTML = '';
    const ws = workspaces[activeWorkspace]; ws.length = 0; idC = 0; actId = null;
    sortState = {}; selectedRows = {}; clearCellSelection();

    wb.SheetNames.forEach(sheetName => {
        const raw = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: '' });
        if (!raw.length) return;
        let cur = null, ec = 0, skipCols = 0;
        for (let i = 0; i < raw.length; i++) {
            const row = raw[i];
            const empty = !row || row.every(c => String(c ?? '').trim() === '');
            if (empty) { ec++; if (ec >= 2 && cur && cur.rows.length) { fin(cur); cur = null; } continue; }
            ec = 0;
            if (row.some(c => String(c || '').trim().toLowerCase().startsWith('итого'))) { if (cur && cur.rows.length) { fin(cur); cur = null; } continue; }
            const isHeader = row.some(c => { const s = String(c || '').toLowerCase(); return s.includes('артикул') || s.includes('наименование'); });
            if (isHeader) {
                if (cur && cur.rows.length) fin(cur);
                skipCols = 0;
                let hs = row.map(c => String(c || '').trim());
                while (hs.length && /^№+$/i.test(hs[0].trim())) { hs = hs.slice(1); skipCols++; }
                while (hs.length && /^№\s*п\/п$/i.test(hs[0].trim())) { hs = hs.slice(1); skipCols++; }
                const cleaned = hs.map(c => c.replace(/,?\s*(USD|RUB)\s*с НДС/i, ''));
                const filtered = cleaned.filter(h => h);
                const det = row.join(' ').includes('USD') ? 'USD' : 'RUB';
                cur = { cols: filtered.length ? filtered : [...DEFAULT_COLS], rows: [], currency: det };
                continue;
            }
            if (!cur) cur = { cols: [...DEFAULT_COLS], rows: [], currency: 'RUB' };
            const dr = skipCols ? row.slice(skipCols) : row.slice();
            const nr = [];
            for (let ci2 = 0; ci2 < cur.cols.length; ci2++) {
                let v = String(dr[ci2] ?? '').trim();
                const cn = (cur.cols[ci2] || '').toLowerCase();
                if (isNumericCol(cn)) { const num = pn(v); if (!isNaN(num) && v !== '') v = parseFloat(num.toFixed(2)); }
                nr.push(v);
            }
            cur.rows.push(nr);
        }
        if (cur && cur.rows.length) fin(cur);
        function fin(c) {
            if (!c.cols.length) c.cols = [...DEFAULT_COLS];
            if (!c.rows.length) c.rows = [Array(c.cols.length).fill('')];
            idC++;
            ws.push({ id: idC, cols: c.cols, rows: c.rows, currency: c.currency, el: null, card: null, merges: [], styles: {}, rowTypes: {}, notes: {} });
        }
    });
    ws.forEach(td => { const card = buildCardDOM(td); area.appendChild(card); td.card = card; render(td); });
    upEmpty();
    if (!ws.length) { addTable('USD'); setStatus('Файл пуст', 'warning'); }
    else { setAct(ws[0].id); updateStatusBar(); setStatus(`Загружено: ${ws.length} табл.`, 'ok'); toast(`Загружено ${ws.length} таблиц`, 'success'); }
}

// ========== HOTKEYS ==========
function findConflict(key, exclude) { for (const [k, v] of Object.entries(hotkeys)) { if (k !== exclude && v === key) return k; } return null; }
function renderHotkeyList() {
    const c = Q('#hotkeyList'); if (!c) return;
    c.innerHTML = Object.keys(DEFAULT_HOTKEYS).map(k => { const key = hotkeys[k] || ''; return `<div class="hotkey-row"><span class="hotkey-label">${escapeHtml(KEY_LABELS[k] || k)}</span><span class="hotkey-key" data-hk="${k}">${key ? 'Shift+' + hkDisplay(key) : '—'}</span></div>`; }).join('');
    c.querySelectorAll('.hotkey-key').forEach(el => el.onclick = () => startRecording(el));
}
function startRecording(el) {
    if (recordingKey) recordingKey.classList.remove('recording');
    recordingKey = el; recordingHk = el.dataset.hk; el.classList.add('recording'); el.textContent = '...';
    const handler = e => {
        e.preventDefault(); e.stopPropagation();
        let key = e.key.toUpperCase();
        if (key === 'DELETE' || key === 'DEL') key = 'DELETE';
        if (key === 'CONTROL' || key === 'SHIFT' || key === 'ALT') return;
        const conflict = findConflict(key, recordingHk);
        if (conflict && conflict !== recordingHk) {
            if (!confirm(`Клавиша Shift+${hkDisplay(key)} уже на «${KEY_LABELS[conflict]}». Переназначить?`)) {
                el.textContent = hotkeys[recordingHk] ? 'Shift+' + hkDisplay(hotkeys[recordingHk]) : '—';
                el.classList.remove('recording'); recordingKey = null; recordingHk = null;
                document.removeEventListener('keydown', handler); return;
            }
            hotkeys[conflict] = '';
        }
        hotkeys[recordingHk] = key;
        el.textContent = 'Shift+' + hkDisplay(key); el.classList.remove('recording');
        const label = KEY_LABELS[recordingHk];
        recordingKey = null; recordingHk = null;
        saveNow(); updateAllHKDisplays(); renderHotkeyList();
        document.removeEventListener('keydown', handler);
        toast(`«${label}» → Shift+${hkDisplay(key)}`, 'success');
    };
    document.addEventListener('keydown', handler);
}

// ========== THEMES ==========
function renderThemeOptions(containerId) {
    const c = document.getElementById(containerId); if (!c) return;
    c.innerHTML = COLOR_THEMES.map(t => `<div class="theme-card ${t.id === colorTheme ? 'active' : ''}" data-theme="${t.id}"><div class="theme-preview" style="background:${t.gradient}">${t.letter}</div><div class="theme-name">${t.name}</div><div class="theme-desc">${t.desc}</div></div>`).join('');
    c.querySelectorAll('.theme-card').forEach(cd => cd.onclick = () => setColorTheme(cd.dataset.theme));
}
function renderExportThemes(containerId) {
    const c = document.getElementById(containerId); if (!c) return;
    c.innerHTML = Object.entries(EXPORT_THEMES).map(([k, t]) => `<div class="export-theme ${k === exportTheme ? 'active' : ''}" data-theme="${k}"><div class="export-theme-preview" style="background:${t.preview}">${t.name[0]}</div><div class="export-theme-name">${t.name}</div></div>`).join('');
    c.querySelectorAll('.export-theme').forEach(el => el.onclick = () => setExportTheme(el.dataset.theme));
}
function toggleSection(id) { const t = document.querySelector(`[data-toggle="${id}"]`), b = document.getElementById(id); if (!t || !b) return; t.classList.toggle('open'); b.classList.toggle('open'); }

// ========== GLOBAL HOTKEYS ==========
function handleGlobalHotkeys(e) {
    const inCell = e.target.closest('.cell[contenteditable="true"]');
    if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        const k = e.key.toLowerCase();
        if (inCell && (k === 'b' || k === 'i' || k === 'u')) return;
        if (k === 'z') { e.preventDefault(); undo(); return; }
        if (k === 'f') { e.preventDefault(); openSearch(); return; }
        if (k === 'h') { e.preventDefault(); openFR(); return; }
        if (k === 't') { e.preventDefault(); toggleTheme(); return; }
        if (k >= '1' && k <= '5') { e.preventDefault(); switchWorkspace(+k); return; }
        if (k === 's') { e.preventDefault(); save(); return; }
        if (k === 'o') { e.preventDefault(); loadViaDialog(); return; }
        if (k === 'v' && !inCell) { e.preventDefault(); paste(); return; }
        if (k === 'd' && !inCell) { e.preventDefault(); dupTable(); return; }
        if (k === 'c' && !inCell) { const td = active(); if (td && ((cellSel.tid === td.id && cellSel.r1 >= 0) || (selectedRows[td.id] && selectedRows[td.id].size > 0))) { e.preventDefault(); copySelectedCells(); return; } }
    }
    if (e.key === 'Escape') { hideCtx(); closeSearch(); closeFR(); clearCellSelection(); return; }
    if (e.key === 'F3') { e.preventDefault(); if (lastSearch.matches.length) searchNext(); return; }
    if (e.shiftKey && !e.ctrlKey && !e.altKey && !inCell && !recordingKey) {
        let key = e.key.toUpperCase();
        if (e.code === 'Digit1') key = '1'; if (e.code === 'Digit2') key = '2'; if (e.code === 'Delete') key = 'DELETE';
        if (e.code === 'Numpad1') key = '1'; if (e.code === 'Numpad2') key = '2'; if (e.code === 'NumpadDecimal') key = 'DELETE';
        if (RU_KEYS[key]) key = RU_KEYS[key];
        const actions = {
            addRow: () => { const t = active(); if (t) addRowEnd(t); },
            delRow: () => { const t = active(); if (t) delRowEnd(t); },
            addCol: () => { const t = active(); if (t) addColEnd(t); },
            delCol: () => { const t = active(); if (t) delColEnd(t); },
            recalc: () => { workspaces[activeWorkspace].forEach(td => { td.rows.forEach(r => calc(r, td.cols)); render(td); }); toast('Пересчитано', 'success'); },
            paste: () => paste(),
            load: () => loadViaDialog(),
            newRUB: () => addTable('RUB'),
            newUSD: () => addTable('USD'),
            dup: () => dupTable(),
            clear: () => { const area = getArea(); if (!workspaces[activeWorkspace].length) return; openConfirm('Очистить?', 'Все таблицы удалятся.', () => { area.innerHTML = ''; workspaces[activeWorkspace].length = 0; idC = 0; actId = null; upEmpty(); updateStatusBar(); toast('Очищено', 'info'); }); },
            undo: () => undo(),
            save: () => save(),
            convert: () => { const t = active(); if (t) convertCurrency(t); }
        };
        for (const [k, v] of Object.entries(hotkeys)) { if (key === v && actions[k]) { e.preventDefault(); actions[k](); return; } }
    }
}
function handleGlobalPaste(e) { if (e.target.closest('.cell[contenteditable="true"]')) return; e.preventDefault(); paste(); }

document.addEventListener('mouseup', () => { if (cellSel.dragging) cellSel.dragging = false; });

// ========== BIND ==========
function bindAllEvents() {
    Q('#btnTheme').onclick = toggleTheme;
    Q('#fileInput').onchange = e => { if (e.target.files[0]) { loadFile(e.target.files[0]); e.target.value = ''; } };
    Q('#btnSettings').onclick = () => { Q('#settingsModal').classList.add('show'); renderHotkeyList(); renderThemeOptions('themeOptionsSettings'); renderExportThemes('exportThemes'); };
    Q('#btnCloseSettings').onclick = () => Q('#settingsModal').classList.remove('show');
    Q('#settingsModal').addEventListener('click', function (e) { if (e.target === this) this.classList.remove('show'); });
    Q('#btnResetHotkeys').onclick = () => { hotkeys = { ...DEFAULT_HOTKEYS }; saveNow(); updateAllHKDisplays(); renderHotkeyList(); toast('Сброшено', 'info'); };
    Q('#btnResetTable') && (Q('#btnResetTable').onclick = resetTableSettings);
    document.querySelectorAll('[data-toggle]').forEach(el => el.onclick = () => toggleSection(el.dataset.toggle));

    // Table settings
    Q('#setRowHeight').oninput = () => { tableSettings.rowHeight = +Q('#setRowHeight').value; Q('#valRowHeight').textContent = Q('#setRowHeight').value + ' px'; applyTableSettings(); };
    Q('#setFontSize').oninput = () => { tableSettings.fontSize = +Q('#setFontSize').value; Q('#valFontSize').textContent = Q('#setFontSize').value + ' px'; applyTableSettings(); };
    Q('#setFontFamily').onchange = () => { tableSettings.fontFamily = Q('#setFontFamily').value; applyTableSettings(); };
    Q('#setPadding').oninput = () => { tableSettings.padding = +Q('#setPadding').value; Q('#valPadding').textContent = Q('#setPadding').value + ' px'; applyTableSettings(); };
    Q('#setWrapText').onchange = () => { tableSettings.wrapText = Q('#setWrapText').checked; applyTableSettings(); };
    Q('#setShowRowNums').onchange = () => { tableSettings.showRowNums = Q('#setShowRowNums').checked; applyTableSettings(); };
    Q('#setShowTotals').onchange = () => { tableSettings.showTotals = Q('#setShowTotals').checked; applyTableSettings(); };
    Q('#setZebra').onchange = () => { tableSettings.zebra = Q('#setZebra').checked; applyTableSettings(); };
    Q('#setVGrid').onchange = () => { tableSettings.vGrid = Q('#setVGrid').checked; applyTableSettings(); };
    Q('#setHGrid').onchange = () => { tableSettings.hGrid = Q('#setHGrid').checked; applyTableSettings(); };
    Q('#setRounded').onchange = () => { tableSettings.rounded = Q('#setRounded').checked; applyTableSettings(); };
    Q('#setShowToasts').onchange = () => { notifySettings.enabled = Q('#setShowToasts').checked; saveNow(); };
    Q('#setToastPos').onchange = () => { notifySettings.position = Q('#setToastPos').value; updateToastPosition(); saveNow(); };
    Q('#setToastDur').oninput = () => { notifySettings.duration = +Q('#setToastDur').value; Q('#valToastDur').textContent = (+Q('#setToastDur').value / 1000).toFixed(1) + ' s'; saveNow(); };

    Q('#btnColorTheme').onclick = () => { Q('#colorThemeModal').classList.add('show'); renderThemeOptions('colorThemeOptions'); };
    Q('#btnCloseColorTheme').onclick = () => Q('#colorThemeModal').classList.remove('show');
    Q('#colorThemeModal').addEventListener('click', function (e) { if (e.target === this) this.classList.remove('show'); });

    // FR
    Q('#frClose').onclick = closeFR;
    Q('#frModal').addEventListener('click', function (e) { if (e.target === this) closeFR(); });
    Q('#frFind').addEventListener('input', frDoSearch);
    Q('#frFind').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); frFindNext(); } });
    Q('#frReplace').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); frReplaceOne(); } });
    Q('#frFindNext').onclick = frFindNext;
    Q('#frReplaceOne').onclick = frReplaceOne;
    Q('#frReplaceAll').onclick = frReplaceAll;

    // Templates
    Q('#tplClose').onclick = closeTemplates;
    Q('#tplModal').addEventListener('click', function (e) { if (e.target === this) closeTemplates(); });
    Q('#tplSave').onclick = () => {
        const td = active(); if (!td) return;
        const name = Q('#tplName').value.trim();
        if (!name) { toast('Введите название', 'warning'); return; }
        templates.push({ name, cols: [...td.cols] });
        saveTemplates(); Q('#tplName').value = ''; renderTemplates();
        toast('Шаблон сохранён', 'success');
    };

    // Sidebar
    const sb = (id, fn, retries = 5) => { const el = document.getElementById(id); if (el) { el.onclick = fn; return; } if (retries > 0) setTimeout(() => sb(id, fn, retries - 1), 100); };
    sb('btnAddRow', () => { const t = active(); if (t) addRowEnd(t); else toast('Выберите таблицу', 'warning'); });
    sb('btnAddSection', () => { const t = active(); if (t) addSectionRow(t); else toast('Выберите таблицу', 'warning'); });
    sb('btnDelRow', () => { const t = active(); if (t) delRowEnd(t); else toast('Выберите таблицу', 'warning'); });
    sb('btnAddCol', () => { const t = active(); if (t) addColEnd(t); else toast('Выберите таблицу', 'warning'); });
    sb('btnDelCol', () => { const t = active(); if (t) delColEnd(t); else toast('Выберите таблицу', 'warning'); });
    sb('btnConvert', () => { const t = active(); if (t) convertCurrency(t); else toast('Выберите таблицу', 'warning'); });
    sb('btnRecalc', () => { workspaces[activeWorkspace].forEach(td => { td.rows.forEach(r => calc(r, td.cols)); render(td); }); toast('Пересчитано', 'success'); });
    sb('btnPaste', paste);
    sb('btnDup', () => dupTable());
    sb('btnFind', openSearch);
    sb('btnReplace', openFR);
    sb('btnTemplates', openTemplates);
    sb('btnNewRUB', () => addTable('RUB'));
    sb('btnNewUSD', () => addTable('USD'));
    sb('btnSave', save);
    sb('btnExportCSV', exportCSV);
    sb('btnPrint', printView);
    sb('btnLoad', loadViaDialog);
    sb('btnClear', () => { if (!workspaces[activeWorkspace].length) return; openConfirm('Очистить?', 'Все таблицы удалятся.', () => { getArea().innerHTML = ''; workspaces[activeWorkspace].length = 0; idC = 0; actId = null; upEmpty(); updateStatusBar(); toast('Очищено', 'info'); }); });
    sb('btnUndo', undo);

    // Prompt / Confirm
    Q('#promptOk').onclick = () => { if (window._promptOk) window._promptOk(); };
    Q('#promptCancel').onclick = () => { if (window._promptCancel) window._promptCancel(); };
    Q('#promptInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (window._promptOk) window._promptOk(); } if (e.key === 'Escape') { if (window._promptCancel) window._promptCancel(); } });
    Q('#confirmOk').onclick = () => { if (window._confirmOk) window._confirmOk(); };
    Q('#confirmCancel').onclick = () => { if (window._confirmCancel) window._confirmCancel(); };

    // Search
    Q('#searchInput').addEventListener('input', doSearch);
    Q('#searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (e.shiftKey) searchPrev(); else searchNext(); } if (e.key === 'Escape') closeSearch(); });
    Q('#searchNext').onclick = searchNext;
    Q('#searchPrev').onclick = searchPrev;
    Q('#searchClose').onclick = closeSearch;

    // Toolbar
    document.querySelectorAll('.tb-btn[data-cmd]').forEach(btn => {
        btn.onclick = e => {
            e.preventDefault();
            const cmd = btn.dataset.cmd;
            const td = active();
            switch (cmd) {
                case 'addSection': if (td) addSectionRow(td); else toast('Выберите таблицу', 'warning'); break;
                case 'addRow': if (td) addRowEnd(td); else toast('Выберите таблицу', 'warning'); break;
                case 'delRow': if (td) delRowEnd(td); else toast('Выберите таблицу', 'warning'); break;
                case 'bold': toggleStyle('bold'); break;
                case 'italic': toggleStyle('italic'); break;
                case 'underline': toggleStyle('underline'); break;
                case 'strike': toggleStyle('strike'); break;
                case 'alignLeft': setAlign('left'); break;
                case 'alignCenter': setAlign('center'); break;
                case 'alignRight': setAlign('right'); break;
                case 'merge':
                    if (td && cellSel.tid === td.id && cellSel.r1 >= 0) mergeRect(td, cellSel.r1, cellSel.c1, cellSel.r2, cellSel.c2);
                    else toast('Выделите диапазон ячеек', 'warning');
                    break;
                case 'unmerge':
                    if (td && cellSel.r1 >= 0) unmergeAt(td, cellSel.anchorR, cellSel.anchorC);
                    else toast('Кликните на объединённую ячейку', 'warning');
                    break;
                case 'clearFormat': clearFormat(); break;
                case 'autofit': if (td && cellSel.r1 >= 0) autoFitColumn(td, cellSel.c1); else toast('Выделите ячейку', 'warning'); break;
            }
        };
    });

    // Color palettes
    const buildPalette = (el, cb) => {
        el.innerHTML = COLOR_PALETTE.map(c => c === null ? `<div class="color-swatch none" data-color=""></div>` : `<div class="color-swatch" style="background:${c}" data-color="${c}"></div>`).join('');
        el.querySelectorAll('.color-swatch').forEach(s => s.onclick = () => { cb(s.dataset.color); el.classList.remove('show'); });
    };
    buildPalette(Q('#textColorPalette'), c => setCellColor('color', c));
    buildPalette(Q('#bgColorPalette'), c => setCellColor('bg', c));
    document.querySelectorAll('.color-btn').forEach(b => {
        b.onclick = e => {
            e.stopPropagation();
            const palette = b.parentElement.querySelector('.color-palette');
            const wasOpen = palette.classList.contains('show');
            document.querySelectorAll('.color-palette').forEach(p => p.classList.remove('show'));
            if (!wasOpen) palette.classList.add('show');
        };
    });
    document.addEventListener('click', e => { if (!e.target.closest('.color-picker')) document.querySelectorAll('.color-palette').forEach(p => p.classList.remove('show')); });

    // Font/size selects
    Q('#tbFontFamily').onchange = () => {
        const v = Q('#tbFontFamily').value;
        const td = active(); if (!td) return;
        if (cellSel.r1 < 0 && activeTbCell) selectCell(td, activeTbCell.r, activeTbCell.c, false);
        if (cellSel.r1 < 0) { toast('Выделите ячейку', 'warning'); return; }
        forEachSelectedCell(td, (r, c) => setCellStyle(td, r, c, { fontFamily: v || null }));
        render(td);
    };
    Q('#tbFontSize').onchange = () => {
        const v = Q('#tbFontSize').value;
        const td = active(); if (!td) return;
        if (cellSel.r1 < 0 && activeTbCell) selectCell(td, activeTbCell.r, activeTbCell.c, false);
        if (cellSel.r1 < 0) { toast('Выделите ячейку', 'warning'); return; }
        forEachSelectedCell(td, (r, c) => setCellStyle(td, r, c, { fontSize: v ? +v : null }));
        render(td);
    };

    // Context menu
    Q('#ctxMenu').addEventListener('click', e => {
        const item = e.target.closest('.ctx-item'); if (!item) return;
        const action = item.dataset.action;
        hideCtx();
        const td = active();
        const ctx = window._ctxD || {};
        if (!td && action !== 'paste') return;
        if (td) setAct(td.id);
        switch (action) {
            case 'addRowAbove': if (td && ctx.ri != null) insRowAbove(td, ctx.ri); break;
            case 'addRowBelow': if (td && ctx.ri != null) insRowBelow(td, ctx.ri); break;
            case 'addSection': if (td) addSectionRow(td, ctx.ri != null ? ctx.ri : undefined); break;
            case 'dupRow': if (td && ctx.ri != null) dupRow(td, ctx.ri); break;
            case 'delRow': if (td && ctx.ri != null) delRow(td, ctx.ri); break;
            case 'mergeCells':
                if (!td) break;
                if (cellSel.tid === td.id && cellSel.r1 >= 0) mergeRect(td, cellSel.r1, cellSel.c1, cellSel.r2, cellSel.c2);
                else if (ctx.ri != null && ctx.ci != null) { if (ctx.ri < td.rows.length - 1) mergeRect(td, ctx.ri, ctx.ci, ctx.ri + 1, ctx.ci); }
                break;
            case 'unmergeCells': if (td && ctx.ri != null && ctx.ci != null) unmergeAt(td, ctx.ri, ctx.ci); break;
            case 'bold': toggleStyle('bold'); break;
            case 'italic': toggleStyle('italic'); break;
            case 'underline': toggleStyle('underline'); break;
            case 'strike': toggleStyle('strike'); break;
            case 'clearFormat': clearFormat(); break;
            case 'addNote': {
                if (!td || ctx.ri == null || ctx.ci == null) break;
                const key = ctx.ri + ':' + ctx.ci;
                const existing = (td.notes && td.notes[key]) || '';
                openPrompt('Заметка к ячейке:', existing, (v) => {
                    if (!td.notes) td.notes = {};
                    if (v.trim()) td.notes[key] = v.trim();
                    else delete td.notes[key];
                    render(td);
                });
                break;
            }
            case 'renameCol': if (td && ctx.ci != null) renameCol(td, ctx.ci); break;
            case 'addColBefore': if (td && ctx.ci != null) insCol(td, ctx.ci); break;
            case 'addColAfter': if (td && ctx.ci != null) insCol(td, ctx.ci + 1); break;
            case 'dupCol': if (td && ctx.ci != null) dupCol(td, ctx.ci); break;
            case 'autoFitCol': if (td && ctx.ci != null) autoFitColumn(td, ctx.ci); break;
            case 'delCol': if (td && ctx.ci != null) delCol(td, ctx.ci); break;
            case 'copyCells': copySelectedCells(); break;
            case 'paste': paste(); break;
            case 'dupTable': if (td) dupTable(td); break;
            case 'delTable':
                if (td) {
                    const ws = workspaces[activeWorkspace];
                    if (ws.length <= 1) { toast('Нужна хотя бы одна', 'warning'); break; }
                    openConfirm('Удалить таблицу?', 'Без восстановления.', () => { td.card.remove(); ws.splice(ws.indexOf(td), 1); if (actId === td.id) actId = ws.length ? ws[0].id : null; upEmpty(); updateStatusBar(); toast('Удалена', 'info'); });
                }
                break;
        }
    });
    document.addEventListener('click', e => { if (!Q('#ctxMenu').contains(e.target)) hideCtx(); });

    document.addEventListener('keydown', handleGlobalHotkeys);
    document.addEventListener('paste', handleGlobalPaste);
}
