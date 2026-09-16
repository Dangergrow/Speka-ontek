// ==================== ONTEK v5.0.0 ====================
const DEFAULT_COLS = ['Артикул','Наименование','Ко-во, шт','Цена','Стоимость'];

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
let sortState = {};
let colWidths = {};
let selectedRows = {};
let lastSearch = { query: '', matches: [], idx: 0 };
let lastSelectedRow = null;

// Глобальные настройки таблицы
let tableSettings = {
    rowHeight: 38,
    fontSize: 13,
    wrapText: false,
    showRowNums: true,
    showTotals: true,
    compact: false
};

const workspaces = {};
for (let i = 1; i <= 5; i++) workspaces[i] = [];

const Q = s => document.querySelector(s);
const QA = s => document.querySelectorAll(s);

// ==================== SVG ICONS ====================
const ICONS = {
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
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

const RU_KEYS = { 'Ф':'A','А':'A','В':'D','Д':'D','С':'C','Ц':'C','Ч':'X','Х':'X','К':'R','Р':'R','М':'V','Ж':'V','Щ':'O','О':'O','Г':'U','У':'U','Ы':'S','Я':'Z','Ь':'DELETE','Т':'DELETE','1':'1','2':'2','3':'3','4':'4','5':'5' };

const DEFAULT_HOTKEYS = { addRow:'A', delRow:'D', addCol:'C', delCol:'X', recalc:'R', paste:'V', load:'O', newRUB:'1', newUSD:'2', dup:'U', clear:'DELETE', undo:'Z', save:'S', convert:'K' };

const KEY_LABELS = {
    addRow:'Добавить строку', delRow:'Удалить строку',
    addCol:'Добавить колонку', delCol:'Удалить колонку',
    recalc:'Пересчитать', paste:'Вставить',
    load:'Загрузить', newRUB:'Новая RUB', newUSD:'Новая USD',
    dup:'Дублировать', clear:'Очистить', undo:'Отменить',
    save:'Сохранить', convert:'Конвертировать валюту'
};

const COLOR_THEMES = [
    { id:'blue',   name:'Синяя',      desc:'Классика',  gradient:'linear-gradient(135deg,#6366f1,#4f46e5)', letter:'S' },
    { id:'green',  name:'Зелёная',    desc:'Природа',   gradient:'linear-gradient(135deg,#10b981,#059669)', letter:'G' },
    { id:'purple', name:'Фиолетовая', desc:'Креатив',   gradient:'linear-gradient(135deg,#8b5cf6,#7c3aed)', letter:'P' },
    { id:'orange', name:'Оранжевая',  desc:'Тепло',     gradient:'linear-gradient(135deg,#f59e0b,#d97706)', letter:'O' },
    { id:'rose',   name:'Розовая',    desc:'Яркая',     gradient:'linear-gradient(135deg,#f43f5e,#e11d48)', letter:'R' }
];

let hotkeys = { ...DEFAULT_HOTKEYS };

// ==================== UTILS ====================
function toast(msg, type = 'success', duration = 2800) {
    const container = Q('#toastContainer');
    if (!container) return;
    const icons = { success:'✓', error:'✕', info:'ℹ', warning:'⚠' };
    const el = document.createElement('div');
    el.className = `toast-item ${type}`;
    el.innerHTML = `
        <div class="toast-icon">${icons[type] || '✓'}</div>
        <div class="toast-message">${escapeHtml(msg)}</div>
        <div class="toast-progress"></div>
    `;
    container.appendChild(el);
    setTimeout(() => {
        el.classList.add('removing');
        setTimeout(() => el.remove(), 250);
    }, duration);
}

function escapeHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function setStatus(text, type = 'ok') {
    const el = Q('#statusLeft');
    if (!el) return;
    const dot = type === 'busy' ? 'var(--warning)' : type === 'error' ? 'var(--danger)' : 'var(--success)';
    el.innerHTML = `<span class="status-dot" style="background:${dot}"></span><span class="status-text">${escapeHtml(text)}</span>`;
}

function updateStatusBar() {
    const td = active();
    const center = Q('#statusCenter');
    if (!center) return;
    if (!td) { center.innerHTML = ''; return; }
    const rows = td.rows.length;
    const total = sumT(td).toFixed(2);
    const curr = td.currency;
    center.innerHTML = `
        <span class="status-stat">Строк: <b>${rows}</b></span>
        <span class="status-stat">Итого: <b>${total} ${curr}</b></span>
    `;
}

function active() {
    const ws = workspaces[activeWorkspace];
    if (actId === null && ws.length) actId = ws[0].id;
    return ws.find(t => t.id === actId) || null;
}

function setAct(id) {
    actId = id;
    document.querySelectorAll('.card').forEach(c => c.classList.toggle('active', +c.dataset.tid === actId));
    updateStatusBar();
}

function getArea() { return Q('#workspaceArea_' + activeWorkspace); }

function upEmpty() {
    const a = getArea();
    if (!a) return;
    const e = a.querySelector('.empty-state');
    if (!workspaces[activeWorkspace].length && !e) {
        a.innerHTML = `<div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <div class="empty-state-title">Нет таблиц</div>
            <div class="empty-state-desc">
                Создайте новую — нажмите <span class="empty-state-kbd">Shift</span>+<span class="empty-state-kbd">1</span> для RUB
                или <span class="empty-state-kbd">Shift</span>+<span class="empty-state-kbd">2</span> для USD
            </div>
        </div>`;
    } else if (workspaces[activeWorkspace].length && e) {
        e.remove();
    }
}

function ci(cols, kw) { return cols.findIndex(c => c.toLowerCase().includes(kw.toLowerCase())); }

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

function getQi(cols) {
    return ci(cols, 'Ко-во') >= 0 ? ci(cols, 'Ко-во') : ci(cols, 'Количество');
}

function calc(row, cols) {
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

function formatHeader(h, currency) {
    const t = String(h).trim();
    if (/^цена[,.]?\s*(с\s+ндс)?\s*$/i.test(t)) return `Цена, ${currency} с НДС`;
    if (/^стоимость[,.]?\s*(с\s+ндс)?\s*$/i.test(t)) return `Стоимость, ${currency} с НДС`;
    return h;
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

// ==================== TABLE SETTINGS ====================
function applyTableSettings() {
    const root = document.documentElement;
    root.style.setProperty('--font-size-table', tableSettings.fontSize + 'px');
    root.style.setProperty('--row-height', tableSettings.rowHeight + 'px');
    root.style.setProperty('--wrap-text', tableSettings.wrapText ? 'pre-wrap' : 'nowrap');
    document.body.classList.toggle('compact-mode', tableSettings.compact);

    // Рендерим все таблицы заново с новыми настройками
    Object.keys(workspaces).forEach(ws => {
        workspaces[ws].forEach(td => render(td));
    });

    // Сохраняем
    saveNow();
}

// ==================== SETTINGS ====================
function saveNow() {
    const s = {
        theme,
        color: colorTheme,
        hotkeys,
        activeWorkspace,
        tableSettings
    };
    const json = JSON.stringify(s);
    localStorage.setItem('ontek_settings', json);
    if (window.pywebview && window.pywebview.api) {
        window.pywebview.api.save_settings(json).catch(() => {});
    }
}

async function loadSettings() {
    for (let i = 0; i < 30; i++) {
        if (window.pywebview && window.pywebview.api) break;
        await new Promise(r => setTimeout(r, 100));
    }
    if (window.pywebview && window.pywebview.api) {
        try {
            const json = await window.pywebview.api.load_settings();
            if (json && json !== '{}') {
                const s = JSON.parse(json);
                if (s.theme) theme = s.theme;
                if (s.color) colorTheme = s.color;
                if (s.hotkeys) hotkeys = s.hotkeys;
                if (s.activeWorkspace) activeWorkspace = s.activeWorkspace;
                if (s.tableSettings) tableSettings = { ...tableSettings, ...s.tableSettings };
                return;
            }
        } catch (e) {}
    }
    try {
        const s = JSON.parse(localStorage.getItem('ontek_settings'));
        if (s) {
            if (s.theme) theme = s.theme;
            if (s.color) colorTheme = s.color;
            if (s.hotkeys) hotkeys = s.hotkeys;
            if (s.activeWorkspace) activeWorkspace = s.activeWorkspace;
            if (s.tableSettings) tableSettings = { ...tableSettings, ...s.tableSettings };
        }
    } catch (e) {}
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
    const ti = Q('#themeIcon');
    if (ti) ti.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
    document.querySelectorAll('.workspace-tab').forEach(t => t.classList.toggle('active', +t.dataset.ws === activeWorkspace));
    document.querySelectorAll('.workspace-panel').forEach(p => p.classList.toggle('active', +p.dataset.ws === activeWorkspace));
    document.querySelectorAll('.theme-card').forEach(c => c.classList.toggle('active', c.dataset.theme === colorTheme));
    updateAllHKDisplays();

    // Синхронизация настроек
    const rh = Q('#setRowHeight'), rhv = Q('#valRowHeight');
    if (rh) rh.value = tableSettings.rowHeight;
    if (rhv) rhv.textContent = tableSettings.rowHeight + ' px';
    const fs = Q('#setFontSize'), fsv = Q('#valFontSize');
    if (fs) fs.value = tableSettings.fontSize;
    if (fsv) fsv.textContent = tableSettings.fontSize + ' px';
    const wt = Q('#setWrapText'); if (wt) wt.checked = tableSettings.wrapText;
    const sn = Q('#setShowRowNums'); if (sn) sn.checked = tableSettings.showRowNums;
    const st = Q('#setShowTotals'); if (st) st.checked = tableSettings.showTotals;
    const cm = Q('#setCompact'); if (cm) cm.checked = tableSettings.compact;

    applyTableSettings();
}

function switchWorkspace(ws) {
    activeWorkspace = ws;
    actId = null;
    applyAllSettings();
    saveNow();
    updateStatusBar();
}

function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    applyAllSettings();
    saveNow();
}

function setColorTheme(t) {
    colorTheme = t;
    applyAllSettings();
    saveNow();
}

// ==================== CURRENCY ====================
function convertCurrency(td) {
    if (usdRate <= 0) { toast('Курс USD не загружен', 'error'); return; }
    const oldCur = td.currency;
    const newCur = oldCur === 'USD' ? 'RUB' : 'USD';
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
    td.rows.forEach(r => calc(r, td.cols));
    render(td);
    saveNow();
    toast(`${oldCur} → ${newCur} (курс ${usdRate.toFixed(2)} ₽)`, 'success');
}

async function loadRates() {
    const bar = Q('#ratesBar');
    const renderRates = (usd, eur, usdPrev, eurPrev) => {
        if (!bar) return;
        const usdCls = usdPrev ? (usd > usdPrev ? 'up' : 'down') : '';
        const eurCls = eurPrev ? (eur > eurPrev ? 'up' : 'down') : '';
        bar.innerHTML = `
            <span class="rate"><span>💵</span> USD: <span class="rate-value ${usdCls}">${usd.toFixed(2)} ₽</span></span>
            <span class="rate"><span>💶</span> EUR: <span class="rate-value ${eurCls}">${eur.toFixed(2)} ₽</span></span>
        `;
    };
    try {
        const r = await fetch('https://www.cbr-xml-daily.ru/daily_json.js', { cache: 'no-cache' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const d = await r.json();
        usdRate = d.Valute.USD.Value;
        eurRate = d.Valute.EUR.Value;
        renderRates(usdRate, eurRate, d.Valute.USD.Previous, d.Valute.EUR.Previous);
        return;
    } catch (e1) {}
    try {
        const r2 = await fetch('https://api.exchangerate-api.com/v4/latest/USD', { cache: 'no-cache' });
        if (!r2.ok) throw new Error('HTTP');
        const d2 = await r2.json();
        usdRate = d2.rates.RUB;
        eurRate = usdRate / d2.rates.EUR;
        renderRates(usdRate, eurRate, 0, 0);
    } catch (e2) {
        if (bar) bar.textContent = 'Курсы недоступны';
    }
}

// ==================== SIDEBAR ====================
function buildSidebarV2() {
    const sb = Q('#sidebarContent');
    if (!sb) return;
    const sections = [
        { t: 'Таблица', buttons: [
            { id: 'btnAddRow',  icon: ICONS.plus,     label: 'Добавить строку',  hk: 'addRow' },
            { id: 'btnDelRow',  icon: ICONS.minus,    label: 'Удалить строку',   hk: 'delRow' },
            { id: 'btnAddCol',  icon: ICONS.plusBox,  label: 'Добавить колонку', hk: 'addCol' },
            { id: 'btnDelCol',  icon: ICONS.minusBox, label: 'Удалить колонку',  hk: 'delCol' }
        ]},
        { t: 'Действия', buttons: [
            { id: 'btnConvert', icon: ICONS.convert, label: 'Конвертировать', hk: 'convert' },
            { id: 'btnPaste',   icon: ICONS.paste,   label: 'Вставить',       hk: 'paste' },
            { id: 'btnDup',     icon: ICONS.copy,    label: 'Дублировать',    hk: 'dup' },
            { id: 'btnRecalc',  icon: ICONS.refresh, label: 'Пересчёт',       hk: 'recalc' },
            { id: 'btnFind',    icon: ICONS.search,  label: 'Найти',          hk: null }
        ]},
        { t: 'Создать', buttons: [
            { id: 'btnNewRUB', icon: ICONS.ruble,  label: 'Новая RUB', hk: 'newRUB' },
            { id: 'btnNewUSD', icon: ICONS.dollar, label: 'Новая USD', hk: 'newUSD' }
        ]},
        { t: 'Файл', buttons: [
            { id: 'btnLoad',  icon: ICONS.folder, label: 'Открыть',   hk: 'load' },
            { id: 'btnSave',  icon: ICONS.save,   label: 'Сохранить', hk: 'save' },
            { id: 'btnClear', icon: ICONS.trash,  label: 'Очистить',  hk: 'clear' },
            { id: 'btnUndo',  icon: ICONS.undo,   label: 'Отменить',  hk: 'undo' }
        ]}
    ];
    sb.innerHTML = sections.map(sec => `
        <div class="sidebar-section">
            <div class="sidebar-section-title">${sec.t}</div>
            ${sec.buttons.map(b => `
                <button class="sidebar-btn" id="${b.id}" title="${escapeHtml(b.label)}">
                    <span class="s-icon">${b.icon}</span>
                    <span class="s-label">${escapeHtml(b.label)}</span>
                    ${b.hk ? `<span class="s-hotkey" data-hk="${b.hk}">Shift+${hkDisplay(hotkeys[b.hk])}</span>` : ''}
                </button>
            `).join('')}
        </div>
    `).join('');

    // Иконки в топбаре
    const tc = Q('#btnColorTheme');
    if (tc) tc.innerHTML = ICONS.palette;
    const ts = Q('#btnSettings');
    if (ts) ts.innerHTML = ICONS.settings;
    const ti = Q('#themeIcon');
    if (ti) ti.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
}

// ==================== WORKSPACES ====================
function buildWorkspaces() {
    const tabs = Q('#workspaceTabs');
    const container = Q('#workspaceContainer');
    tabs.innerHTML = '';
    container.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        tabs.innerHTML += `<button class="workspace-tab ${i === activeWorkspace ? 'active' : ''}" data-ws="${i}">Окно ${i}</button>`;
        container.innerHTML += `
            <div class="workspace-panel ${i === activeWorkspace ? 'active' : ''}" data-ws="${i}">
                <div class="tables-area" id="workspaceArea_${i}"></div>
            </div>
        `;
    }
    tabs.querySelectorAll('.workspace-tab').forEach(t => {
        t.onclick = () => switchWorkspace(+t.dataset.ws);
    });
    upEmpty();
}

// ==================== CARDS ====================
function addTable(cur = 'RUB') {
    const ws = workspaces[activeWorkspace];
    upEmpty();
    idC++;
    const td = {
        id: idC,
        cols: [...DEFAULT_COLS],
        rows: [['', '', '', '', '']],
        currency: cur,
        el: null,
        card: null,
        merges: []   // [{ col, rowStart, rowEnd }]
    };
    ws.push(td);
    const area = getArea();
    const emptyEl = area.querySelector('.empty-state');
    if (emptyEl) emptyEl.remove();
    const card = buildCardDOM(td);
    area.appendChild(card);
    td.card = card;
    setAct(td.id);
    render(td);
    toast(`Таблица ${cur} создана`, 'success');
}

function dupTable(src) {
    if (!src) src = active();
    if (!src) { toast('Выберите таблицу', 'warning'); return; }
    const ws = workspaces[activeWorkspace];
    idC++;
    const td = {
        id: idC,
        cols: [...src.cols],
        rows: src.rows.map(r => [...r]),
        currency: src.currency,
        el: null,
        card: null,
        merges: src.merges ? src.merges.map(m => ({ ...m })) : []
    };
    ws.push(td);
    const area = getArea();
    const card = buildCardDOM(td);
    area.appendChild(card);
    td.card = card;
    setAct(td.id);
    render(td);
    toast('Таблица дублирована', 'success');
}

function buildCardDOM(td) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.tid = td.id;

    card.addEventListener('click', e => {
        if (!e.target.closest('button') && !e.target.closest('input') && !e.target.closest('.resize-handle')) {
            setAct(td.id);
        }
    });

    card.addEventListener('contextmenu', e => {
        e.preventDefault();
        e.stopPropagation();
        const thEl = e.target.closest('thead th:not(.row-num):not(.actions-col)');
        const trEl = e.target.closest('tbody tr');
        let ri = null, ci = null;
        if (thEl) {
            const ths = [...card.querySelectorAll('thead th:not(.row-num):not(.actions-col)')];
            ci = ths.indexOf(thEl);
            if (ci >= td.cols.length) ci = null;
        }
        if (trEl && !trEl.classList.contains('row-total')) {
            ri = +trEl.dataset.ri;
            const tdEl = e.target.closest('td:not(.row-num):not(.actions-col)');
            if (tdEl) {
                const tds = [...trEl.querySelectorAll('td:not(.row-num):not(.actions-col)')];
                ci = tds.indexOf(tdEl);
                if (ci >= td.cols.length) ci = null;
            }
        }
        window._ctxD = { tid: td.id, ri, ci };
        setAct(td.id);
        showCtx(e.clientX, e.clientY);
    });

    const hdr = document.createElement('div');
    hdr.className = 'card-hdr';
    hdr.innerHTML = `
        <div class="card-hdr-left">
            <div class="card-title">
                <span>📋</span>
                <span>Таблица ${td.currency}</span>
                <span class="card-badge ${td.currency === 'USD' ? 'usd' : 'rub'}">${td.currency}</span>
                <span class="card-badge active-badge">●</span>
            </div>
            <div class="card-stats">
                <span class="card-stat">Строк: <b class="stat-rows">${td.rows.length}</b></span>
                <span class="card-stat">Итого: <b class="stat-total">${sumT(td).toFixed(2)}</b></span>
            </div>
        </div>
        <div class="card-hdr-right">
            <button class="card-btn cur-btn" title="Конвертировать валюту">${td.currency === 'USD' ? '💵 USD' : '💰 RUB'}</button>
            <button class="card-btn icon-only dup-btn" title="Дублировать">⎘</button>
            <button class="card-btn icon-only danger del-btn" title="Удалить">🗑</button>
        </div>
    `;

    hdr.querySelector('.cur-btn').onclick = e => { e.stopPropagation(); convertCurrency(td); };
    hdr.querySelector('.dup-btn').onclick = e => { e.stopPropagation(); dupTable(td); };
    hdr.querySelector('.del-btn').onclick = e => {
        e.stopPropagation();
        const ws = workspaces[activeWorkspace];
        if (ws.length <= 1) { toast('Нужна хотя бы одна таблица', 'warning'); return; }
        openConfirm('Удалить таблицу?', 'Таблица будет удалена без возможности восстановления.', () => {
            card.remove();
            ws.splice(ws.indexOf(td), 1);
            if (actId === td.id) actId = ws.length ? ws[0].id : null;
            upEmpty();
            updateStatusBar();
            toast('Таблица удалена', 'info');
        });
    };

    const wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    const tbl = document.createElement('table');
    tbl.className = 'data-table';
    tbl.innerHTML = '<thead></thead><tbody></tbody>';
    wrap.appendChild(tbl);
    card.appendChild(hdr);
    card.appendChild(wrap);
    td.el = tbl;

    return card;
}

function updateCardStats(td) {
    if (!td.card) return;
    const sr = td.card.querySelector('.stat-rows');
    const st = td.card.querySelector('.stat-total');
    if (sr) sr.textContent = td.rows.length;
    if (st) st.textContent = sumT(td).toFixed(2);
    updateStatusBar();
}

// ==================== MERGE LOGIC ====================
function getMergeAt(td, ri, ci) {
    if (!td.merges) return null;
    return td.merges.find(m => m.col === ci && ri >= m.rowStart && ri <= m.rowEnd);
}

function getMergeStart(td, ri, ci) {
    const m = getMergeAt(td, ri, ci);
    if (m && m.rowStart === ri) return m;
    return null;
}

function isMergeHidden(td, ri, ci) {
    const m = getMergeAt(td, ri, ci);
    return m && m.rowStart !== ri;
}

function mergeCellsForRange(td, ci, rowStart, rowEnd) {
    if (rowEnd <= rowStart) { toast('Нужно выделить минимум 2 строки', 'warning'); return; }
    // Удаляем существующие merges в этом диапазоне по этой колонке
    td.merges = (td.merges || []).filter(m => {
        if (m.col !== ci) return true;
        // Если merge пересекается с нашим диапазоном - удаляем
        if (m.rowEnd < rowStart || m.rowStart > rowEnd) return true;
        return false;
    });
    // Создаём новый merge
    td.merges.push({ col: ci, rowStart, rowEnd });
    // Копируем значение из первой ячейки, очищаем остальные
    const val = td.rows[rowStart][ci];
    for (let r = rowStart + 1; r <= rowEnd; r++) {
        td.rows[r][ci] = '';
    }
    td.rows[rowStart][ci] = val;
    render(td);
    toast(`Объединено ${rowEnd - rowStart + 1} ячеек`, 'success');
}

function unmergeCellsAt(td, ri, ci) {
    const m = getMergeAt(td, ri, ci);
    if (!m) { toast('Эта ячейка не объединена', 'warning'); return; }
    td.merges = td.merges.filter(x => x !== m);
    render(td);
    toast('Ячейки разъединены', 'info');
}

// ==================== RENDER ====================
function render(td) {
    if (!td.el) return;
    const thead = td.el.querySelector('thead');
    const tbody = td.el.querySelector('tbody');

    const sort = sortState[td.id];

    // THEAD
    let theadHtml = '<tr>';
    if (tableSettings.showRowNums) theadHtml += '<th class="row-num">№</th>';
    td.cols.forEach((col, i) => {
        const width = colWidths[td.id]?.[i];
        const styleW = width ? `style="width:${width}px;min-width:${width}px;max-width:${width}px"` : '';
        const sorted = sort && sort.col === i;
        const sortCls = sorted ? (sort.dir === 'asc' ? 'sorted-asc' : 'sorted-desc') : '';
        const sortIcon = sorted ? (sort.dir === 'asc' ? '▲' : '▼') : '⇅';
        theadHtml += `
            <th class="sortable ${sortCls}" data-col="${i}" ${styleW}>
                ${escapeHtml(formatHeader(col, td.currency))}
                <span class="sort-indicator">${sortIcon}</span>
                <span class="resize-handle" data-col="${i}"></span>
            </th>
        `;
    });
    theadHtml += '<th class="actions-col"></th></tr>';
    thead.innerHTML = theadHtml;

    thead.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', e => {
            if (e.target.classList.contains('resize-handle')) return;
            sortByColumn(td, +th.dataset.col);
        });
    });

    thead.querySelectorAll('.resize-handle').forEach(handle => {
        handle.addEventListener('mousedown', e => {
            e.preventDefault();
            e.stopPropagation();
            startResize(td, +handle.dataset.col, e, handle);
        });
    });

    // TBODY
    tbody.innerHTML = '';
    const rows = td.rows;
    const merges = td.merges || [];

    rows.forEach((row, ri) => {
        const tr = document.createElement('tr');
        tr.dataset.ri = ri;
        if (selectedRows[td.id]?.has(ri)) tr.classList.add('selected');

        // Row number
        if (tableSettings.showRowNums) {
            const numTd = document.createElement('td');
            numTd.className = 'row-num';
            numTd.textContent = ri + 1;
            numTd.addEventListener('click', e => {
                if (!selectedRows[td.id]) selectedRows[td.id] = new Set();
                const sel = selectedRows[td.id];
                if (e.shiftKey && lastSelectedRow !== null) {
                    const from = Math.min(lastSelectedRow, ri);
                    const to = Math.max(lastSelectedRow, ri);
                    for (let i = from; i <= to; i++) sel.add(i);
                } else if (e.ctrlKey) {
                    if (sel.has(ri)) sel.delete(ri);
                    else sel.add(ri);
                    lastSelectedRow = ri;
                } else {
                    if (sel.size === 1 && sel.has(ri)) sel.clear();
                    else { sel.clear(); sel.add(ri); }
                    lastSelectedRow = ri;
                }
                render(td);
            });
            tr.appendChild(numTd);
        }

        // Data cells
        row.forEach((v, colIdx) => {
            // Skip hidden merge cells
            if (isMergeHidden(td, ri, colIdx)) return;

            const tdEl = document.createElement('td');
            const input = document.createElement('input');
            const cn = (td.cols[colIdx] || '').toLowerCase();
            const isTotal = cn.startsWith('стоимость');
            const isNum = isNumericCol(cn);
            const mergeStart = getMergeStart(td, ri, colIdx);

            if (mergeStart) {
                tdEl.rowSpan = mergeStart.rowEnd - mergeStart.rowStart + 1;
                tdEl.classList.add('merged-start');
            }

            if (isTotal) {
                input.readOnly = true;
                input.className = 'total';
            } else if (isNum) {
                input.className = cn.startsWith('цена') ? 'price' : 'qty';
            } else if (cn.includes('наименование')) {
                input.className = 'name-cell';
            }

            if (tableSettings.wrapText) input.classList.add('wrap-on');

            input.value = v ?? '';

            input.addEventListener('focus', () => {
                tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
                if (!tableSettings.wrapText) {
                    selectedRows[td.id] = new Set([ri]);
                    tr.classList.add('selected');
                }
                input.dataset.old = input.value;
            });

            if (isNum && !isTotal) {
                input.addEventListener('input', () => {
                    row[colIdx] = input.value;
                    updCalcRow(td, ri);
                });
                input.addEventListener('blur', () => {
                    const n = pn(row[colIdx]);
                    if (!isNaN(n)) {
                        row[colIdx] = n.toFixed(2);
                        input.value = row[colIdx];
                        updCalcRow(td, ri);
                    }
                });
            } else if (!isTotal) {
                input.addEventListener('input', () => { row[colIdx] = input.value; });
            }

            input.addEventListener('change', () => {
                if (input.dataset.old !== undefined && input.value !== input.dataset.old) {
                    hist.push({ a: 'editCell', tid: td.id, d: { ri, ci: colIdx, old: input.dataset.old, val: input.value } });
                }
            });

            input.addEventListener('keydown', e => {
                if (e.key === 'Enter' && e.shiftKey) {
                    e.preventDefault();
                    const s = input.selectionStart, en = input.selectionEnd, v = input.value;
                    input.value = v.substring(0, s) + '\n' + v.substring(en);
                    input.selectionStart = input.selectionEnd = s + 1;
                    row[colIdx] = input.value;
                } else if (e.key === 'Tab') {
                    e.preventDefault();
                    moveFocus(td, ri, colIdx, e.shiftKey ? -1 : 1);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (ri === rows.length - 1) { addRowEnd(td); }
                    moveFocus(td, ri + 1, colIdx, 0, 1);
                } else if (e.key === 'ArrowDown' && input.selectionStart === input.value.length) {
                    e.preventDefault();
                    moveFocus(td, ri, colIdx, 0, 1);
                } else if (e.key === 'ArrowUp' && input.selectionStart === 0) {
                    e.preventDefault();
                    moveFocus(td, ri, colIdx, 0, -1);
                }
            });

            tdEl.appendChild(input);
            tr.appendChild(tdEl);
        });

        // Actions
        const at = document.createElement('td');
        at.className = 'actions-col';
        at.innerHTML = `
            <div class="row-actions">
                <button class="row-action-btn add" title="Добавить строку ниже">+</button>
                <button class="row-action-btn del" title="Удалить строку">✕</button>
            </div>
        `;
        at.querySelector('.add').onclick = e => { e.stopPropagation(); insRowBelow(td, ri); };
        at.querySelector('.del').onclick = e => { e.stopPropagation(); delRow(td, ri); };
        tr.appendChild(at);

        tbody.appendChild(tr);
    });

    // Total row
    if (tableSettings.showTotals && rows.length > 0) {
        const totTr = document.createElement('tr');
        totTr.className = 'row-total';
        const ti = ci(td.cols, 'Стоимость');
        let html = '';
        if (tableSettings.showRowNums) html += '<td class="row-num"></td>';
        td.cols.forEach((_, i) => {
            if (i === (ti >= 0 ? ti - 1 : td.cols.length - 2)) {
                html += '<td style="text-align:right;padding:10px 12px;font-weight:700">Итого</td>';
            } else if (i === ti) {
                html += `<td style="padding:0"><input value="${sumT(td).toFixed(2)}" readonly class="total" style="font-weight:700"></td>`;
            } else {
                html += '<td></td>';
            }
        });
        html += '<td class="actions-col"></td>';
        totTr.innerHTML = html;
        tbody.appendChild(totTr);
    }

    updateCardStats(td);
}

function updCalcRow(td, ri) {
    calc(td.rows[ri], td.cols);
    const ti = ci(td.cols, 'Стоимость');
    if (ti < 0) return;
    const tr = td.el.querySelector(`tbody tr[data-ri="${ri}"]`);
    if (!tr) return;
    const tds = tr.querySelectorAll('td:not(.row-num):not(.actions-col)');
    // Это может быть неточно из-за merge, но обычно работает
    let realIdx = 0;
    let foundIdx = -1;
    for (let i = 0; i < td.cols.length; i++) {
        if (isMergeHidden(td, ri, i)) continue;
        if (i === ti) { foundIdx = realIdx; break; }
        realIdx++;
    }
    if (foundIdx >= 0 && tds[foundIdx]) {
        const inp = tds[foundIdx].querySelector('input');
        if (inp && document.activeElement !== inp) inp.value = td.rows[ri][ti] ?? '';
    }
    const totTr = td.el.querySelector('tbody tr.row-total');
    if (totTr) {
        const totInputs = totTr.querySelectorAll('input');
        totInputs.forEach(inp => {
            if (inp.classList.contains('total')) inp.value = sumT(td).toFixed(2);
        });
    }
    updateCardStats(td);
}

function moveFocus(td, ri, ci, dc, dr = 0) {
    let nr = ri + dr, nc = ci + dc;
    if (nc >= td.cols.length) { nc = 0; nr++; }
    if (nc < 0) { nc = td.cols.length - 1; nr--; }
    if (nr >= td.rows.length) return;
    if (nr < 0) return;
    // Skip hidden cells
    while (isMergeHidden(td, nr, nc)) {
        nc += 1;
        if (nc >= td.cols.length) return;
    }
    const rows = td.el.querySelectorAll('tbody tr[data-ri]');
    const row = [...rows].find(r => +r.dataset.ri === nr);
    if (!row) return;
    const tds = row.querySelectorAll('td:not(.row-num):not(.actions-col)');
    // Вычисляем позицию с учётом merge
    let realIdx = 0;
    for (let i = 0; i < nc; i++) {
        if (isMergeHidden(td, nr, i)) continue;
        realIdx++;
    }
    if (tds[realIdx]) {
        const inp = tds[realIdx].querySelector('input');
        if (inp) { inp.focus(); inp.select(); }
    }
}

function insRowBelow(td, idx) { insRow(td, idx + 1); }
function insRowAbove(td, idx) { insRow(td, idx); }

function insRow(td, idx) {
    td.rows.splice(idx, 0, Array(td.cols.length).fill(''));
    calc(td.rows[idx], td.cols);
    // Сдвигаем merges
    if (td.merges) {
        td.merges.forEach(m => {
            if (m.rowStart >= idx) m.rowStart++;
            if (m.rowEnd >= idx) m.rowEnd++;
        });
    }
    render(td);
}

function delRow(td, idx) {
    if (td.rows.length <= 1) { toast('Нельзя удалить последнюю строку', 'warning'); return; }
    hist.push({ a: 'delRow', tid: td.id, d: { i: idx, r: [...td.rows[idx]], merges: td.merges ? td.merges.map(m => ({ ...m })) : [] } });
    td.rows.splice(idx, 1);
    // Корректируем merges
    if (td.merges) {
        td.merges = td.merges.filter(m => {
            if (m.rowStart > idx && m.rowEnd > idx) {
                m.rowStart--; m.rowEnd--;
                return true;
            }
            if (m.rowStart <= idx && m.rowEnd >= idx) {
                if (m.rowEnd - m.rowStart < 1) return false;
                m.rowEnd--;
                return true;
            }
            return true;
        });
    }
    render(td);
}

function addRowEnd(td) {
    td.rows.push(Array(td.cols.length).fill(''));
    calc(td.rows[td.rows.length - 1], td.cols);
    render(td);
    setTimeout(() => {
        const row = td.el.querySelector(`tbody tr[data-ri="${td.rows.length - 1}"]`);
        if (row) {
            const inp = row.querySelector('td:not(.row-num):not(.actions-col) input');
            if (inp) inp.focus();
        }
    }, 50);
}

function delRowEnd(td) {
    if (td.rows.length <= 1) { toast('Нельзя удалить последнюю строку', 'warning'); return; }
    hist.push({ a: 'delRowEnd', tid: td.id, d: { i: td.rows.length - 1, r: [...td.rows[td.rows.length - 1]], merges: td.merges ? td.merges.map(m => ({ ...m })) : [] } });
    td.rows.pop();
    if (td.merges) {
        td.merges = td.merges.filter(m => m.rowStart < td.rows.length && m.rowEnd < td.rows.length);
    }
    render(td);
}

function insCol(td, idx) {
    openPrompt('Название новой колонки:', '', (name) => {
        if (!name.trim()) return;
        td.cols.splice(idx, 0, name.trim());
        td.rows.forEach(r => r.splice(idx, 0, ''));
        // Сдвигаем merges
        if (td.merges) {
            td.merges.forEach(m => { if (m.col >= idx) m.col++; });
        }
        render(td);
    });
}

function delCol(td, idx) {
    if (td.cols.length <= 2) { toast('Минимум 2 колонки', 'warning'); return; }
    hist.push({ a: 'delCol', tid: td.id, d: { i: idx, n: td.cols[idx], c: td.rows.map(r => r[idx]) } });
    td.cols.splice(idx, 1);
    td.rows.forEach(r => r.splice(idx, 1));
    if (td.merges) {
        td.merges = td.merges.filter(m => m.col !== idx);
        td.merges.forEach(m => { if (m.col > idx) m.col--; });
    }
    render(td);
}

function renameCol(td, idx) {
    openPrompt('Новое название:', td.cols[idx], (name) => {
        if (!name.trim() || name.trim() === td.cols[idx]) return;
        td.cols[idx] = name.trim();
        render(td);
    });
}

function dupCol(td, idx) {
    const name = td.cols[idx] + ' (копия)';
    td.cols.splice(idx + 1, 0, name);
    td.rows.forEach(r => r.splice(idx + 1, 0, r[idx]));
    if (td.merges) {
        td.merges.forEach(m => { if (m.col > idx) m.col++; });
    }
    render(td);
    toast('Колонка дублирована', 'info');
}

function addColEnd(td) {
    openPrompt('Название новой колонки:', '', (name) => {
        if (!name.trim()) return;
        td.cols.push(name.trim());
        td.rows.forEach(r => r.push(''));
        render(td);
    });
}

function delColEnd(td) {
    if (td.cols.length <= 2) { toast('Минимум 2 колонки', 'warning'); return; }
    hist.push({ a: 'delColEnd', tid: td.id, d: { i: td.cols.length - 1, n: td.cols[td.cols.length - 1], c: td.rows.map(r => r[td.cols.length - 1]) } });
    td.cols.pop();
    td.rows.forEach(r => r.pop());
    if (td.merges) {
        const lastIdx = td.cols.length;
        td.merges = td.merges.filter(m => m.col !== lastIdx);
    }
    render(td);
}

function dupRow(td, idx) {
    const copy = [...td.rows[idx]];
    td.rows.splice(idx + 1, 0, copy);
    if (td.merges) {
        td.merges.forEach(m => {
            if (m.rowStart > idx) m.rowStart++;
            if (m.rowEnd > idx) m.rowEnd++;
        });
    }
    render(td);
    toast('Строка дублирована', 'info');
}

// ==================== SORT ====================
function sortByColumn(td, col) {
    const st = sortState[td.id] || { col: -1, dir: 'asc' };
    let dir = 'asc';
    if (st.col === col && st.dir === 'asc') dir = 'desc';
    else if (st.col === col && st.dir === 'desc') dir = 'asc';
    sortState[td.id] = { col, dir };
    td.rows.sort((a, b) => {
        let av = a[col] ?? '', bv = b[col] ?? '';
        const an = pn(av), bn = pn(bv);
        if (!isNaN(an) && !isNaN(bn)) return dir === 'asc' ? an - bn : bn - an;
        av = String(av).toLowerCase();
        bv = String(bv).toLowerCase();
        if (av < bv) return dir === 'asc' ? -1 : 1;
        if (av > bv) return dir === 'asc' ? 1 : -1;
        return 0;
    });
    // Сбрасываем merges при сортировке
    if (td.merges && td.merges.length) {
        td.merges = [];
        toast('Объединения сброшены из-за сортировки', 'info');
    }
    render(td);
}

// ==================== RESIZE ====================
function startResize(td, col, e, handle) {
    document.body.classList.add('resizing');
    handle.classList.add('active');
    const th = handle.closest('th');
    const startX = e.clientX;
    const startW = th.offsetWidth;
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;cursor:col-resize';
    document.body.appendChild(overlay);

    const onMove = ev => {
        const w = Math.max(60, startW + (ev.clientX - startX));
        if (!colWidths[td.id]) colWidths[td.id] = {};
        colWidths[td.id][col] = w;
        th.style.width = w + 'px';
        th.style.minWidth = w + 'px';
        th.style.maxWidth = w + 'px';
        td.el.querySelectorAll(`tbody tr`).forEach(row => {
            const tds = row.querySelectorAll('td:not(.row-num):not(.actions-col)');
            let realIdx = 0;
            td.cols.forEach((_, i) => {
                if (isMergeHidden(td, +row.dataset.ri, i)) return;
                if (i === col && tds[realIdx]) {
                    tds[realIdx].style.width = w + 'px';
                    tds[realIdx].style.minWidth = w + 'px';
                    tds[realIdx].style.maxWidth = w + 'px';
                }
                realIdx++;
            });
        });
    };
    const onUp = () => {
        document.body.classList.remove('resizing');
        handle.classList.remove('active');
        overlay.remove();
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
}

// ==================== UNDO ====================
function undo() {
    if (!hist.length) { toast('Нечего отменять', 'warning'); return; }
    const l = hist.pop();
    const td = workspaces[activeWorkspace].find(t => t.id === l.tid);
    if (!td) { toast('Таблица не найдена', 'error'); return; }
    switch (l.a) {
        case 'editCell': td.rows[l.d.ri][l.d.ci] = l.d.old; render(td); toast('Ввод отменён', 'info'); break;
        case 'delRow':
        case 'delRowEnd':
            td.rows.splice(l.d.i, 0, l.d.r);
            if (l.d.merges) td.merges = l.d.merges.map(m => ({ ...m }));
            render(td);
            toast('Строка возвращена', 'info');
            break;
        case 'paste': td.rows.splice(l.d.si, l.d.count); render(td); toast(`Удалено ${l.d.count} стр.`, 'info'); break;
    }
}

// ==================== PASTE ====================
function parseClipboard(text) {
    if (!text || !text.trim()) return [];
    return text.trim().split(/\r?\n/).map(line => {
        if (line.includes('\t')) return line.split('\t');
        if (line.includes('|')) return line.split('|').map(c => c.trim()).filter(c => c);
        return [line];
    }).filter(r => r.some(c => String(c).trim()));
}

function paste() {
    const td = active();
    if (!td) { toast('Выберите таблицу', 'warning'); return; }
    navigator.clipboard.readText().then(text => {
        const p = parseClipboard(text);
        if (!p.length) { toast('Нет данных', 'warning'); return; }
        insertRowsIntoTable(td, p);
    }).catch(() => {
        openPrompt('Вставьте данные:', '', (val) => {
            if (!val) return;
            const p = parseClipboard(val);
            if (p.length) insertRowsIntoTable(td, p);
        });
    });
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
            if (isNumericCol(cn)) {
                const n = pn(v);
                if (!isNaN(n) && v !== '') v = n.toFixed(2);
            }
            nr[i] = v;
        }
        if (startIdx === 0 && pi === 0) td.rows[0] = nr;
        else td.rows.push(nr);
        calc(nr, td.cols);
    });

    hist.push({ a: 'paste', tid: td.id, d: { si: startIdx, count: parsedRows.length } });
    render(td);
    toast(`Вставлено строк: ${parsedRows.length}`, 'success');
}

// ==================== FIND ====================
function openSearch() {
    const bar = Q('#searchBar');
    bar.classList.add('show');
    setTimeout(() => Q('#searchInput').focus(), 100);
}

function closeSearch() {
    Q('#searchBar').classList.remove('show');
    lastSearch = { query: '', matches: [], idx: 0 };
    document.querySelectorAll('td.search-hit, tr.search-active').forEach(el => {
        el.classList.remove('search-hit', 'search-active');
    });
    const c = Q('#searchCount');
    if (c) c.textContent = '0/0';
}

function doSearch() {
    const td = active();
    if (!td) return;
    const query = Q('#searchInput').value.trim();
    document.querySelectorAll('td.search-hit, tr.search-active').forEach(el => {
        el.classList.remove('search-hit', 'search-active');
    });
    if (!query) {
        lastSearch = { query: '', matches: [], idx: 0 };
        Q('#searchCount').textContent = '0/0';
        return;
    }
    const matches = [];
    td.rows.forEach((row, ri) => {
        row.forEach((v, ci) => {
            if (String(v ?? '').toLowerCase().includes(query.toLowerCase())) {
                matches.push({ ri, ci });
            }
        });
    });
    lastSearch = { query, matches, idx: 0 };
    Q('#searchCount').textContent = matches.length ? `1/${matches.length}` : '0/0';
    if (matches.length) highlightMatch(td, 0);
}

function highlightMatch(td, i) {
    document.querySelectorAll('td.search-hit, tr.search-active').forEach(el => {
        el.classList.remove('search-hit', 'search-active');
    });
    const m = lastSearch.matches[i];
    if (!m) return;
    const row = td.el.querySelector(`tbody tr[data-ri="${m.ri}"]`);
    if (!row) return;
    const tds = row.querySelectorAll('td:not(.row-num):not(.actions-col)');
    // Индекс с учётом merge
    let realIdx = 0;
    for (let j = 0; j < m.ci; j++) {
        if (isMergeHidden(td, m.ri, j)) continue;
        realIdx++;
    }
    if (tds[realIdx]) {
        tds[realIdx].classList.add('search-hit');
        row.classList.add('search-active');
        const input = tds[realIdx].querySelector('input');
        if (input) { input.focus(); input.select(); }
        row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    Q('#searchCount').textContent = `${i + 1}/${lastSearch.matches.length}`;
}

function searchNext() {
    if (!lastSearch.matches.length) return;
    lastSearch.idx = (lastSearch.idx + 1) % lastSearch.matches.length;
    highlightMatch(active(), lastSearch.idx);
}

function searchPrev() {
    if (!lastSearch.matches.length) return;
    lastSearch.idx = (lastSearch.idx - 1 + lastSearch.matches.length) % lastSearch.matches.length;
    highlightMatch(active(), lastSearch.idx);
}

// ==================== PROMPT / CONFIRM ====================
function openPrompt(title, defaultValue, onOk) {
    const modal = Q('#promptModal');
    Q('#promptTitle').textContent = title;
    const input = Q('#promptInput');
    input.value = defaultValue || '';
    modal.classList.add('show');
    setTimeout(() => { input.focus(); input.select(); }, 50);
    window._promptOk = () => {
        modal.classList.remove('show');
        if (onOk) onOk(input.value);
    };
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

// ==================== CONTEXT MENU ====================
function showCtx(x, y) {
    const cm = Q('#ctxMenu');
    cm.style.display = 'block';
    cm.style.left = Math.min(x, window.innerWidth - 240) + 'px';
    cm.style.top = Math.min(y, window.innerHeight - 420) + 'px';
}

function hideCtx() { Q('#ctxMenu').style.display = 'none'; }

// ==================== COPY CELLS ====================
function copySelectedCells() {
    const td = active();
    if (!td) return;
    const sel = selectedRows[td.id];
    if (!sel || !sel.size) { toast('Выделите строки (клик по номеру)', 'warning'); return; }
    const indices = [...sel].sort((a, b) => a - b);
    const lines = indices.map(i => td.rows[i].join('\t'));
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
        toast(`Скопировано ${indices.length} строк`, 'success');
    }).catch(() => toast('Ошибка копирования', 'error'));
}

// ==================== SAVE ====================
function save() {
    const ws = workspaces[activeWorkspace];
    if (!ws.length) { toast('Нет таблиц', 'warning'); return; }
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
        const qi = getQi(td.cols);
        const pi = ci(td.cols, 'Цена');
        const ti = ci(td.cols, 'Стоимость');
        const ni = ci(td.cols, 'Наименование');

        // Header
        const hr = sheet.getRow(cr);
        td.cols.forEach((col, i) => {
            const cell = hr.getCell(i + 1);
            cell.value = formatHeader(col, td.currency);
            cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF64748B' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = {
                top:    { style: 'thin', color: { argb: 'FF475569' } },
                bottom: { style: 'thin', color: { argb: 'FF475569' } },
                left:   { style: 'thin', color: { argb: 'FF475569' } },
                right:  { style: 'thin', color: { argb: 'FF475569' } }
            };
        });
        hr.height = 28;
        cr++;
        const fdr = cr;

        for (let r = 0; r < td.rows.length; r++) {
            const row = sheet.getRow(cr);
            const bg = r % 2 === 0 ? 'FFEFF6FF' : 'FFDBEAFE';
            for (let c = 0; c < tc; c++) {
                const cell = row.getCell(c + 1);
                if (c === ti) cell.value = { formula: `${cA(cr, qi + 1)}*${cA(cr, pi + 1)}`, result: pn(td.rows[r][c]) || 0 };
                else if (c === qi || c === pi) {
                    const v = pn(td.rows[r][c]);
                    cell.value = isNaN(v) ? td.rows[r][c] : v;
                } else cell.value = td.rows[r][c] ?? '';
                if (c === ti || c === qi || c === pi) cell.numFmt = '#,##0.00';
                cell.font = { size: 11, color: { argb: 'FF1E293B' }, name: 'Calibri' };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                cell.border = {
                    top:    { style: 'thin', color: { argb: 'FFBFDBFE' } },
                    bottom: { style: 'thin', color: { argb: 'FFBFDBFE' } },
                    left:   { style: 'thin', color: { argb: 'FFBFDBFE' } },
                    right:  { style: 'thin', color: { argb: 'FFBFDBFE' } }
                };
                if (c === ni) cell.alignment.horizontal = 'left';
                if (c === qi || c === pi || c === ti) cell.alignment.horizontal = 'right';
            }
            cr++;
        }

        // Merges
        if (td.merges) {
            td.merges.forEach(m => {
                try {
                    sheet.mergeCells(fdr + m.rowStart, m.col + 1, fdr + m.rowEnd, m.col + 1);
                } catch (e) {}
            });
        }

        // Total row
        const ldr = cr - 1;
        const tr = sheet.getRow(cr);
        for (let c = 0; c < tc; c++) {
            const cell = tr.getCell(c + 1);
            if (c === (ti >= 0 ? ti - 1 : tc - 2)) cell.value = 'Итого';
            else if (c === ti) cell.value = { formula: `SUM(${cA(fdr, ti + 1)}:${cA(ldr, ti + 1)})`, result: sumT(td) };
            if (c === ti) cell.numFmt = '#,##0.00';
            cell.font = { bold: true, size: 12, name: 'Calibri' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
            cell.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
            cell.border = {
                top:    { style: 'medium', color: { argb: 'FF64748B' } },
                bottom: { style: 'medium', color: { argb: 'FF64748B' } },
                left:   { style: 'thin', color: { argb: 'FFBFDBFE' } },
                right:  { style: 'thin', color: { argb: 'FFBFDBFE' } }
            };
        }
        tr.height = 28;
        cr += 2;
    });

    wb.xlsx.writeBuffer().then(buf => {
        const fn = `Заказы_ONTEK_${new Date().toISOString().slice(0, 10)}.xlsx`;
        if (window.pywebview && window.pywebview.api) {
            const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
            window.pywebview.api.save_file(b64, fn).then(r => {
                const j = JSON.parse(r);
                if (j.success) toast('Файл сохранён', 'success');
                else toast('Сохранение отменено', 'info');
            });
        } else {
            const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = fn;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast('Файл сохранён', 'success');
        }
    }).catch(() => toast('Ошибка сохранения', 'error'));
}

// ==================== LOAD ====================
function loadFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
            processWB(wb);
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
            const bs = atob(r.data);
            const bytes = new Uint8Array(bs.length);
            for (let i = 0; i < bs.length; i++) bytes[i] = bs.charCodeAt(i);
            processWB(XLSX.read(bytes, { type: 'array' }));
        }
    } else {
        Q('#fileInput').click();
    }
}

function processWB(wb) {
    setStatus('Загрузка файла...', 'busy');
    const area = getArea();
    area.innerHTML = '';
    const ws = workspaces[activeWorkspace];
    ws.length = 0;
    idC = 0;
    actId = null;
    sortState = {};
    colWidths = {};
    selectedRows = {};

    wb.SheetNames.forEach(sheetName => {
        const raw = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: '' });
        if (!raw.length) return;
        let cur = null, ec = 0, skipCols = 0;

        for (let i = 0; i < raw.length; i++) {
            const row = raw[i];
            const empty = !row || row.every(c => String(c ?? '').trim() === '');
            if (empty) {
                ec++;
                if (ec >= 2 && cur && cur.rows.length) { fin(cur); cur = null; }
                continue;
            }
            ec = 0;

            if (row.some(c => String(c || '').trim().toLowerCase().startsWith('итого'))) {
                if (cur && cur.rows.length) { fin(cur); cur = null; }
                continue;
            }

            const isHeader = row.some(c => {
                const s = String(c || '').toLowerCase();
                return s.includes('артикул') || s.includes('наименование');
            });
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
                if (isNumericCol(cn)) {
                    const num = pn(v);
                    if (!isNaN(num) && v !== '') v = parseFloat(num.toFixed(2));
                }
                nr.push(v);
            }
            cur.rows.push(nr);
        }
        if (cur && cur.rows.length) fin(cur);

        function fin(c) {
            if (!c.cols.length) c.cols = [...DEFAULT_COLS];
            if (!c.rows.length) c.rows = [Array(c.cols.length).fill('')];
            idC++;
            ws.push({ id: idC, cols: c.cols, rows: c.rows, currency: c.currency, el: null, card: null, merges: [] });
        }
    });

    ws.forEach(td => {
        const card = buildCardDOM(td);
        area.appendChild(card);
        td.card = card;
        render(td);
    });

    upEmpty();
    if (!ws.length) {
        addTable('USD');
        setStatus('Файл пуст', 'warning');
    } else {
        setAct(ws[0].id);
        updateStatusBar();
        setStatus(`Загружено: ${ws.length} табл.`, 'ok');
        toast(`Загружено ${ws.length} таблиц`, 'success');
    }
}

// ==================== HOTKEYS ====================
function findConflict(key, exclude) {
    for (const [k, v] of Object.entries(hotkeys)) {
        if (k !== exclude && v === key) return k;
    }
    return null;
}

function renderHotkeyList() {
    const container = Q('#hotkeyList');
    if (!container) return;
    container.innerHTML = Object.keys(DEFAULT_HOTKEYS).map(k => {
        const key = hotkeys[k] || '';
        return `<div class="hotkey-row">
            <span class="hotkey-label">${escapeHtml(KEY_LABELS[k] || k)}</span>
            <span class="hotkey-key" data-hk="${k}">${key ? 'Shift+' + hkDisplay(key) : '—'}</span>
        </div>`;
    }).join('');
    container.querySelectorAll('.hotkey-key').forEach(el => {
        el.onclick = () => startRecording(el);
    });
}

function startRecording(el) {
    if (recordingKey) recordingKey.classList.remove('recording');
    recordingKey = el;
    recordingHk = el.dataset.hk;
    el.classList.add('recording');
    el.textContent = '...';

    const handler = e => {
        e.preventDefault();
        e.stopPropagation();
        let key = e.key.toUpperCase();
        if (key === 'DELETE' || key === 'DEL') key = 'DELETE';
        if (key === 'CONTROL' || key === 'SHIFT' || key === 'ALT') return;
        const conflict = findConflict(key, recordingHk);
        if (conflict && conflict !== recordingHk) {
            if (!confirm(`Клавиша Shift+${hkDisplay(key)} уже назначена на «${KEY_LABELS[conflict]}».\nПереназначить?`)) {
                el.textContent = hotkeys[recordingHk] ? 'Shift+' + hkDisplay(hotkeys[recordingHk]) : '—';
                el.classList.remove('recording');
                recordingKey = null;
                recordingHk = null;
                document.removeEventListener('keydown', handler);
                return;
            }
            hotkeys[conflict] = '';
        }
        hotkeys[recordingHk] = key;
        el.textContent = 'Shift+' + hkDisplay(key);
        el.classList.remove('recording');
        const label = KEY_LABELS[recordingHk];
        recordingKey = null;
        recordingHk = null;
        saveNow();
        updateAllHKDisplays();
        renderHotkeyList();
        document.removeEventListener('keydown', handler);
        toast(`«${label}» → Shift+${hkDisplay(key)}`, 'success');
    };
    document.addEventListener('keydown', handler);
}

// ==================== THEME CARDS ====================
function renderThemeOptions(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = COLOR_THEMES.map(t => `
        <div class="theme-card ${t.id === colorTheme ? 'active' : ''}" data-theme="${t.id}">
            <div class="theme-preview" style="background:${t.gradient}">${t.letter}</div>
            <div class="theme-name">${t.name}</div>
            <div class="theme-desc">${t.desc}</div>
        </div>
    `).join('');
    container.querySelectorAll('.theme-card').forEach(c => {
        c.onclick = () => setColorTheme(c.dataset.theme);
    });
}

function toggleSection(id) {
    const title = document.querySelector(`[data-toggle="${id}"]`);
    const body = document.getElementById(id);
    if (!title || !body) return;
    title.classList.toggle('open');
    body.classList.toggle('open');
}

// ==================== GLOBAL HOTKEYS ====================
function handleGlobalHotkeys(e) {
    if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        const k = e.key.toLowerCase();
        if (k === 'z') { e.preventDefault(); undo(); return; }
        if (k === 'f') { e.preventDefault(); openSearch(); return; }
        if (k === 't') { e.preventDefault(); toggleTheme(); return; }
        if (k >= '1' && k <= '5') { e.preventDefault(); switchWorkspace(+k); return; }
        if (k === 's') { e.preventDefault(); save(); return; }
        if (k === 'o') { e.preventDefault(); loadViaDialog(); return; }
        if (k === 'v' && !e.target.closest('input')) { e.preventDefault(); paste(); return; }
        if (k === 'd' && !e.target.closest('input')) { e.preventDefault(); dupTable(); return; }
        if (k === 'c' && !e.target.closest('input')) {
            const td = active();
            if (td && selectedRows[td.id] && selectedRows[td.id].size > 0) {
                e.preventDefault();
                copySelectedCells();
                return;
            }
        }
    }

    if (e.key === 'Escape') {
        hideCtx();
        closeSearch();
        return;
    }

    if (e.key === 'F3') { e.preventDefault(); if (lastSearch.matches.length) searchNext(); return; }

    if (e.shiftKey && !e.ctrlKey && !e.altKey && !e.target.closest('input') && !recordingKey) {
        let key = e.key.toUpperCase();
        if (e.code === 'Digit1') key = '1';
        if (e.code === 'Digit2') key = '2';
        if (e.code === 'Delete') key = 'DELETE';
        if (e.code === 'Numpad1') key = '1';
        if (e.code === 'Numpad2') key = '2';
        if (e.code === 'NumpadDecimal') key = 'DELETE';
        if (RU_KEYS[key]) key = RU_KEYS[key];

        const actions = {
            addRow: () => { const t = active(); if (t) addRowEnd(t); },
            delRow: () => { const t = active(); if (t) delRowEnd(t); },
            addCol: () => { const t = active(); if (t) addColEnd(t); },
            delCol: () => { const t = active(); if (t) delColEnd(t); },
            recalc: () => {
                workspaces[activeWorkspace].forEach(td => {
                    td.rows.forEach(r => calc(r, td.cols));
                    render(td);
                });
                toast('Пересчитано', 'success');
            },
            paste: () => paste(),
            load: () => loadViaDialog(),
            newRUB: () => addTable('RUB'),
            newUSD: () => addTable('USD'),
            dup: () => dupTable(),
            clear: () => {
                const area = getArea();
                if (!workspaces[activeWorkspace].length) return;
                openConfirm('Очистить всё?', 'Все таблицы в текущем окне будут удалены.', () => {
                    area.innerHTML = '';
                    workspaces[activeWorkspace].length = 0;
                    idC = 0;
                    actId = null;
                    upEmpty();
                    updateStatusBar();
                    toast('Очищено', 'info');
                });
            },
            undo: () => undo(),
            save: () => save(),
            convert: () => { const t = active(); if (t) convertCurrency(t); }
        };
        for (const [k, v] of Object.entries(hotkeys)) {
            if (key === v && actions[k]) { e.preventDefault(); actions[k](); return; }
        }
    }
}

function handleGlobalPaste(e) {
    if (e.target.closest('input')) return;
    e.preventDefault();
    paste();
}

// ==================== BIND ====================
function bindAllEvents() {
    document.getElementById('btnTheme').onclick = toggleTheme;
    document.getElementById('fileInput').onchange = e => {
        if (e.target.files[0]) { loadFile(e.target.files[0]); e.target.value = ''; }
    };

    // Settings
    document.getElementById('btnSettings').onclick = () => {
        document.getElementById('settingsModal').classList.add('show');
        renderHotkeyList();
        renderThemeOptions('themeOptionsSettings');
    };
    document.getElementById('btnCloseSettings').onclick = () => document.getElementById('settingsModal').classList.remove('show');
    document.getElementById('settingsModal').addEventListener('click', function (e) {
        if (e.target === this) this.classList.remove('show');
    });
    document.getElementById('btnResetHotkeys').onclick = () => {
        hotkeys = { ...DEFAULT_HOTKEYS };
        saveNow();
        updateAllHKDisplays();
        renderHotkeyList();
        toast('Горячие клавиши сброшены', 'info');
    };
    document.querySelectorAll('[data-toggle]').forEach(el => {
        el.onclick = () => toggleSection(el.dataset.toggle);
    });

    // Table settings
    const rh = Q('#setRowHeight');
    if (rh) {
        rh.oninput = () => {
            tableSettings.rowHeight = +rh.value;
            Q('#valRowHeight').textContent = rh.value + ' px';
            applyTableSettings();
        };
    }
    const fs = Q('#setFontSize');
    if (fs) {
        fs.oninput = () => {
            tableSettings.fontSize = +fs.value;
            Q('#valFontSize').textContent = fs.value + ' px';
            applyTableSettings();
        };
    }
    const wt = Q('#setWrapText');
    if (wt) wt.onchange = () => { tableSettings.wrapText = wt.checked; applyTableSettings(); };
    const sn = Q('#setShowRowNums');
    if (sn) sn.onchange = () => { tableSettings.showRowNums = sn.checked; applyTableSettings(); };
    const st = Q('#setShowTotals');
    if (st) st.onchange = () => { tableSettings.showTotals = st.checked; applyTableSettings(); };
    const cm = Q('#setCompact');
    if (cm) cm.onchange = () => { tableSettings.compact = cm.checked; applyTableSettings(); };

    // Color themes
    document.getElementById('btnColorTheme').onclick = () => {
        document.getElementById('colorThemeModal').classList.add('show');
        renderThemeOptions('colorThemeOptions');
    };
    document.getElementById('btnCloseColorTheme').onclick = () => document.getElementById('colorThemeModal').classList.remove('show');
    document.getElementById('colorThemeModal').addEventListener('click', function (e) {
        if (e.target === this) this.classList.remove('show');
    });

    // Sidebar
    const safeBind = (id, fn, retries = 5) => {
        const el = document.getElementById(id);
        if (el) { el.onclick = fn; return; }
        if (retries > 0) setTimeout(() => safeBind(id, fn, retries - 1), 100);
    };
    safeBind('btnAddRow', () => { const t = active(); if (t) addRowEnd(t); else toast('Выберите таблицу', 'warning'); });
    safeBind('btnDelRow', () => { const t = active(); if (t) delRowEnd(t); else toast('Выберите таблицу', 'warning'); });
    safeBind('btnAddCol', () => { const t = active(); if (t) addColEnd(t); else toast('Выберите таблицу', 'warning'); });
    safeBind('btnDelCol', () => { const t = active(); if (t) delColEnd(t); else toast('Выберите таблицу', 'warning'); });
    safeBind('btnConvert', () => { const t = active(); if (t) convertCurrency(t); else toast('Выберите таблицу', 'warning'); });
    safeBind('btnRecalc', () => {
        workspaces[activeWorkspace].forEach(td => {
            td.rows.forEach(r => calc(r, td.cols));
            render(td);
        });
        toast('Пересчитано', 'success');
    });
    safeBind('btnPaste', paste);
    safeBind('btnNewRUB', () => addTable('RUB'));
    safeBind('btnNewUSD', () => addTable('USD'));
    safeBind('btnSave', save);
    safeBind('btnLoad', loadViaDialog);
    safeBind('btnClear', () => {
        if (!workspaces[activeWorkspace].length) return;
        openConfirm('Очистить всё?', 'Все таблицы в текущем окне будут удалены.', () => {
            getArea().innerHTML = '';
            workspaces[activeWorkspace].length = 0;
            idC = 0;
            actId = null;
            upEmpty();
            updateStatusBar();
            toast('Очищено', 'info');
        });
    });
    safeBind('btnDup', () => dupTable());
    safeBind('btnUndo', undo);
    safeBind('btnFind', openSearch);

    // Prompt
    document.getElementById('promptOk').onclick = () => { if (window._promptOk) window._promptOk(); };
    document.getElementById('promptCancel').onclick = () => { if (window._promptCancel) window._promptCancel(); };
    document.getElementById('promptInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); if (window._promptOk) window._promptOk(); }
        if (e.key === 'Escape') { if (window._promptCancel) window._promptCancel(); }
    });

    // Confirm
    document.getElementById('confirmOk').onclick = () => { if (window._confirmOk) window._confirmOk(); };
    document.getElementById('confirmCancel').onclick = () => { if (window._confirmCancel) window._confirmCancel(); };

    // Search
    document.getElementById('searchInput').addEventListener('input', doSearch);
    document.getElementById('searchInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) searchPrev(); else searchNext();
        }
        if (e.key === 'Escape') closeSearch();
    });
    document.getElementById('searchNext').onclick = searchNext;
    document.getElementById('searchPrev').onclick = searchPrev;
    document.getElementById('searchClose').onclick = closeSearch;

    // Ctx menu
    Q('#ctxMenu').addEventListener('click', e => {
        const item = e.target.closest('.ctx-item');
        if (!item) return;
        const action = item.dataset.action;
        hideCtx();
        const td = active();
        const ctx = window._ctxD || {};
        if (!td && action !== 'paste') return;
        if (td) setAct(td.id);
        switch (action) {
            case 'addRowAbove':   if (td && ctx.ri != null) insRowAbove(td, ctx.ri); break;
            case 'addRowBelow':   if (td && ctx.ri != null) insRowBelow(td, ctx.ri); break;
            case 'dupRow':        if (td && ctx.ri != null) dupRow(td, ctx.ri); break;
            case 'delRow':        if (td && ctx.ri != null) delRow(td, ctx.ri); break;
            case 'mergeCells': {
                if (!td || ctx.ci == null) break;
                const sel = selectedRows[td.id];
                if (!sel || sel.size < 2) {
                    // Пытаемся объединить с ячейкой ниже
                    if (ctx.ri != null && ctx.ri < td.rows.length - 1) {
                        mergeCellsForRange(td, ctx.ci, ctx.ri, ctx.ri + 1);
                    } else {
                        toast('Выделите несколько строк (клик по номерам)', 'warning');
                    }
                    break;
                }
                const indices = [...sel].sort((a, b) => a - b);
                // Проверяем что идут подряд
                let consecutive = true;
                for (let i = 1; i < indices.length; i++) {
                    if (indices[i] !== indices[i-1] + 1) { consecutive = false; break; }
                }
                if (!consecutive) { toast('Строки должны идти подряд', 'warning'); break; }
                mergeCellsForRange(td, ctx.ci, indices[0], indices[indices.length - 1]);
                break;
            }
            case 'unmergeCells':  if (td && ctx.ri != null && ctx.ci != null) unmergeCellsAt(td, ctx.ri, ctx.ci); break;
            case 'renameCol':     if (td && ctx.ci != null) renameCol(td, ctx.ci); break;
            case 'addColBefore':  if (td && ctx.ci != null) insCol(td, ctx.ci); break;
            case 'addColAfter':   if (td && ctx.ci != null) insCol(td, ctx.ci + 1); break;
            case 'dupCol':        if (td && ctx.ci != null) dupCol(td, ctx.ci); break;
            case 'delCol':        if (td && ctx.ci != null) delCol(td, ctx.ci); break;
            case 'copyCells':     copySelectedCells(); break;
            case 'paste':         paste(); break;
            case 'dupTable':      if (td) dupTable(td); break;
            case 'delTable':
                if (td) {
                    const ws = workspaces[activeWorkspace];
                    if (ws.length <= 1) { toast('Нужна хотя бы одна таблица', 'warning'); break; }
                    openConfirm('Удалить таблицу?', 'Без возможности восстановления.', () => {
                        td.card.remove();
                        ws.splice(ws.indexOf(td), 1);
                        if (actId === td.id) actId = ws.length ? ws[0].id : null;
                        upEmpty();
                        updateStatusBar();
                        toast('Таблица удалена', 'info');
                    });
                }
                break;
        }
    });

    document.addEventListener('click', e => {
        if (!Q('#ctxMenu').contains(e.target)) hideCtx();
    });

    document.addEventListener('keydown', handleGlobalHotkeys);
    document.addEventListener('paste', handleGlobalPaste);
}
