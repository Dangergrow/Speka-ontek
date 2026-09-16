// ==================== ONTEK v7.0.0 — UI ====================
// Сайдбар, тулбар, контекстное меню, модалки, поиск, темы, шаблоны

// ========== SIDEBAR ==========
function buildSidebarV2() {
    const sb = Q('#sidebarContent'); if (!sb) return;
    const sections = [
        { t: 'Таблица', buttons: [
            { id: 'btnAddRow',  icon: ICONS.plus,     label: 'Добавить строку',  hk: 'addRow' },
            { id: 'btnAddSection', icon: ICONS.section, label: 'Строка-заголовок', hk: null },
            { id: 'btnAddDivider', icon: ICONS.divider, label: 'Разделитель', hk: null },
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
            { id: 'btnReplace', icon: ICONS.replace, label: 'Заменить',       hk: null },
            { id: 'btnTemplates', icon: ICONS.templates, label: 'Шаблоны',    hk: null }
        ]},
        { t: 'Создать', buttons: [
            { id: 'btnNewRUB', icon: ICONS.ruble,  label: 'Новая RUB', hk: 'newRUB' },
            { id: 'btnNewUSD', icon: ICONS.dollar, label: 'Новая USD', hk: 'newUSD' }
        ]},
        { t: 'Файл', buttons: [
            { id: 'btnLoad',     icon: ICONS.folder, label: 'Открыть',         hk: 'load' },
            { id: 'btnSave',     icon: ICONS.save,   label: 'Сохранить Excel', hk: 'save' },
            { id: 'btnExportCSV', icon: ICONS.csv,   label: 'Экспорт CSV',     hk: null },
            { id: 'btnPrint',    icon: ICONS.print,  label: 'Печать',          hk: null },
            { id: 'btnClear',    icon: ICONS.trash,  label: 'Очистить',        hk: 'clear' },
            { id: 'btnUndo',     icon: ICONS.undo,   label: 'Отменить',        hk: 'undo' }
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
    const tabs = Q('#workspaceTabs');
    const container = Q('#workspaceContainer');
    tabs.innerHTML = '';
    container.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        tabs.innerHTML += `<button class="workspace-tab ${i === activeWorkspace ? 'active' : ''}" data-ws="${i}">Окно ${i}</button>`;
        container.innerHTML += `<div class="workspace-panel ${i === activeWorkspace ? 'active' : ''}" data-ws="${i}"><div class="tables-area" id="workspaceArea_${i}"></div></div>`;
    }
    tabs.querySelectorAll('.workspace-tab').forEach(t => { t.onclick = () => switchWorkspace(+t.dataset.ws); });
    container.querySelectorAll('.tables-area').forEach(area => {
        area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
        area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
        area.addEventListener('drop', e => {
            e.preventDefault();
            area.classList.remove('drag-over');
            const f = e.dataTransfer.files[0];
            if (f) loadFile(f);
        });
    });
    upEmpty();
}

// ========== CONTEXT MENU (многоуровневое) ==========
let openSubmenus = [];

function hideCtx() {
    const cm = Q('#ctxMenu');
    if (cm) { cm.style.display = 'none'; cm.innerHTML = ''; }
    openSubmenus.forEach(el => el.remove());
    openSubmenus = [];
}

function buildCtxHTML(ctx) {
    const hasTd = !!active();
    const isCell = ctx && ctx.ri != null && ctx.ci != null;
    const isHeader = ctx && ctx.ci != null && ctx.ri == null;
    const items = [];

    // Верхний уровень
    items.push(`<div class="ctx-item" data-action="addRowAbove"><span class="ctx-icon">↥</span> Строку выше</div>`);
    items.push(`<div class="ctx-item" data-action="addRowBelow"><span class="ctx-icon">↧</span> Строку ниже</div>`);
    items.push(`<div class="ctx-item" data-action="addSection"><span class="ctx-icon">§</span> Строка-заголовок</div>`);
    items.push(`<div class="ctx-item" data-action="dupRow"><span class="ctx-icon">⊕</span> Дублировать строку</div>`);
    items.push(`<div class="ctx-item danger" data-action="delRow"><span class="ctx-icon">✕</span> Удалить строку</div>`);
    items.push(`<div class="ctx-div"></div>`);

    // Вставить ▶
    items.push(`<div class="ctx-item has-sub" data-sub="insert"><span class="ctx-icon">↳</span> Вставить <span class="ctx-shortcut">▶</span></div>`);
    // Формат ▶
    items.push(`<div class="ctx-item has-sub" data-sub="format"><span class="ctx-icon">🎨</span> Формат <span class="ctx-shortcut">▶</span></div>`);
    // Выравнивание ▶
    items.push(`<div class="ctx-item has-sub" data-sub="align"><span class="ctx-icon">≡</span> Выравнивание <span class="ctx-shortcut">▶</span></div>`);
    // Ячейки ▶
    items.push(`<div class="ctx-item has-sub" data-sub="cells"><span class="ctx-icon">⊞</span> Ячейки <span class="ctx-shortcut">▶</span></div>`);
    // Колонка ▶
    if (isHeader || isCell) {
        items.push(`<div class="ctx-item has-sub" data-sub="col"><span class="ctx-icon">▤</span> Колонка <span class="ctx-shortcut">▶</span></div>`);
    }
    // Сортировка ▶
    if (isHeader) {
        items.push(`<div class="ctx-item has-sub" data-sub="sort"><span class="ctx-icon">⇅</span> Сортировка <span class="ctx-shortcut">▶</span></div>`);
    }
    items.push(`<div class="ctx-div"></div>`);

    items.push(`<div class="ctx-item" data-action="copyCells"><span class="ctx-icon">⧉</span> Копировать <span class="ctx-shortcut">Ctrl+C</span></div>`);
    items.push(`<div class="ctx-item" data-action="paste"><span class="ctx-icon">📋</span> Вставить <span class="ctx-shortcut">Ctrl+V</span></div>`);
    items.push(`<div class="ctx-div"></div>`);

    items.push(`<div class="ctx-item" data-action="dupTable"><span class="ctx-icon">⎘</span> Дублировать таблицу</div>`);
    items.push(`<div class="ctx-item danger" data-action="delTable"><span class="ctx-icon">🗑</span> Удалить таблицу</div>`);

    return items.join('');
}

function buildSubmenuHTML(subName, ctx) {
    const hasTd = !!active();
    const isCell = ctx && ctx.ri != null && ctx.ci != null;
    const isHeader = ctx && ctx.ci != null && ctx.ri == null;

    switch (subName) {
        case 'insert':
            return `
                <div class="ctx-item" data-action="addDividerBefore"><span class="ctx-icon">⊟</span> Разделитель перед таблицей</div>
                <div class="ctx-item" data-action="addDividerAfter"><span class="ctx-icon">⊞</span> Разделитель после таблицы</div>
                <div class="ctx-div"></div>
                <div class="ctx-item" data-action="addColBefore"><span class="ctx-icon">↤</span> Колонку перед</div>
                <div class="ctx-item" data-action="addColAfter"><span class="ctx-icon">↦</span> Колонку после</div>
                <div class="ctx-div"></div>
                <div class="ctx-item" data-action="addRowAbove"><span class="ctx-icon">↥</span> Строку выше</div>
                <div class="ctx-item" data-action="addRowBelow"><span class="ctx-icon">↧</span> Строку ниже</div>
            `;
        case 'format':
            return `
                <div class="ctx-item" data-action="bold"><span class="ctx-icon">B</span> Жирный <span class="ctx-shortcut">Ctrl+B</span></div>
                <div class="ctx-item" data-action="italic"><span class="ctx-icon">I</span> Курсив <span class="ctx-shortcut">Ctrl+I</span></div>
                <div class="ctx-item" data-action="underline"><span class="ctx-icon">U</span> Подчёркнутый <span class="ctx-shortcut">Ctrl+U</span></div>
                <div class="ctx-item" data-action="strike"><span class="ctx-icon">S</span> Зачёркнутый</div>
                <div class="ctx-div"></div>
                <div class="ctx-item" data-action="formatPainter"><span class="ctx-icon">🖌</span> Копировать формат</div>
                <div class="ctx-item" data-action="clearFormat"><span class="ctx-icon">⌫</span> Очистить формат</div>
                <div class="ctx-div"></div>
                <div class="ctx-item has-sub" data-sub="textColor"><span class="ctx-icon">A</span> Цвет текста <span class="ctx-shortcut">▶</span></div>
                <div class="ctx-item has-sub" data-sub="bgColor"><span class="ctx-icon">▨</span> Цвет фона <span class="ctx-shortcut">▶</span></div>
            `;
        case 'align':
            return `
                <div class="ctx-item" data-action="alignLeft"><span class="ctx-icon">⬅</span> По левому краю</div>
                <div class="ctx-item" data-action="alignCenter"><span class="ctx-icon">↔</span> По центру</div>
                <div class="ctx-item" data-action="alignRight"><span class="ctx-icon">➡</span> По правому краю</div>
            `;
        case 'cells':
            return `
                <div class="ctx-item" data-action="mergeCells"><span class="ctx-icon">⊞</span> Объединить ячейки</div>
                <div class="ctx-item" data-action="unmergeCells"><span class="ctx-icon">⊟</span> Разъединить ячейки</div>
                <div class="ctx-div"></div>
                <div class="ctx-item" data-action="addNote"><span class="ctx-icon">💬</span> Заметка к ячейке</div>
                <div class="ctx-item" data-action="setCurrency"><span class="ctx-icon">💱</span> Валюта колонки…</div>
            `;
        case 'col':
            return `
                <div class="ctx-item" data-action="renameCol"><span class="ctx-icon">✎</span> Переименовать</div>
                <div class="ctx-item" data-action="dupCol"><span class="ctx-icon">⊕</span> Дублировать</div>
                <div class="ctx-div"></div>
                <div class="ctx-item" data-action="markup"><span class="ctx-icon">+%</span> Наценка</div>
                <div class="ctx-item" data-action="discount"><span class="ctx-icon">−%</span> Скидка</div>
                <div class="ctx-div"></div>
                <div class="ctx-item" data-action="hideCol"><span class="ctx-icon">👁</span> Скрыть колонку</div>
                <div class="ctx-item" data-action="showAllCols"><span class="ctx-icon">👁</span> Показать все</div>
                <div class="ctx-item" data-action="autoFitCol"><span class="ctx-icon">⤢</span> Автоширина</div>
                <div class="ctx-item danger" data-action="delCol"><span class="ctx-icon">✕</span> Удалить колонку</div>
            `;
        case 'sort':
            return `
                <div class="ctx-item" data-action="sortAsc"><span class="ctx-icon">▲</span> По возрастанию (A→Я)</div>
                <div class="ctx-item" data-action="sortDesc"><span class="ctx-icon">▼</span> По убыванию (Я→A)</div>
            `;
        case 'textColor':
        case 'bgColor':
            return `<div class="ctx-palette" data-palette="${subName}"></div>`;
    }
    return '';
}

function showCtx(x, y) {
    hideCtx();
    const cm = Q('#ctxMenu');
    const ctx = window._ctxD || {};
    cm.innerHTML = buildCtxHTML(ctx);
    cm.style.display = 'block';
    cm.style.visibility = 'hidden';
    cm.style.left = '0px';
    cm.style.top = '0px';

    // Позиция
    const rect = cm.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    const pad = 8;
    let left = x, top = y;
    if (top + h > window.innerHeight - pad) top = window.innerHeight - h - pad;
    if (left + w > window.innerWidth - pad) left = window.innerWidth - w - pad;
    if (top < pad) top = pad;
    if (left < pad) left = pad;
    cm.style.left = left + 'px';
    cm.style.top = top + 'px';
    cm.style.visibility = 'visible';

    // Обработка кликов
    cm.onclick = handleCtxClick;

    // Обработка наведения на подменю
    cm.querySelectorAll('.ctx-item.has-sub').forEach(item => {
        item.addEventListener('mouseenter', () => {
            const subName = item.dataset.sub;
            closeAllSubmenus();
            showSubmenu(item, subName, ctx);
        });
    });
    cm.querySelectorAll('.ctx-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (!item.classList.contains('has-sub')) closeAllSubmenus();
        });
    });
}

function closeAllSubmenus() {
    openSubmenus.forEach(el => el.remove());
    openSubmenus = [];
    document.querySelectorAll('.ctx-item.has-sub.open').forEach(el => el.classList.remove('open'));
}

function showSubmenu(parentItem, subName, ctx) {
    closeAllSubmenus();
    parentItem.classList.add('open');
    const html = buildSubmenuHTML(subName, ctx);
    if (!html) return;
    const sub = document.createElement('div');
    sub.className = 'ctx-submenu show';
    sub.innerHTML = html;
    document.body.appendChild(sub);
    openSubmenus.push(sub);

    // Заполняем палитру если нужно
    if (subName === 'textColor' || subName === 'bgColor') {
        const pal = sub.querySelector('.ctx-palette');
        pal.innerHTML = COLOR_PALETTE.map(c =>
            c === null
                ? `<div class="color-swatch none" data-color=""></div>`
                : `<div class="color-swatch" style="background:${c}" data-color="${c}"></div>`
        ).join('');
    }

    // Позиция подменю
    const pRect = parentItem.getBoundingClientRect();
    sub.style.visibility = 'hidden';
    sub.style.left = '0px';
    sub.style.top = '0px';
    const sRect = sub.getBoundingClientRect();
    let left = pRect.right + 2;
    let top = pRect.top;
    const pad = 8;
    if (left + sRect.width > window.innerWidth - pad) {
        left = pRect.left - sRect.width - 2;
    }
    if (top + sRect.height > window.innerHeight - pad) {
        top = window.innerHeight - sRect.height - pad;
    }
    if (top < pad) top = pad;
    if (left < pad) left = pad;
    sub.style.left = left + 'px';
    sub.style.top = top + 'px';
    sub.style.visibility = 'visible';

    // Обработка кликов
    sub.onclick = handleCtxClick;

    // Наведение на вложенные подменю
    sub.querySelectorAll('.ctx-item.has-sub').forEach(item => {
        item.addEventListener('mouseenter', () => {
            const sn = item.dataset.sub;
            closeAllSubmenus();
            parentItem.classList.add('open');
            showSubmenu(item, sn, ctx);
        });
    });
}

function handleCtxClick(e) {
    const item = e.target.closest('.ctx-item');
    if (!item) return;
    const subItem = e.target.closest('.color-swatch');
    if (subItem && e.target.closest('.ctx-palette')) {
        e.stopPropagation();
        const isText = e.target.closest('[data-palette="textColor"]');
        const color = subItem.dataset.color || null;
        if (isText) setCellColor('color', color);
        else setCellColor('bg', color);
        hideCtx();
        return;
    }
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
                if (v.trim()) td.notes[key] = v.trim();
                else delete td.notes[key];
                render(td);
                saveSession();
            });
            break;
        }

        case 'setCurrency': {
            if (!td || ctx.ci == null) break;
            const cur = getColCurrency(td, ctx.ci);
            const options = ['USD','EUR','RUB','XAU','BTC','OIL','— (убрать)'];
            openPrompt(`Валюта колонки "${td.cols[ctx.ci]}" (${options.join(', ')}):`, cur || '', (v) => {
                const val = String(v).trim().toUpperCase();
                if (!val || val === '—' || val === 'NONE') setColCurrency(td, ctx.ci, null);
                else setColCurrency(td, ctx.ci, val);
            });
            break;
        }

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
            openPrompt('Наценка в %:', '10', (v) => {
                const p = parseFloat(String(v).replace(',', '.'));
                if (!isNaN(p) && p !== 0) applyMarkupToSelection(p);
            });
            break;
        case 'discount':
            openPrompt('Скидка в %:', '5', (v) => {
                const p = parseFloat(String(v).replace(',', '.'));
                if (!isNaN(p) && p !== 0) applyDiscountToSelection(p);
            });
            break;

        case 'copyCells': copySelectedCells(); break;
        case 'paste': paste(); break;
        case 'dupTable': if (td) dupTable(td); break;
        case 'delTable':
            if (td) {
                if (getTables(activeWorkspace).length <= 1) { toast('Нужна хотя бы одна таблица', 'warning'); break; }
                openConfirm('Удалить таблицу?', 'Без возможности восстановления.', () => {
                    const ws = workspaces[activeWorkspace];
                    const idx = ws.indexOf(td);
                    if (idx >= 0) ws.splice(idx, 1);
                    if (actId === td.id) actId = null;
                    renderWorkspace(activeWorkspace);
                    toast('Удалена', 'info');
                    saveSession();
                });
            }
            break;
    }
}

// Закрытие при клике вне
document.addEventListener('click', e => {
    const cm = Q('#ctxMenu');
    if (!cm) return;
    if (!cm.contains(e.target) && !openSubmenus.some(s => s.contains(e.target))) {
        hideCtx();
    }
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
function openSearch() {
    const bar = Q('#searchBar');
    bar.classList.add('show');
    setTimeout(() => Q('#searchInput').focus(), 100);
}
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
    td.rows.forEach((row, ri) => {
        row.forEach((v, ci2) => {
            if (String(v ?? '').toLowerCase().includes(query.toLowerCase())) matches.push({ ri, ci: ci2 });
        });
    });
    lastSearch = { query, matches, idx: 0 };
    Q('#searchCount').textContent = matches.length ? `1/${matches.length}` : '0/0';
    if (matches.length) highlightMatch(td, 0);
}
function highlightMatch(td, i) {
    document.querySelectorAll('.search-hit, .search-active').forEach(el => el.classList.remove('search-hit', 'search-active'));
    const m = lastSearch.matches[i]; if (!m) return;
    const tr = td.el.querySelector(`tbody tr[data-ri="${m.ri}"]`); if (!tr) return;
    const cell = tr.querySelector(`.cell[data-c="${m.ci}"]`);
    if (cell) {
        cell.parentElement.classList.add('search-hit');
        tr.classList.add('search-active');
        cell.focus();
        cell.parentElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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
    if (cell) {
        cell.parentElement.classList.add('search-hit');
        cell.focus();
        cell.parentElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    Q('#frInfo').textContent = `Найдено: ${frMatches.length} (${i + 1}/${frMatches.length})`;
}
function frFindNext() { if (!frMatches.length) return; frIdx = (frIdx + 1) % frMatches.length; frHighlight(frIdx); }
function frReplaceOne() {
    const td = active(); if (!td || !frMatches.length) return;
    const m = frMatches[frIdx];
    const q = Q('#frFind').value, r = Q('#frReplace').value;
    const caseSens = Q('#frCase').checked;
    const s = String(td.rows[m.ri][m.ci] ?? '');
    const newS = caseSens
        ? s.replace(q, r)
        : s.replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), r);
    td.rows[m.ri][m.ci] = newS;
    render(td);
    frDoSearch();
    saveSession();
}
function frReplaceAll() {
    const td = active(); if (!td) return;
    const q = Q('#frFind').value, r = Q('#frReplace').value;
    if (!q) return;
    const caseSens = Q('#frCase').checked;
    let count = 0;
    td.rows.forEach((row, ri) => row.forEach((v, ci2) => {
        const s = String(v ?? ''); if (!s) return;
        const newS = caseSens
            ? s.split(q).join(r)
            : s.replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), r);
        if (newS !== s) { td.rows[ri][ci2] = newS; count++; }
    }));
    if (count) { render(td); toast(`Заменено: ${count}`, 'success'); saveSession(); }
    else toast('Ничего не найдено', 'warning');
    frDoSearch();
}

// ========== TEMPLATES ==========
function loadTemplates() {
    try {
        const raw = localStorage.getItem('ontek_templates');
        if (raw) templates = JSON.parse(raw);
    } catch (e) {}
}
function saveTemplates() { localStorage.setItem('ontek_templates', JSON.stringify(templates)); }
function openTemplates() { Q('#tplModal').classList.add('show'); renderTemplates(); }
function closeTemplates() { Q('#tplModal').classList.remove('show'); }
function renderTemplates() {
    const el = Q('#tplList');
    if (!templates.length) {
        el.innerHTML = '<div style="color:var(--text-secondary);text-align:center;padding:20px 0;font-size:13px">Нет сохранённых шаблонов</div>';
        return;
    }
    el.innerHTML = templates.map((t, i) => `
        <div class="tpl-item">
            <div>
                <div class="tpl-item-name">${escapeHtml(t.name)}</div>
                <div class="tpl-item-cols">${escapeHtml(t.cols.join(', '))}</div>
            </div>
            <div class="tpl-item-btns">
                <button class="tpl-item-btn" data-idx="${i}" data-act="apply">Применить</button>
                <button class="tpl-item-btn danger" data-idx="${i}" data-act="del">Удалить</button>
            </div>
        </div>
    `).join('');
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
    td.rows = td.rows.map(r => {
        const nr = [...r];
        while (nr.length < td.cols.length) nr.push('');
        return nr.slice(0, td.cols.length);
    });
    if (td.rows.length === 0) td.rows.push(Array(td.cols.length).fill(''));
    td.merges = [];
    td.styles = {};
    td.rowTypes = {};
    td.formulas = {};
    render(td);
    closeTemplates();
    toast('Шаблон применён: ' + tpl.name, 'success');
    saveSession();
}

// ========== THEMES ==========
function renderThemeOptions(containerId) {
    const c = document.getElementById(containerId); if (!c) return;
    c.innerHTML = COLOR_THEMES.map(t => `
        <div class="theme-card ${t.id === colorTheme ? 'active' : ''}" data-theme="${t.id}">
            <div class="theme-preview" style="background:${t.gradient}">${t.letter}</div>
            <div class="theme-name">${t.name}</div>
            <div class="theme-desc">${t.desc}</div>
        </div>
    `).join('');
    c.querySelectorAll('.theme-card').forEach(cd => cd.onclick = () => setColorTheme(cd.dataset.theme));
}
function renderExportThemes(containerId) {
    const c = document.getElementById(containerId); if (!c) return;
    c.innerHTML = Object.entries(EXPORT_THEMES).map(([k, t]) => `
        <div class="export-theme ${k === exportTheme ? 'active' : ''}" data-theme="${k}">
            <div class="export-theme-preview" style="background:${t.preview}">${t.name[0]}</div>
            <div class="export-theme-name">${t.name}</div>
        </div>
    `).join('');
    c.querySelectorAll('.export-theme').forEach(el => el.onclick = () => setExportTheme(el.dataset.theme));
}
function toggleSection(id) {
    const t = document.querySelector(`[data-toggle="${id}"]`);
    const b = document.getElementById(id);
    if (!t || !b) return;
    t.classList.toggle('open');
    b.classList.toggle('open');
}

// ========== HOTKEYS LIST ==========
function renderHotkeyList() {
    const c = Q('#hotkeyList'); if (!c) return;
    c.innerHTML = Object.keys(DEFAULT_HOTKEYS).map(k => {
        const key = hotkeys[k] || '';
        return `<div class="hotkey-row">
            <span class="hotkey-label">${escapeHtml(KEY_LABELS[k] || k)}</span>
            <span class="hotkey-key" data-hk="${k}">${key ? 'Shift+' + hkDisplay(key) : '—'}</span>
        </div>`;
    }).join('');
    c.querySelectorAll('.hotkey-key').forEach(el => el.onclick = () => startRecording(el));
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
        const conflict = (() => {
            for (const [k, v] of Object.entries(hotkeys)) {
                if (k !== recordingHk && v === key) return k;
            }
            return null;
        })();
        if (conflict) {
            if (!confirm(`Клавиша Shift+${hkDisplay(key)} уже на «${KEY_LABELS[conflict]}». Переназначить?`)) {
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
            openPrompt('Наценка в %:', '10', (v) => {
                const p = parseFloat(String(v).replace(',', '.'));
                if (!isNaN(p) && p !== 0) applyMarkupToSelection(p);
            });
            break;
        case 'discount':
            openPrompt('Скидка в %:', '5', (v) => {
                const p = parseFloat(String(v).replace(',', '.'));
                if (!isNaN(p) && p !== 0) applyDiscountToSelection(p);
            });
            break;
        case 'clearFormat': clearFormat(); break;
        case 'autofit': if (td && cellSel.r1 >= 0) autoFitColumn(td, cellSel.c1); else toast('Выделите ячейку', 'warning'); break;
        case 'showAllCols': showAllCols(); break;
    }
}
