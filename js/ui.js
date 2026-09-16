// ==================== ONTEK v7.1.0 — UI ====================
// Сайдбар, тулбар, контекстное меню (многоуровневое), модалки, поиск, темы

const CTX_ICONS = {
    insert: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
    format: '<svg viewBox="0 0 24 24"><path d="M4 20l4-14h2l4 14"/><path d="M6 14h6"/><path d="M17 9v11"/><path d="M14 12h6"/></svg>',
    align: '<svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="14" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>',
    cells: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>',
    col: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>',
    sort: '<svg viewBox="0 0 24 24"><path d="M8 5v14M8 5l-3 3M8 5l3 3"/><path d="M16 19V5M16 19l-3-3M16 19l3-3"/></svg>',
    rowUp: '<svg viewBox="0 0 24 24"><path d="M12 19V5"/><path d="M12 5l-5 5M12 5l5 5"/></svg>',
    rowDown: '<svg viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M12 19l-5-5M12 19l5-5"/></svg>',
    section: '<svg viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="8" rx="2"/><path d="M8 12h8"/></svg>',
    dup: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    del: '<svg viewBox="0 0 24 24"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    paste: '<svg viewBox="0 0 24 24"><rect x="8" y="3" width="12" height="4" rx="1"/><path d="M16 5h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/></svg>',
    table: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>',
    merge: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12h6"/></svg>',
    unmerge: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 15h6"/></svg>',
    note: '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    currency: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v10"/><path d="M15 10a3 3 0 0 0-3-2h-1a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-1a3 3 0 0 1-3-2"/></svg>',
    markup: '<svg viewBox="0 0 24 24"><circle cx="7" cy="7" r="2"/><circle cx="17" cy="17" r="2"/><line x1="5" y1="19" x2="19" y2="5"/></svg>',
    discount: '<svg viewBox="0 0 24 24"><path d="M20 12V6a2 2 0 0 0-2-2h-6L4 12l8 8 8-8z"/><circle cx="15" cy="9" r="1.5" fill="currentColor"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    autofit: '<svg viewBox="0 0 24 24"><path d="M8 9l-4 3 4 3"/><path d="M16 9l4 3-4 3"/><line x1="4" y1="12" x2="20" y2="12"/></svg>',
    rename: '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/></svg>',
    bold: '<svg viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 0 1 0 8H6z"/><path d="M6 12h9a4 4 0 0 1 0 8H6z"/></svg>',
    italic: '<svg viewBox="0 0 24 24"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>',
    underline: '<svg viewBox="0 0 24 24"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" y1="20" x2="20" y2="20"/></svg>',
    strike: '<svg viewBox="0 0 24 24"><line x1="4" y1="12" x2="20" y2="12"/><path d="M6 8a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4"/><path d="M6 16a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4"/></svg>',
    painter: '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="6" rx="1"/><path d="M12 9v5"/><path d="M9 21h6"/><path d="M12 14v7"/></svg>',
    clear: '<svg viewBox="0 0 24 24"><path d="M9 4h10l-3 16H6z"/><line x1="3" y1="20" x2="21" y2="20"/></svg>',
    color: '<svg viewBox="0 0 24 24"><path d="M9 11l3-3 7 7-3 3z"/><path d="M5 19h4v-4H5z"/></svg>',
    usd: '<svg viewBox="0 0 24 24"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 6a4 4 0 0 0-4-2h-2a4 4 0 0 0 0 8h2a4 4 0 0 1 0 8h-2a4 4 0 0 1-4-2"/></svg>',
    eur: '<svg viewBox="0 0 24 24"><path d="M18 6a7 7 0 1 0 0 12"/><line x1="4" y1="10" x2="13" y2="10"/><line x1="4" y1="14" x2="13" y2="14"/></svg>',
    rub: '<svg viewBox="0 0 24 24"><path d="M8 4v16"/><path d="M8 4h5a4 4 0 0 1 0 8H8"/><path d="M6 16h10"/><path d="M6 20h10"/></svg>',
    gold: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="16" rx="8" ry="4"/><path d="M4 16v-6a8 4 0 0 1 16 0v6"/></svg>',
    btc: '<svg viewBox="0 0 24 24"><path d="M9 6h4a3 3 0 0 1 0 6H9z"/><path d="M9 12h5a3 3 0 0 1 0 6H9z"/><line x1="11" y1="3" x2="11" y2="6"/><line x1="13" y1="3" x2="13" y2="6"/><line x1="11" y1="18" x2="11" y2="21"/><line x1="13" y1="18" x2="13" y2="21"/></svg>'
};

// ========== SIDEBAR ==========
function buildSidebarV2() {
    const sb = Q('#sidebarContent'); if (!sb) return;
    const sections = [
        { t: 'Таблица', buttons: [
            { id: 'btnAddRow',  icon: ICONS.plus,     label: 'Добавить строку',  hk: 'addRow' },
            { id: 'btnAddDivider', icon: ICONS.divider, label: 'Разделитель', hk: null }
        ]},
        { t: 'Действия', buttons: [
            { id: 'btnConvert', icon: ICONS.convert, label: 'Конвертировать всё', hk: 'convert' },
            { id: 'btnPaste',   icon: ICONS.paste,   label: 'Вставить',       hk: 'paste' },
            { id: 'btnDup',     icon: ICONS.copy,    label: 'Дублировать',    hk: 'dup' },
            { id: 'btnRecalc',  icon: ICONS.refresh, label: 'Пересчёт',       hk: 'recalc' },
            { id: 'btnFind',    icon: ICONS.search,  label: 'Найти',          hk: null },
            { id: 'btnReplace', icon: ICONS.replace, label: 'Заменить',       hk: null },
            { id: 'btnTemplates', icon: ICONS.templates, label: 'Шаблоны',    hk: null }
        ]},
        { t: 'Создать', buttons: [
            { id: 'btnNewRUB', icon: ICONS.ruble,  label: 'Новая RUB', hk: 'newRUB' },
            { id: 'btnNewUSD', icon: ICONS.dollar, label: 'Новая USD', hk: 'newUSD' }
        ]},
        { t: 'Файл', buttons: [
            { id: 'btnLoad',  icon: ICONS.folder, label: 'Открыть',         hk: 'load' },
            { id: 'btnSave',  icon: ICONS.save,   label: 'Сохранить Excel', hk: 'save' },
            { id: 'btnClear', icon: ICONS.trash,  label: 'Очистить',        hk: 'clear' },
            { id: 'btnUndo',  icon: ICONS.undo,   label: 'Отменить',        hk: 'undo' }
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
    const tc = Q('#btnColorTheme'); if (tc) tc.innerHTML = ICONS.palette;
    const ts = Q('#btnSettings'); if (ts) ts.innerHTML = ICONS.settings;
    const ti = Q('#themeIcon'); if (ti) ti.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
}

// ========== WORKSPACE TABS ==========
function buildWorkspaces() {
    const tabs = Q('#workspaceTabs'), container = Q('#workspaceContainer');
    tabs.innerHTML = ''; container.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        tabs.innerHTML += `<button class="workspace-tab ${i === activeWorkspace ? 'active' : ''}" data-ws="${i}">Окно ${i}</button>`;
        container.innerHTML += `<div class="workspace-panel ${i === activeWorkspace ? 'active' : ''}" data-ws="${i}"><div class="tables-area" id="workspaceArea_${i}"></div></div>`;
    }
    tabs.querySelectorAll('.workspace-tab').forEach(t => { t.onclick = () => switchWorkspace(+t.dataset.ws); });
    container.querySelectorAll('.tables-area').forEach(area => {
        area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
        area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
        area.addEventListener('drop', e => { e.preventDefault(); area.classList.remove('drag-over'); const f = e.dataTransfer.files[0]; if (f) loadFile(f); });
    });
    upEmpty();
}

// ========== CONTEXT MENU (многоуровневое) ==========
let openSubmenus = [];

function closeSubmenusFromLevel(level) {
    const keep = [];
    openSubmenus.forEach(s => {
        if (s.level < level) keep.push(s);
        else { s.el.remove(); if (s.parentEl) s.parentEl.classList.remove('open'); }
    });
    openSubmenus = keep;
}
function hideCtx() {
    const cm = Q('#ctxMenu');
    if (cm) { cm.style.display = 'none'; cm.innerHTML = ''; }
    openSubmenus.forEach(s => { s.el.remove(); if (s.parentEl) s.parentEl.classList.remove('open'); });
    openSubmenus = [];
}

function buildCtxHTML(ctx) {
    const isCell = ctx && ctx.ri != null && ctx.ci != null;
    const isHeader = ctx && ctx.ci != null && ctx.ri == null;
    const items = [];
    items.push(`<div class="ctx-item" data-action="addRowAbove"><span class="ctx-icon">${CTX_ICONS.rowUp}</span> Строку выше</div>`);
    items.push(`<div class="ctx-item" data-action="addRowBelow"><span class="ctx-icon">${CTX_ICONS.rowDown}</span> Строку ниже</div>`);
    items.push(`<div class="ctx-item" data-action="addSection"><span class="ctx-icon">${CTX_ICONS.section}</span> Строка-заголовок</div>`);
    items.push(`<div class="ctx-item" data-action="dupRow"><span class="ctx-icon">${CTX_ICONS.dup}</span> Дублировать строку</div>`);
    items.push(`<div class="ctx-item danger" data-action="delRow"><span class="ctx-icon">${CTX_ICONS.del}</span> Удалить строку</div>`);
    items.push(`<div class="ctx-div"></div>`);
    items.push(`<div class="ctx-item has-sub" data-sub="insert"><span class="ctx-icon">${CTX_ICONS.insert}</span> Вставить</div>`);
    items.push(`<div class="ctx-item has-sub" data-sub="format"><span class="ctx-icon">${CTX_ICONS.format}</span> Формат</div>`);
    items.push(`<div class="ctx-item has-sub" data-sub="align"><span class="ctx-icon">${CTX_ICONS.align}</span> Выравнивание</div>`);
    items.push(`<div class="ctx-item has-sub" data-sub="cells"><span class="ctx-icon">${CTX_ICONS.cells}</span> Ячейки</div>`);
    if (isHeader || isCell) items.push(`<div class="ctx-item has-sub" data-sub="col"><span class="ctx-icon">${CTX_ICONS.col}</span> Колонка</div>`);
    if (isHeader) items.push(`<div class="ctx-item has-sub" data-sub="sort"><span class="ctx-icon">${CTX_ICONS.sort}</span> Сортировка</div>`);
    items.push(`<div class="ctx-div"></div>`);
    if (isCell && ctx.ri != null) {
        items.push(`<div class="ctx-item" data-action="copyRowFmt"><span class="ctx-icon">${CTX_ICONS.copy}</span> Копировать строку (с цветами)</div>`);
    }
    items.push(`<div class="ctx-item" data-action="copyFmt"><span class="ctx-icon">${CTX_ICONS.copy}</span> Копировать выделенное <span class="ctx-shortcut">Ctrl+C</span></div>`);
    items.push(`<div class="ctx-item" data-action="copyTableFmt"><span class="ctx-icon">${CTX_ICONS.table}</span> Копировать таблицу</div>`);
    items.push(`<div class="ctx-item" data-action="paste"><span class="ctx-icon">${CTX_ICONS.paste}</span> Вставить <span class="ctx-shortcut">Ctrl+V</span></div>`);
    items.push(`<div class="ctx-div"></div>`);
    items.push(`<div class="ctx-item" data-action="dupTable"><span class="ctx-icon">${CTX_ICONS.table}</span> Дублировать таблицу</div>`);
    items.push(`<div class="ctx-item danger" data-action="delTable"><span class="ctx-icon">${CTX_ICONS.trash}</span> Удалить таблицу</div>`);
    return items.join('');
}

function buildSubmenuHTML(subName, ctx) {
    switch (subName) {
        case 'insert':
            return `
                <div class="ctx-item" data-action="addDividerBefore"><span class="ctx-icon">${CTX_ICONS.section}</span> Разделитель перед таблицей</div>
                <div class="ctx-item" data-action="addDividerAfter"><span class="ctx-icon">${CTX_ICONS.section}</span> Разделитель после таблицы</div>
                <div class="ctx-div"></div>
                <div class="ctx-item" data-action="addColBefore"><span class="ctx-icon">${CTX_ICONS.col}</span> Колонку перед</div>
                <div class="ctx-item" data-action="addColAfter"><span class="ctx-icon">${CTX_ICONS.col}</span> Колонку после</div>
                <div class="ctx-div"></div>
                <div class="ctx-item" data-action="addRowAbove"><span class="ctx-icon">${CTX_ICONS.rowUp}</span> Строку выше</div>
                <div class="ctx-item" data-action="addRowBelow"><span class="ctx-icon">${CTX_ICONS.rowDown}</span> Строку ниже</div>`;
        case 'format':
            return `
                <div class="ctx-item" data-action="bold"><span class="ctx-icon">${CTX_ICONS.bold}</span> Жирный <span class="ctx-shortcut">Ctrl+B</span></div>
                <div class="ctx-item" data-action="italic"><span class="ctx-icon">${CTX_ICONS.italic}</span> Курсив <span class="ctx-shortcut">Ctrl+I</span></div>
                <div class="ctx-item" data-action="underline"><span class="ctx-icon">${CTX_ICONS.underline}</span> Подчёркнутый <span class="ctx-shortcut">Ctrl+U</span></div>
                <div class="ctx-item" data-action="strike"><span class="ctx-icon">${CTX_ICONS.strike}</span> Зачёркнутый</div>
                <div class="ctx-div"></div>
                <div class="ctx-item" data-action="formatPainter"><span class="ctx-icon">${CTX_ICONS.painter}</span> Копировать формат</div>
                <div class="ctx-item" data-action="clearFormat"><span class="ctx-icon">${CTX_ICONS.clear}</span> Очистить формат</div>
                <div class="ctx-div"></div>
                <div class="ctx-item has-sub" data-sub="textColor"><span class="ctx-icon">${CTX_ICONS.color}</span> Цвет текста</div>
                <div class="ctx-item has-sub" data-sub="bgColor"><span class="ctx-icon">${CTX_ICONS.color}</span> Цвет фона</div>`;
        case 'align':
            return `
                <div class="ctx-item" data-action="alignLeft"><span class="ctx-icon">${CTX_ICONS.align}</span> По левому краю</div>
                <div class="ctx-item" data-action="alignCenter"><span class="ctx-icon">${CTX_ICONS.align}</span> По центру</div>
                <div class="ctx-item" data-action="alignRight"><span class="ctx-icon">${CTX_ICONS.align}</span> По правому краю</div>`;
        case 'cells':
            return `
                <div class="ctx-item" data-action="mergeCells"><span class="ctx-icon">${CTX_ICONS.merge}</span> Объединить ячейки</div>
                <div class="ctx-item" data-action="unmergeCells"><span class="ctx-icon">${CTX_ICONS.unmerge}</span> Разъединить ячейки</div>
                <div class="ctx-div"></div>
                <div class="ctx-item" data-action="addNote"><span class="ctx-icon">${CTX_ICONS.note}</span> Заметка к ячейке</div>`;
        case 'col':
            return `
                <div class="ctx-item has-sub" data-sub="colCurrency"><span class="ctx-icon">${CTX_ICONS.currency}</span> Валюта колонки</div>
                <div class="ctx-div"></div>
                <div class="ctx-item" data-action="renameCol"><span class="ctx-icon">${CTX_ICONS.rename}</span> Переименовать</div>
                <div class="ctx-item" data-action="dupCol"><span class="ctx-icon">${CTX_ICONS.dup}</span> Дублировать</div>
                <div class="ctx-div"></div>
                <div class="ctx-item" data-action="markup"><span class="ctx-icon">${CTX_ICONS.markup}</span> Наценка</div>
                <div class="ctx-item" data-action="discount"><span class="ctx-icon">${CTX_ICONS.discount}</span> Скидка</div>
                <div class="ctx-div"></div>
                <div class="ctx-item" data-action="hideCol"><span class="ctx-icon">${CTX_ICONS.eye}</span> Скрыть колонку</div>
                <div class="ctx-item" data-action="showAllCols"><span class="ctx-icon">${CTX_ICONS.eye}</span> Показать все</div>
                <div class="ctx-item" data-action="autoFitCol"><span class="ctx-icon">${CTX_ICONS.autofit}</span> Автоширина</div>
                <div class="ctx-item danger" data-action="delCol"><span class="ctx-icon">${CTX_ICONS.del}</span> Удалить колонку</div>`;
        case 'colCurrency':
            return `
                <div class="ctx-item" data-action="colCurUSD"><span class="ctx-icon">${CTX_ICONS.usd}</span> Конвертировать в USD</div>
                <div class="ctx-item" data-action="colCurEUR"><span class="ctx-icon">${CTX_ICONS.eur}</span> Конвертировать в EUR</div>
                <div class="ctx-item" data-action="colCurRUB"><span class="ctx-icon">${CTX_ICONS.rub}</span> Конвертировать в RUB</div>
                <div class="ctx-item" data-action="colCurXAU"><span class="ctx-icon">${CTX_ICONS.gold}</span> Конвертировать в XAU (золото)</div>
                <div class="ctx-item" data-action="colCurBTC"><span class="ctx-icon">${CTX_ICONS.btc}</span> Конвертировать в BTC</div>
                <div class="ctx-div"></div>
                <div class="ctx-item" data-action="colCurSet"><span class="ctx-icon">${CTX_ICONS.currency}</span> Только пометить (без конвертации)…</div>
                <div class="ctx-item" data-action="colCurClear"><span class="ctx-icon">${CTX_ICONS.clear}</span> Убрать метку валюты</div>`;
        case 'sort':
            return `
                <div class="ctx-item" data-action="sortAsc"><span class="ctx-icon">${CTX_ICONS.sort}</span> По возрастанию (A→Я)</div>
                <div class="ctx-item" data-action="sortDesc"><span class="ctx-icon">${CTX_ICONS.sort}</span> По убыванию (Я→A)</div>`;
        case 'textColor':
        case 'bgColor':
            return `<div class="ctx-palette" data-palette="${subName}"></div>`;
    }
    return '';
}

function positionSubmenu(sub, parentItem) {
    sub.style.visibility = 'hidden';
    sub.style.left = '0px'; sub.style.top = '0px';
    const sRect = sub.getBoundingClientRect();
    const pRect = parentItem.getBoundingClientRect();
    const pad = 8;
    let left = pRect.right + 4;
    let top = pRect.top;
    if (left + sRect.width > window.innerWidth - pad) left = pRect.left - sRect.width - 4;
    if (top + sRect.height > window.innerHeight - pad) top = window.innerHeight - sRect.height - pad;
    if (top < pad) top = pad;
    if (left < pad) left = pad;
    sub.style.left = left + 'px'; sub.style.top = top + 'px';
    sub.style.visibility = 'visible';
}

function attachSubmenuEvents(sub, ctx, level) {
    sub.querySelectorAll('.ctx-item.has-sub').forEach(item => {
        item.addEventListener('mouseenter', () => { openSubmenuFor(item, item.dataset.sub, ctx, level + 1); });
    });
    sub.querySelectorAll('.ctx-item:not(.has-sub)').forEach(item => {
        item.addEventListener('mouseenter', () => { closeSubmenusFromLevel(level + 1); });
    });
}

function openSubmenuFor(parentItem, subName, ctx, level) {
    closeSubmenusFromLevel(level);
    parentItem.classList.add('open');
    const html = buildSubmenuHTML(subName, ctx);
    if (!html) return;
    const sub = document.createElement('div');
    sub.className = 'ctx-submenu show';
    sub.dataset.level = level;
    sub.innerHTML = html;
    document.body.appendChild(sub);
    openSubmenus.push({ el: sub, level, parentEl: parentItem });

    if (subName === 'textColor' || subName === 'bgColor') {
        const pal = sub.querySelector('.ctx-palette');
        pal.innerHTML = COLOR_PALETTE.map(c => c === null
            ? `<div class="color-swatch none" data-color=""></div>`
            : `<div class="color-swatch" style="background:${c}" data-color="${c}"></div>`).join('');
    }

    positionSubmenu(sub, parentItem);
    sub.onclick = handleCtxClick;
    attachSubmenuEvents(sub, ctx, level);
}

function showCtx(x, y) {
    hideCtx();
    const cm = Q('#ctxMenu');
    const ctx = window._ctxD || {};
    cm.innerHTML = buildCtxHTML(ctx);
    cm.style.display = 'block';
    cm.style.visibility = 'hidden';
    cm.style.left = '0px'; cm.style.top = '0px';
    const rect = cm.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    const pad = 8;
    let left = x, top = y;
    if (top + h > window.innerHeight - pad) top = window.innerHeight - h - pad;
    if (left + w > window.innerWidth - pad) left = window.innerWidth - w - pad;
    if (top < pad) top = pad;
    if (left < pad) left = pad;
    cm.style.left = left + 'px'; cm.style.top = top + 'px';
    cm.style.visibility = 'visible';

    cm.onclick = handleCtxClick;
    cm.querySelectorAll('.ctx-item.has-sub').forEach(item => {
        item.addEventListener('mouseenter', () => { openSubmenuFor(item, item.dataset.sub, ctx, 1); });
    });
    cm.querySelectorAll('.ctx-item:not(.has-sub)').forEach(item => {
        item.addEventListener('mouseenter', () => { closeSubmenusFromLevel(1); });
    });
}

function handleCtxClick(e) {
    const item = e.target.closest('.ctx-item');
    const swatch = e.target.closest('.color-swatch');
    if (swatch && e.target.closest('.ctx-palette')) {
        e.stopPropagation();
        const pal = swatch.closest('.ctx-palette');
        const isText = pal.dataset.palette === 'textColor';
        const color = swatch.dataset.color || null;
        if (isText) setCellColor('color', color); else setCellColor('bg', color);
        hideCtx(); return;
    }
    if (!item) return;
    if (item.classList.contains('has-sub')) return;
    const action = item.dataset.action;
    hideCtx();
    const td = active();
    const ctx = window._ctxD || {};
    if (!td && action !== 'paste') return;
    if (td) setAct(td.id);
    execCtxAction(action, td, ctx);
}

function execCtxAction(action, td, ctx) {
    switch (action) {
        case 'addRowAbove': if (td && ctx.ri != null) insRowAbove(td, ctx.ri); break;
        case 'addRowBelow': if (td && ctx.ri != null) insRowBelow(td, ctx.ri); break;
        case 'addSection': if (td) addSectionRow(td, ctx.ri != null ? ctx.ri : undefined); break;
        case 'addDividerBefore': addDivider({ position: 'before', refTd: td }); break;
        case 'addDividerAfter': addDivider({ position: 'after', refTd: td }); break;
        case 'dupRow': if (td && ctx.ri != null) dupRow(td, ctx.ri); break;
        case 'delRow': if (td && ctx.ri != null) delRow(td, ctx.ri); break;

        case 'mergeCells':
            if (!td) break;
            if (cellSel.tid === td.id && cellSel.r1 >= 0) mergeRect(td, cellSel.r1, cellSel.c1, cellSel.r2, cellSel.c2);
            else if (ctx.ri != null && ctx.ci != null && ctx.ri < td.rows.length - 1) mergeRect(td, ctx.ri, ctx.ci, ctx.ri + 1, ctx.ci);
            break;
        case 'unmergeCells': if (td && ctx.ri != null && ctx.ci != null) unmergeAt(td, ctx.ri, ctx.ci); break;

        case 'bold': toggleStyle('bold'); break;
        case 'italic': toggleStyle('italic'); break;
        case 'underline': toggleStyle('underline'); break;
        case 'strike': toggleStyle('strike'); break;
        case 'alignLeft': setAlign('left'); break;
        case 'alignCenter': setAlign('center'); break;
        case 'alignRight': setAlign('right'); break;
        case 'formatPainter': startFormatPainter(); break;
        case 'clearFormat': clearFormat(); break;

        case 'addNote': {
            if (!td || ctx.ri == null || ctx.ci == null) break;
            const key = ctx.ri + ':' + ctx.ci;
            const existing = (td.notes && td.notes[key]) || '';
            openPrompt('Заметка к ячейке:', existing, (v) => {
                if (!td.notes) td.notes = {};
                if (v.trim()) td.notes[key] = v.trim(); else delete td.notes[key];
                render(td); saveSession();
            });
            break;
        }

        // === Currency per column ===
        case 'colCurUSD': if (td && ctx.ci != null) convertColumn(td, ctx.ci, 'USD'); break;
        case 'colCurEUR': if (td && ctx.ci != null) convertColumn(td, ctx.ci, 'EUR'); break;
        case 'colCurRUB': if (td && ctx.ci != null) convertColumn(td, ctx.ci, 'RUB'); break;
        case 'colCurXAU': if (td && ctx.ci != null) convertColumn(td, ctx.ci, 'XAU'); break;
        case 'colCurBTC': if (td && ctx.ci != null) convertColumn(td, ctx.ci, 'BTC'); break;
        case 'colCurSet': {
            if (!td || ctx.ci == null) break;
            const cur = getColCurrency(td, ctx.ci);
            openPrompt('Метка валюты (USD, EUR, RUB, XAU, BTC, OIL):', cur || '', (v) => {
                const val = String(v).trim().toUpperCase();
                if (!val) setColCurrency(td, ctx.ci, null);
                else setColCurrency(td, ctx.ci, val);
            });
            break;
        }
        case 'colCurClear': if (td && ctx.ci != null) setColCurrency(td, ctx.ci, null); break;

        case 'renameCol': if (td && ctx.ci != null) renameCol(td, ctx.ci); break;
        case 'addColBefore': if (td && ctx.ci != null) insCol(td, ctx.ci); break;
        case 'addColAfter': if (td && ctx.ci != null) insCol(td, ctx.ci + 1); break;
        case 'dupCol': if (td && ctx.ci != null) dupCol(td, ctx.ci); break;
        case 'hideCol': if (td && ctx.ci != null) toggleHideCol(td, ctx.ci); break;
        case 'showAllCols': showAllCols(); break;
        case 'autoFitCol': if (td && ctx.ci != null) autoFitColumn(td, ctx.ci); break;
        case 'delCol': if (td && ctx.ci != null) delCol(td, ctx.ci); break;

        case 'sortAsc': if (td && ctx.ci != null) sortByColumn(td, ctx.ci, 'asc'); break;
        case 'sortDesc': if (td && ctx.ci != null) sortByColumn(td, ctx.ci, 'desc'); break;

        case 'markup':
            openPrompt('Наценка в %:', '10', (v) => { const p = parseFloat(String(v).replace(',', '.')); if (!isNaN(p) && p !== 0) applyMarkupToSelection(p); });
            break;
        case 'discount':
            openPrompt('Скидка в %:', '5', (v) => { const p = parseFloat(String(v).replace(',', '.')); if (!isNaN(p) && p !== 0) applyDiscountToSelection(p); });
            break;

        // === Copy with formatting ===
        case 'copyRowFmt': if (td && ctx.ri != null) copyRowWithFormat(td, ctx.ri); break;
        case 'copyFmt': {
            if (!td) break;
            const sel = selectedRows[td.id];
            if (cellSel.tid === td.id && cellSel.r1 >= 0) copyCellsWithFormat(td);
            else if (sel && sel.size) copySelectedRowsWithFormat(td);
            else copyTableWithFormat(td);
            break;
        }
        case 'copyTableFmt': if (td) copyTableWithFormat(td); break;
        case 'paste': paste(); break;

        case 'dupTable': if (td) dupTable(td); break;
        case 'delTable':
            if (td) {
                if (getTables(activeWorkspace).length <= 1) { toast('Нужна хотя бы одна', 'warning'); break; }
                openConfirm('Удалить таблицу?', 'Без восстановления.', () => {
                    const ws = workspaces[activeWorkspace];
                    const idx = ws.indexOf(td); if (idx >= 0) ws.splice(idx, 1);
                    if (actId === td.id) actId = null;
                    renderWorkspace(activeWorkspace);
                    toast('Удалена', 'info'); saveSession();
                });
            }
            break;
    }
}

document.addEventListener('click', e => {
    const cm = Q('#ctxMenu');
    if (!cm) return;
    if (!cm.contains(e.target) && !openSubmenus.some(s => s.el.contains(e.target))) hideCtx();
});

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

// ========== SEARCH ==========
function openSearch() { const bar = Q('#searchBar'); bar.classList.add('show'); setTimeout(() => Q('#searchInput').focus(), 100); }
function closeSearch() {
    Q('#searchBar').classList.remove('show');
    lastSearch = { query: '', matches: [], idx: 0 };
    document.querySelectorAll('.search-hit, .search-active').forEach(el => el.classList.remove('search-hit', 'search-active'));
    if (Q('#searchCount')) Q('#searchCount').textContent = '0/0';
}
function doSearch() {
    const td = active(); if (!td) return;
    const query = Q('#searchInput').value.trim();
    document.querySelectorAll('.search-hit, .search-active').forEach(el => el.classList.remove('search-hit', 'search-active'));
    if (!query) { lastSearch = { query: '', matches: [], idx: 0 }; Q('#searchCount').textContent = '0/0'; return; }
    const matches = [];
    td.rows.forEach((row, ri) => { row.forEach((v, ci2) => { if (String(v ?? '').toLowerCase().includes(query.toLowerCase())) matches.push({ ri, ci: ci2 }); }); });
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

// ========== FR ==========
let frMatches = [], frIdx = 0;
function openFR() { Q('#frModal').classList.add('show'); Q('#frInfo').textContent = ''; frMatches = []; frIdx = 0; setTimeout(() => Q('#frFind').focus(), 100); }
function closeFR() { Q('#frModal').classList.remove('show'); }
function frDoSearch() {
    const td = active(); if (!td) return;
    const q = Q('#frFind').value;
    if (!q) { frMatches = []; Q('#frInfo').textContent = ''; return; }
    const caseSens = Q('#frCase').checked, whole = Q('#frWhole').checked;
    frMatches = [];
    td.rows.forEach((row, ri) => row.forEach((v, ci2) => {
        const s = String(v ?? '');
        const hay = caseSens ? s : s.toLowerCase();
        const needle = caseSens ? q : q.toLowerCase();
        const idx = hay.indexOf(needle);
        if (idx >= 0) {
            if (whole) {
                const before = idx === 0 || /\W/.test(hay[idx - 1]);
                const after = idx + needle.length === hay.length || /\W/.test(hay[idx + needle.length]);
                if (!before || !after) return;
            }
            frMatches.push({ ri, ci: ci2 });
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
    const tr = td.el.querySelector(`tbody tr[data-ri="${m.ri}"]`); if (!tr) return;
    const cell = tr.querySelector(`.cell[data-c="${m.ci}"]`);
    if (cell) { cell.parentElement.classList.add('search-hit'); cell.focus(); cell.parentElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    Q('#frInfo').textContent = `Найдено: ${frMatches.length} (${i + 1}/${frMatches.length})`;
}
function frFindNext() { if (!frMatches.length) return; frIdx = (frIdx + 1) % frMatches.length; frHighlight(frIdx); }
function frReplaceOne() {
    const td = active(); if (!td || !frMatches.length) return;
    const m = frMatches[frIdx];
    const q = Q('#frFind').value, r = Q('#frReplace').value;
    const caseSens = Q('#frCase').checked;
    const s = String(td.rows[m.ri][m.ci] ?? '');
    const newS = caseSens ? s.replace(q, r) : s.replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), r);
    td.rows[m.ri][m.ci] = newS;
    render(td); frDoSearch(); saveSession();
}
function frReplaceAll() {
    const td = active(); if (!td) return;
    const q = Q('#frFind').value, r = Q('#frReplace').value;
    if (!q) return;
    const caseSens = Q('#frCase').checked;
    let count = 0;
    td.rows.forEach((row, ri) => row.forEach((v, ci2) => {
        const s = String(v ?? ''); if (!s) return;
        const newS = caseSens ? s.split(q).join(r) : s.replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), r);
        if (newS !== s) { td.rows[ri][ci2] = newS; count++; }
    }));
    if (count) { render(td); toast(`Заменено: ${count}`, 'success'); saveSession(); }
    else toast('Ничего не найдено', 'warning');
    frDoSearch();
}

// ========== TEMPLATES ==========
function loadTemplates() { try { const raw = localStorage.getItem('ontek_templates'); if (raw) templates = JSON.parse(raw); } catch (e) {} }
function saveTemplates() { localStorage.setItem('ontek_templates', JSON.stringify(templates)); }
function openTemplates() { Q('#tplModal').classList.add('show'); renderTemplates(); }
function closeTemplates() { Q('#tplModal').classList.remove('show'); }
function renderTemplates() {
    const el = Q('#tplList');
    if (!templates.length) { el.innerHTML = '<div style="color:var(--text-secondary);text-align:center;padding:20px 0;font-size:13px">Нет сохранённых шаблонов</div>'; return; }
    el.innerHTML = templates.map((t, i) => `
        <div class="tpl-item">
            <div><div class="tpl-item-name">${escapeHtml(t.name)}</div><div class="tpl-item-cols">${escapeHtml(t.cols.join(', '))}</div></div>
            <div class="tpl-item-btns"><button class="tpl-item-btn" data-idx="${i}" data-act="apply">Применить</button><button class="tpl-item-btn danger" data-idx="${i}" data-act="del">Удалить</button></div>
        </div>`).join('');
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
    td.merges = []; td.styles = {}; td.rowTypes = {}; td.formulas = {}; td.colCurrencies = {};
    render(td); closeTemplates();
    toast('Шаблон применён: ' + tpl.name, 'success'); saveSession();
}

// ========== THEMES ==========
function renderThemeOptions(containerId) {
    const c = document.getElementById(containerId); if (!c) return;
    c.innerHTML = COLOR_THEMES.map(t => `
        <div class="theme-card ${t.id === colorTheme ? 'active' : ''}" data-theme="${t.id}">
            <div class="theme-preview" style="background:${t.gradient}">${t.letter}</div>
            <div class="theme-name">${t.name}</div>
            <div class="theme-desc">${t.desc}</div>
        </div>`).join('');
    c.querySelectorAll('.theme-card').forEach(cd => cd.onclick = () => setColorTheme(cd.dataset.theme));
}
function renderExportThemes(containerId) {
    const c = document.getElementById(containerId); if (!c) return;
    c.innerHTML = Object.entries(EXPORT_THEMES).map(([k, t]) => `
        <div class="export-theme ${k === exportTheme ? 'active' : ''}" data-theme="${k}">
            <div class="export-theme-preview" style="background:${t.preview}">${t.name[0]}</div>
            <div class="export-theme-name">${t.name}</div>
        </div>`).join('');
    c.querySelectorAll('.export-theme').forEach(el => el.onclick = () => setExportTheme(el.dataset.theme));
}
function toggleSection(id) {
    const t = document.querySelector(`[data-toggle="${id}"]`);
    const b = document.getElementById(id);
    if (!t || !b) return;
    t.classList.toggle('open'); b.classList.toggle('open');
}

// ========== HOTKEYS LIST ==========
function renderHotkeyList() {
    const c = Q('#hotkeyList'); if (!c) return;
    c.innerHTML = Object.keys(DEFAULT_HOTKEYS).map(k => {
        const key = hotkeys[k] || '';
        return `<div class="hotkey-row"><span class="hotkey-label">${escapeHtml(KEY_LABELS[k] || k)}</span><span class="hotkey-key" data-hk="${k}">${key ? 'Shift+' + hkDisplay(key) : '—'}</span></div>`;
    }).join('');
    c.querySelectorAll('.hotkey-key').forEach(el => el.onclick = () => startRecording(el));
}
function startRecording(el) {
    if (recordingKey) recordingKey.classList.remove('recording');
    recordingKey = el; recordingHk = el.dataset.hk;
    el.classList.add('recording'); el.textContent = '...';
    const handler = e => {
        e.preventDefault(); e.stopPropagation();
        let key = e.key.toUpperCase();
        if (key === 'DELETE' || key === 'DEL') key = 'DELETE';
        if (key === 'CONTROL' || key === 'SHIFT' || key === 'ALT') return;
        const conflict = (() => { for (const [k, v] of Object.entries(hotkeys)) { if (k !== recordingHk && v === key) return k; } return null; })();
        if (conflict) {
            if (!confirm(`Клавиша Shift+${hkDisplay(key)} уже на «${KEY_LABELS[conflict]}». Переназначить?`)) {
                el.textContent = hotkeys[recordingHk] ? 'Shift+' + hkDisplay(hotkeys[recordingHk]) : '—';
                el.classList.remove('recording'); recordingKey = null; recordingHk = null;
                document.removeEventListener('keydown', handler); return;
            }
            hotkeys[conflict] = '';
        }
        hotkeys[recordingHk] = key;
        el.textContent = 'Shift+' + hkDisplay(key);
        el.classList.remove('recording');
        const label = KEY_LABELS[recordingHk];
        recordingKey = null; recordingHk = null;
        saveNow(); updateAllHKDisplays(); renderHotkeyList();
        document.removeEventListener('keydown', handler);
        toast(`«${label}» → Shift+${hkDisplay(key)}`, 'success');
    };
    document.addEventListener('keydown', handler);
}

// ========== TOOLBAR ACTIONS ==========
function handleToolbarCmd(cmd) {
    const td = active();
    switch (cmd) {
        case 'addSection': if (td) addSectionRow(td); else toast('Выберите таблицу', 'warning'); break;
        case 'addDivider': addDivider({ position: 'auto' }); break;
        case 'addRow': if (td) addRowEnd(td); else toast('Выберите таблицу', 'warning'); break;
        case 'delRow': if (td) delRowEnd(td); else toast('Выберите таблицу', 'warning'); break;
        case 'bold': toggleStyle('bold'); break;
        case 'italic': toggleStyle('italic'); break;
        case 'underline': toggleStyle('underline'); break;
        case 'strike': toggleStyle('strike'); break;
        case 'alignLeft': setAlign('left'); break;
        case 'alignCenter': setAlign('center'); break;
        case 'alignRight': setAlign('right'); break;
        case 'formatPainter': startFormatPainter(); break;
        case 'merge':
            if (td && cellSel.tid === td.id && cellSel.r1 >= 0) mergeRect(td, cellSel.r1, cellSel.c1, cellSel.r2, cellSel.c2);
            else toast('Выделите диапазон ячеек', 'warning');
            break;
        case 'unmerge':
            if (td && cellSel.r1 >= 0) unmergeAt(td, cellSel.anchorR, cellSel.anchorC);
            else toast('Кликните на объединённую ячейку', 'warning');
            break;
        case 'markup':
            openPrompt('Наценка в %:', '10', (v) => { const p = parseFloat(String(v).replace(',', '.')); if (!isNaN(p) && p !== 0) applyMarkupToSelection(p); });
            break;
        case 'discount':
            openPrompt('Скидка в %:', '5', (v) => { const p = parseFloat(String(v).replace(',', '.')); if (!isNaN(p) && p !== 0) applyDiscountToSelection(p); });
            break;
        case 'clearFormat': clearFormat(); break;
        case 'autofit': if (td && cellSel.r1 >= 0) autoFitColumn(td, cellSel.c1); else toast('Выделите ячейку', 'warning'); break;
        case 'showAllCols': showAllCols(); break;
    }
}
