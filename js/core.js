// ==================== ONTEK v7.0.0 — CORE ====================
// Константы, состояние, утилиты, формулы, валюты

const DEFAULT_COLS = ['Артикул','Наименование','Ко-во, шт','Цена','Стоимость'];

const RU_KEYS = { 'Ф':'A','А':'A','В':'D','Д':'D','С':'C','Ц':'C','Ч':'X','Х':'X','К':'R','Р':'R','М':'V','Ж':'V','Щ':'O','О':'O','Г':'U','У':'U','Ы':'S','Я':'Z','Ь':'DELETE','Т':'DELETE','1':'1','2':'2','3':'3','4':'4','5':'5' };

const DEFAULT_HOTKEYS = {
    addRow:'A', delRow:'D', addCol:'C', delCol:'X', recalc:'R', paste:'V',
    load:'O', newRUB:'1', newUSD:'2', dup:'U', clear:'DELETE', undo:'Z',
    save:'S', convert:'K'
};

const KEY_LABELS = {
    addRow:'Добавить строку', delRow:'Удалить строку',
    addCol:'Добавить колонку', delCol:'Удалить колонку',
    recalc:'Пересчитать', paste:'Вставить',
    load:'Загрузить', newRUB:'Новая RUB', newUSD:'Новая USD',
    dup:'Дублировать', clear:'Очистить', undo:'Отменить',
    save:'Сохранить', convert:'Конвертировать валюту'
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

const COLOR_THEMES = [
    { id:'blue',   name:'Синяя',      desc:'Классика',  gradient:'linear-gradient(135deg,#6366f1,#4f46e5)', letter:'S' },
    { id:'green',  name:'Зелёная',    desc:'Природа',   gradient:'linear-gradient(135deg,#10b981,#059669)', letter:'G' },
    { id:'purple', name:'Фиолетовая', desc:'Креатив',   gradient:'linear-gradient(135deg,#8b5cf6,#7c3aed)', letter:'P' },
    { id:'orange', name:'Оранжевая',  desc:'Тепло',     gradient:'linear-gradient(135deg,#f59e0b,#d97706)', letter:'O' },
    { id:'rose',   name:'Розовая',    desc:'Яркая',     gradient:'linear-gradient(135deg,#f43f5e,#e11d48)', letter:'R' },
    { id:'slate',  name:'Серая',      desc:'Строгая',   gradient:'linear-gradient(135deg,#475569,#1e293b)', letter:'N' }
];

const ICONS = {
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    plusBox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
    minusBox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
    section: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="8" rx="2"/><path d="M8 12h8"/></svg>',
    divider: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="9" width="18" height="6" rx="1.5"/></svg>',
    convert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l4 4-4 4"/><path d="M21 7H9a4 4 0 0 0-4 4v1"/><path d="M7 21l-4-4 4-4"/><path d="M3 17h12a4 4 0 0 0 4-4v-1"/></svg>',
    paste: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="12" height="4" rx="1"/><path d="M16 5h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v5h-5"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16" y2="16"/></svg>',
    replace: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v6"/><path d="M12 14v6"/><path d="M8 12h8"/></svg>',
    templates: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
    ruble: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4v16"/><path d="M8 4h5a4 4 0 0 1 0 8H8"/><path d="M6 16h10"/><path d="M6 20h10"/></svg>',
    dollar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 6a4 4 0 0 0-4-2h-2a4 4 0 0 0 0 8h2a4 4 0 0 1 0 8h-2a4 4 0 0 1-4-2"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/></svg>',
    csv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="M8 11l4 4 4-4"/><path d="M4 21h16"/></svg>',
    print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="3" width="12" height="6"/><rect x="4" y="9" width="16" height="8" rx="2"/><rect x="8" y="15" width="8" height="6"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>',
    undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6.7 3L3 13"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.9" y1="4.9" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.1" y2="19.1"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="6.3" y1="17.7" x2="4.9" y2="19.1"/><line x1="19.1" y1="4.9" x2="17.7" y2="6.3"/></svg>',
    palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2a10 10 0 1 0 0 20c1 0 2-.8 2-2 0-.5-.2-1-.5-1.4-.3-.4-.5-.9-.5-1.4a2 2 0 0 1 2-2h2.5A4.5 4.5 0 0 0 22 11c0-5-4.5-9-10-9z"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
};

// ========== STATE ==========
let idC = 0;
let actId = null;
let hist = [];
let theme = 'light';
let colorTheme = 'blue';
let recordingKey = null;
let recordingHk = null;
let activeWorkspace = 1;
let usdRate = 0;
let eurRate = 0;
let btcRate = 0;
let goldRate = 0;
let oilRate = 0;
let sortState = {};
let colWidths = {};
let selectedRows = {};
let lastSearch = { query: '', matches: [], idx: 0 };
let lastSelectedRow = null;
let cellSel = { tid: null, r1: -1, c1: -1, r2: -1, c2: -1, anchorR: -1, anchorC: -1, dragging: false };
let activeTbCell = null;
let paintBuffer = null;
let hiddenCols = {};

let tableSettings = {
    rowHeight: 38, fontSize: 13,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    padding: 10, wrapText: false,
    showRowNums: true, showTotals: true,
    zebra: true, vGrid: true, hGrid: true, rounded: true
};
let notifySettings = { enabled: true, position: 'toast-bottom-right', duration: 3000 };
let exportTheme = 'blue';
let templates = [];

const workspaces = {};
for (let i = 1; i <= 5; i++) workspaces[i] = [];

let hotkeys = { ...DEFAULT_HOTKEYS };

// ========== UTILS ==========
function Q(s) { return document.querySelector(s); }

function escapeHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function toast(msg, type = 'success', duration) {
    if (!notifySettings.enabled) return;
    const container = Q('#toastContainer');
    if (!container) return;
    const dur = duration || notifySettings.duration;
    const icons = { success:'✓', error:'✕', info:'ℹ', warning:'⚠' };
    const el = document.createElement('div');
    el.className = `toast-item ${type}`;
    el.style.setProperty('--toast-duration', dur + 'ms');
    el.innerHTML = `<div class="toast-icon">${icons[type] || '✓'}</div><div class="toast-message">${escapeHtml(msg)}</div><div class="toast-progress"></div>`;
    container.appendChild(el);
    setTimeout(() => { el.classList.add('removing'); setTimeout(() => el.remove(), 250); }, dur);
}

function updateToastPosition() {
    const c = Q('#toastContainer');
    if (c) c.className = 'toast-container ' + notifySettings.position;
}

function setStatus(text, type = 'ok') {
    const el = Q('#statusLeft');
    if (!el) return;
    const dot = type === 'busy' ? 'var(--warning)' : type === 'error' ? 'var(--danger)' : 'var(--success)';
    el.innerHTML = `<span class="status-dot" style="background:${dot}"></span><span class="status-text">${escapeHtml(text)}</span>`;
}

function cln(s) {
    if (!s) return '';
    let x = String(s).trim().replace(/\s/g, '').replace(/,/g, '.').replace(/[^\d.\-]/g, '');
    const p = x.split('.');
    if (p.length > 2) x = p[0] + '.' + p.slice(1).join('');
    if (x.includes('-') && x.indexOf('-') > 0) x = x.replace(/-/g, '');
    return x;
}

function pn(v) {
    const c = cln(v);
    return (c === '' || c === '-' || c === '.') ? NaN : parseFloat(c);
}

function isNumericCol(name) {
    const n = String(name || '').toLowerCase();
    return n.includes('ко-во') || n.includes('количество') || n.startsWith('цена') || n.startsWith('стоимость');
}

function ci(cols, kw) {
    return cols.findIndex(c => c.toLowerCase().includes(kw.toLowerCase()));
}

function getQi(cols) {
    return ci(cols, 'Ко-во') >= 0 ? ci(cols, 'Ко-во') : ci(cols, 'Количество');
}

function cA(r, c) {
    let s = '';
    while (c > 0) { c--; s = String.fromCharCode(65 + (c % 26)) + s; c = Math.floor(c / 26); }
    return s + r;
}

function hkDisplay(key) {
    if (!key) return '—';
    if (key === 'DELETE') return 'Del';
    return key;
}

function isEmptyRow(row) {
    return !row || row.every(c => String(c ?? '').trim() === '');
}

function formatHeader(h, currency) {
    const t = String(h).trim();
    if (/^цена[,.]?\s*(с\s+ндс)?\s*$/i.test(t)) return `Цена, ${currency} с НДС`;
    if (/^стоимость[,.]?\s*(с\s+ндс)?\s*$/i.test(t)) return `Стоимость, ${currency} с НДС`;
    return h;
}

// ========== CURRENCY HELPERS ==========
// Определение валюты колонки: сначала из meta, потом из заголовка
function getColCurrency(td, ci) {
    if (!td) return null;
    if (td.colCurrencies && td.colCurrencies[ci]) return td.colCurrencies[ci];
    const h = String(td.cols[ci] || '').toUpperCase();
    if (h.includes('USD') || h.includes('$')) return 'USD';
    if (h.includes('EUR') || h.includes('€')) return 'EUR';
    if (h.includes('RUB') || h.includes('₽') || h.includes('РУБ')) return 'RUB';
    if (h.includes('XAU') || h.includes('ЗОЛОТ') || h.includes('GOLD')) return 'XAU';
    if (h.includes('BTC') || h.includes('БИТКОИН')) return 'BTC';
    if (h.includes('OIL') || h.includes('НЕФТЬ') || h.includes('WTI')) return 'OIL';
    return null;
}

function setColCurrency(td, ci, cur) {
    if (!td.colCurrencies) td.colCurrencies = {};
    if (cur) td.colCurrencies[ci] = cur;
    else delete td.colCurrencies[ci];
    saveNow();
    render(td);
}

// Мультивалютный итог: возвращает { USD: 1234.56, RUB: 50000, ... }
function getTotalsByCurrency(td) {
    const ti = ci(td.cols, 'Стоимость');
    if (ti < 0) return {};
    const cur = getColCurrency(td, ti) || td.currency;
    const totals = {};
    let sum = 0;
    td.rows.forEach(r => {
        const v = pn(r[ti]);
        if (!isNaN(v)) sum += v;
    });
    if (sum !== 0 || td.rows.length) totals[cur] = sum;
    return totals;
}

function formatCurrencyTotals(totals) {
    const parts = [];
    for (const [cur, val] of Object.entries(totals)) {
        parts.push(`${val.toFixed(2)} ${cur}`);
    }
    return parts.join(' + ') || '0.00';
}

function calc(row, cols, td) {
    const qi = getQi(cols), pi = ci(cols, 'Цена'), ti = ci(cols, 'Стоимость');
    if (qi >= 0 && pi >= 0 && ti >= 0) {
        row[ti] = ((pn(row[qi]) || 0) * (pn(row[pi]) || 0)).toFixed(2);
    }
}

function sumT(td) {
    const ti = ci(td.cols, 'Стоимость');
    if (ti < 0) return 0;
    return td.rows.reduce((s, r) => s + (pn(r[ti]) || 0), 0);
}

// ========== FORMULAS ==========
function isFormula(v) {
    return typeof v === 'string' && v.startsWith('=');
}

function colLetterToIdx(letters) {
    let n = 0;
    for (let i = 0; i < letters.length; i++) {
        n = n * 26 + (letters.charCodeAt(i) - 64);
    }
    return n - 1;
}

function parseRef(ref) {
    const m = String(ref).match(/^([A-Z]+)(\d+)$/i);
    if (!m) return null;
    return { r: parseInt(m[2]) - 1, c: colLetterToIdx(m[1].toUpperCase()) };
}

function evalFormula(td, formula) {
    if (!isFormula(formula)) return null;
    const expr = formula.substring(1).trim();

    // SUM(A1:A10)
    let m = expr.match(/^SUM\(\s*([A-Z]+\d+)\s*:\s*([A-Z]+\d+)\s*\)$/i);
    if (m) {
        const a = parseRef(m[1]), b = parseRef(m[2]);
        if (!a || !b) return null;
        let sum = 0;
        for (let r = Math.min(a.r, b.r); r <= Math.max(a.r, b.r); r++) {
            for (let c = Math.min(a.c, b.c); c <= Math.max(a.c, b.c); c++) {
                const v = pn(td.rows[r]?.[c]);
                if (!isNaN(v)) sum += v;
            }
        }
        return sum.toFixed(2);
    }

    // AVG(A1:A10)
    m = expr.match(/^AVG\(\s*([A-Z]+\d+)\s*:\s*([A-Z]+\d+)\s*\)$/i);
    if (m) {
        const a = parseRef(m[1]), b = parseRef(m[2]);
        if (!a || !b) return null;
        let sum = 0, count = 0;
        for (let r = Math.min(a.r, b.r); r <= Math.max(a.r, b.r); r++) {
            for (let c = Math.min(a.c, b.c); c <= Math.max(a.c, b.c); c++) {
                const v = pn(td.rows[r]?.[c]);
                if (!isNaN(v)) { sum += v; count++; }
            }
        }
        return count ? (sum / count).toFixed(2) : '0.00';
    }

    // MIN(A1:A10)
    m = expr.match(/^MIN\(\s*([A-Z]+\d+)\s*:\s*([A-Z]+\d+)\s*\)$/i);
    if (m) {
        const a = parseRef(m[1]), b = parseRef(m[2]);
        if (!a || !b) return null;
        let min = Infinity;
        for (let r = Math.min(a.r, b.r); r <= Math.max(a.r, b.r); r++) {
            for (let c = Math.min(a.c, b.c); c <= Math.max(a.c, b.c); c++) {
                const v = pn(td.rows[r]?.[c]);
                if (!isNaN(v) && v < min) min = v;
            }
        }
        return isFinite(min) ? min.toFixed(2) : '0.00';
    }

    // MAX(A1:A10)
    m = expr.match(/^MAX\(\s*([A-Z]+\d+)\s*:\s*([A-Z]+\d+)\s*\)$/i);
    if (m) {
        const a = parseRef(m[1]), b = parseRef(m[2]);
        if (!a || !b) return null;
        let max = -Infinity;
        for (let r = Math.min(a.r, b.r); r <= Math.max(a.r, b.r); r++) {
            for (let c = Math.min(a.c, b.c); c <= Math.max(a.c, b.c); c++) {
                const v = pn(td.rows[r]?.[c]);
                if (!isNaN(v) && v > max) max = v;
            }
        }
        return isFinite(max) ? max.toFixed(2) : '0.00';
    }

    // Простая арифметика с ссылками: =A1+B1*2, =(A1+B1)/2
    // Заменяем ссылки на значения
    const replaced = expr.replace(/[A-Z]+\d+/gi, (match) => {
        const ref = parseRef(match);
        if (!ref) return '0';
        const v = pn(td.rows[ref.r]?.[ref.c]);
        return isNaN(v) ? '0' : v;
    });

    // Проверяем что остались только цифры и операторы
    if (!/^[\d+\-*/().\s,]+$/.test(replaced)) return null;

    try {
        // eslint-disable-next-line no-new-func
        const result = Function('"use strict"; return (' + replaced + ')')();
        if (typeof result === 'number' && isFinite(result)) return result.toFixed(2);
    } catch (e) {}
    return null;
}

// Пересчёт всех формул в таблице
function recalcFormulas(td) {
    if (!td.formulas) return;
    for (const [key, formula] of Object.entries(td.formulas)) {
        const [ri, ci2] = key.split(':').map(Number);
        const result = evalFormula(td, formula);
        if (result !== null) td.rows[ri][ci2] = result;
    }
}

// ========== CURRENCY RATES ==========
async function loadRates() {
    const bar = Q('#ratesBar');
    const renderRates = () => {
        if (!bar) return;
        const parts = [];
        if (usdRate > 0) parts.push(`<span class="rate"><span>💵</span> USD: <span class="rate-value">${usdRate.toFixed(2)} ₽</span></span>`);
        if (eurRate > 0) parts.push(`<span class="rate"><span>💶</span> EUR: <span class="rate-value">${eurRate.toFixed(2)} ₽</span></span>`);
        if (btcRate > 0) parts.push(`<span class="rate"><span>₿</span> BTC: <span class="rate-value">${Math.round(btcRate).toLocaleString('ru-RU')} $</span></span>`);
        if (goldRate > 0) parts.push(`<span class="rate"><span>🥇</span> XAU: <span class="rate-value">${goldRate.toFixed(0)} $/oz</span></span>`);
        bar.innerHTML = parts.join('') || 'Курсы недоступны';
    };

    // Загружаем параллельно
    const promises = [];

    // ЦБ РФ
    promises.push((async () => {
        try {
            const r = await fetch('https://www.cbr-xml-daily.ru/daily_json.js', { cache: 'no-cache' });
            if (!r.ok) throw new Error('HTTP');
            const d = await r.json();
            usdRate = d.Valute.USD.Value;
            eurRate = d.Valute.EUR.Value;
        } catch (e) {
            try {
                const r2 = await fetch('https://api.exchangerate-api.com/v4/latest/USD', { cache: 'no-cache' });
                const d2 = await r2.json();
                usdRate = d2.rates.RUB;
                eurRate = usdRate / d2.rates.EUR;
            } catch (e2) {}
        }
    })());

    // BTC (Coinbase)
    promises.push((async () => {
        try {
            const r = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot', { cache: 'no-cache' });
            const d = await r.json();
            btcRate = parseFloat(d.data.amount);
        } catch (e) { btcRate = 0; }
    })());

    // Золото (goldprice.org)
    promises.push((async () => {
        try {
            const r = await fetch('https://data-asg.goldprice.org/dbXRates/USD', { cache: 'no-cache' });
            const d = await r.json();
            goldRate = d.items[0].xauPrice;
        } catch (e) { goldRate = 0; }
    })());

    await Promise.all(promises);
    renderRates();
}

function convertCurrency(td) {
    if (usdRate <= 0) { toast('Курс USD не загружен', 'error'); return; }
    const oldCur = td.currency, newCur = oldCur === 'USD' ? 'RUB' : 'USD';
    const pi = ci(td.cols, 'Цена');
    if (pi >= 0) {
        td.rows.forEach(row => {
            const price = parseFloat(row[pi]);
            if (!isNaN(price)) {
                if (oldCur === 'USD') row[pi] = (price * usdRate).toFixed(2);
                else row[pi] = (price / usdRate).toFixed(2);
            }
        });
    }
    td.currency = newCur;
    // Обновляем meta колонок Цена/Стоимость
    if (!td.colCurrencies) td.colCurrencies = {};
    const ti = ci(td.cols, 'Стоимость');
    if (pi >= 0) td.colCurrencies[pi] = newCur;
    if (ti >= 0) td.colCurrencies[ti] = newCur;
    recalcAll(td);
    if (td.card) {
        const oldHdr = td.card.querySelector('.card-hdr');
        if (oldHdr) oldHdr.replaceWith(buildCardHeader(td));
    }
    render(td);
    saveNow();
    toast(`${oldCur} → ${newCur} (курс ${usdRate.toFixed(2)} ₽)`, 'success');
}

function recalcAll(td) {
    td.rows.forEach(r => calc(r, td.cols, td));
    recalcFormulas(td);
}

// ========== CELL STYLES ==========
function getCellStyle(td, ri, ci) {
    if (!td.styles) td.styles = {};
    return td.styles[ri + ':' + ci] || {};
}

function setCellStyle(td, ri, ci, patch) {
    if (!td.styles) td.styles = {};
    const key = ri + ':' + ci;
    td.styles[key] = { ...(td.styles[key] || {}), ...patch };
    const s = td.styles[key];
    Object.keys(s).forEach(k => {
        if (s[k] === null || s[k] === undefined || s[k] === false || s[k] === '') delete s[k];
    });
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
