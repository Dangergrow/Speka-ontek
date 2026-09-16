// ==================== ONTEK v7.1.2 — TABLE ====================
// Таблицы, ячейки, строки/колонки, разделители, рендер

// ========== WORKSPACE ==========
function getTables(wsIdx) {
    return (workspaces[wsIdx] || []).filter(x => x.type === 'table');
}
function active() {
    const tables = getTables(activeWorkspace);
    if (actId === null && tables.length) actId = tables[0].id;
    return tables.find(t => t.id === actId) || null;
}
function setAct(id) {
    actId = id;
    document.querySelectorAll('.card').forEach(c => c.classList.toggle('active', +c.dataset.tid === actId));
    updateStatusBar();
}
function getArea() { return Q('#workspaceArea_' + activeWorkspace); }
function upEmpty() {
    const a = getArea(); if (!a) return;
    const e = a.querySelector('.empty-state');
    const hasItems = (workspaces[activeWorkspace] || []).length > 0;
    if (!hasItems && !e) {
        a.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-title">Нет таблиц</div><div class="empty-state-desc">Создайте новую — <span class="empty-state-kbd">Shift</span>+<span class="empty-state-kbd">1</span> RUB или <span class="empty-state-kbd">Shift</span>+<span class="empty-state-kbd">2</span> USD</div></div>`;
    } else if (hasItems && e) e.remove();
}

// ========== TABLE CRUD ==========
function addTable(cur = 'RUB') {
    const ws = workspaces[activeWorkspace];
    upEmpty(); idC++;
    const td = {
        type: 'table', id: idC,
        cols: [...DEFAULT_COLS],
        rows: [['', '', '', '', '']],
        currency: cur,
        el: null, card: null,
        merges: [], styles: {}, rowTypes: {}, notes: {}, formulas: {},
        colCurrencies: {}
    };
    ws.push(td);
    renderWorkspace(activeWorkspace);
    setAct(td.id);
    toast(`Таблица ${cur} создана`, 'success');
    saveSession();
}
function dupTable(src) {
    if (!src) src = active();
    if (!src) { toast('Выберите таблицу', 'warning'); return; }
    const ws = workspaces[activeWorkspace]; idC++;
    const td = {
        type: 'table', id: idC,
        cols: [...src.cols],
        rows: src.rows.map(r => [...r]),
        currency: src.currency,
        el: null, card: null,
        merges: src.merges ? src.merges.map(m => ({ ...m })) : [],
        styles: src.styles ? JSON.parse(JSON.stringify(src.styles)) : {},
        rowTypes: src.rowTypes ? { ...src.rowTypes } : {},
        notes: src.notes ? { ...src.notes } : {},
        formulas: src.formulas ? { ...src.formulas } : {},
        colCurrencies: src.colCurrencies ? { ...src.colCurrencies } : {}
    };
    ws.push(td);
    renderWorkspace(activeWorkspace);
    setAct(td.id);
    toast('Таблица дублирована', 'success');
    saveSession();
}

function buildCardHeader(td) {
    const hdr = document.createElement('div');
    hdr.className = 'card-hdr';
    const totals = getTotalsByCurrency(td);
    const totalStr = formatCurrencyTotals(totals);
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
                <span class="card-stat">Итого: <b class="stat-total">${totalStr}</b></span>
            </div>
        </div>
        <div class="card-hdr-right">
            <button class="card-btn copy-btn" title="Копировать таблицу с форматированием">📋</button>
            <button class="card-btn cur-btn" title="Конвертировать всю таблицу">${td.currency === 'USD' ? '💵 USD' : '💰 RUB'}</button>
            <button class="card-btn icon-only dup-btn" title="Дублировать">⎘</button>
            <button class="card-btn icon-only danger del-btn" title="Удалить">🗑</button>
        </div>
    `;
    hdr.querySelector('.copy-btn').onclick = e => { e.stopPropagation(); copyTableWithFormat(td); };
    hdr.querySelector('.cur-btn').onclick = e => { e.stopPropagation(); convertCurrency(td); };
    hdr.querySelector('.dup-btn').onclick = e => { e.stopPropagation(); dupTable(td); };
    hdr.querySelector('.del-btn').onclick = e => {
        e.stopPropagation();
        if (getTables(activeWorkspace).length <= 1) { toast('Нужна хотя бы одна таблица', 'warning'); return; }
        openConfirm('Удалить таблицу?', 'Без возможности восстановления.', () => {
            const ws = workspaces[activeWorkspace];
            const idx = ws.indexOf(td);
            if (idx >= 0) ws.splice(idx, 1);
            if (actId === td.id) actId = null;
            renderWorkspace(activeWorkspace);
            toast('Удалена', 'info');
            saveSession();
        });
    };
    return hdr;
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
        let ri = null, ci2 = null;
        if (thEl) {
            const ths = [...card.querySelectorAll('thead th:not(.row-num):not(.actions-col)')];
            ci2 = ths.indexOf(thEl);
            if (ci2 >= td.cols.length) ci2 = null;
        }
        if (trEl && !trEl.classList.contains('row-total')) {
            ri = +trEl.dataset.ri;
            const cellEl = e.target.closest('.cell');
            if (cellEl) { ri = +cellEl.dataset.r; ci2 = +cellEl.dataset.c; }
        }
        window._ctxD = { tid: td.id, ri, ci: ci2 };
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
    const sr = td.card.querySelector('.stat-rows');
    const st = td.card.querySelector('.stat-total');
    if (sr) sr.textContent = td.rows.length;
    if (st) st.textContent = formatCurrencyTotals(getTotalsByCurrency(td));
    updateStatusBar();
}

// ========== MERGES ==========
function findMergeContaining(td, ri, ci2) {
    if (!td.merges) return null;
    return td.merges.find(m => ri >= m.r1 && ri <= m.r2 && ci2 >= m.c1 && ci2 <= m.c2);
}
function isMergeCovered(td, ri, ci2) {
    const m = findMergeContaining(td, ri, ci2);
    if (!m) return false;
    return !(m.r1 === ri && m.c1 === ci2);
}
function mergeRect(td, r1, c1, r2, c2) {
    if (r1 > r2) [r1, r2] = [r2, r1];
    if (c1 > c2) [c1, c2] = [c2, c1];
    if (r1 === r2 && c1 === c2) { toast('Нужно выделить минимум 2 ячейки', 'warning'); return; }
    td.merges = (td.merges || []).filter(m => !(!(m.r2 < r1 || m.r1 > r2 || m.c2 < c1 || m.c1 > c2)));
    const val = td.rows[r1][c1];
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) {
        if (r === r1 && c === c1) continue;
        td.rows[r][c] = '';
    }
    td.rows[r1][c1] = val;
    td.merges.push({ r1, c1, r2, c2 });
    render(td);
    toast(`Объединено ${(r2 - r1 + 1) * (c2 - c1 + 1)} ячеек`, 'success');
}
function unmergeAt(td, ri, ci2) {
    const m = findMergeContaining(td, ri, ci2);
    if (!m) { toast('Не объединена', 'warning'); return; }
    td.merges = td.merges.filter(x => x !== m);
    render(td);
    toast('Разъединено', 'info');
}

// ========== CELL SELECTION ==========
function clearCellSelection() {
    cellSel = { tid: null, r1: -1, c1: -1, r2: -1, c2: -1, anchorR: -1, anchorC: -1, dragging: false };
    document.querySelectorAll('.cell.selected-cell, .cell.anchor-cell').forEach(c => c.classList.remove('selected-cell', 'anchor-cell'));
    updateStatusBar();
}
function selectCell(td, ri, ci2, shift) {
    if (shift && cellSel.tid === td.id && cellSel.anchorR >= 0) {
        cellSel.r1 = cellSel.anchorR; cellSel.c1 = cellSel.anchorC;
        cellSel.r2 = ri; cellSel.c2 = ci2;
    } else {
        cellSel.tid = td.id;
        cellSel.anchorR = ri; cellSel.anchorC = ci2;
        cellSel.r1 = ri; cellSel.c1 = ci2;
        cellSel.r2 = ri; cellSel.c2 = ci2;
    }
    updateCellSelectionUI(td);
    updateStatusBar();
}
function updateCellSelectionUI(td) {
    document.querySelectorAll('.cell.selected-cell, .cell.anchor-cell').forEach(c => c.classList.remove('selected-cell', 'anchor-cell'));
    if (!td || !cellSel.tid || cellSel.tid !== td.id || cellSel.r1 < 0) return;
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
    if (!td || !td.el) return;
    const thead = td.el.querySelector('thead');
    const tbody = td.el.querySelector('tbody');
    const sort = sortState[td.id];
    const hidden = hiddenCols[td.id] || new Set();

    let theadHtml = '<tr>';
    if (tableSettings.showRowNums) theadHtml += '<th class="row-num">№</th>';
    td.cols.forEach((col, i) => {
        if (hidden.has(i)) return;
        const w = colWidths[col];
        const styleW = w ? `style="width:${w}px;min-width:${w}px;max-width:${w}px"` : '';
        const sorted = sort && sort.col === i;
        const sortCls = sorted ? (sort.dir === 'asc' ? 'sorted-asc' : 'sorted-desc') : '';
        const sortIcon = sorted ? (sort.dir === 'asc' ? '▲' : '▼') : '⇅';
        const cur = getColCurrency(td, i);
        const curBadge = cur ? ` <span class="th-currency-badge">${cur}</span>` : '';
        theadHtml += `<th class="sortable ${sortCls}" data-col="${i}" ${styleW}>${escapeHtml(formatHeader(col, td.currency))}${curBadge}<span class="sort-indicator">${sortIcon}</span><span class="resize-handle" data-col="${i}"></span></th>`;
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
            const tdEl = document.createElement('td');
            const hiddenCount = [...hidden].filter(h => h >= 0 && h < td.cols.length).length;
            const colCount = (tableSettings.showRowNums ? 1 : 0) + td.cols.length - hiddenCount + 1;
            tdEl.colSpan = Math.max(1, colCount);
            tdEl.style.padding = '0';
            const cell = document.createElement('div');
            cell.className = 'cell section-cell';
            cell.contentEditable = 'true';
            cell.dataset.r = ri; cell.dataset.c = '0';
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
                if (e.shiftKey && lastSelectedRow !== null) {
                    const from = Math.min(lastSelectedRow, ri), to = Math.max(lastSelectedRow, ri);
                    for (let i = from; i <= to; i++) sel.add(i);
                } else if (e.ctrlKey) {
                    if (sel.has(ri)) sel.delete(ri); else sel.add(ri);
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

        row.forEach((v, colIdx) => {
            if (isMergeCovered(td, ri, colIdx)) return;
            if (hidden.has(colIdx)) return;
            const tdEl = document.createElement('td');
            const cell = document.createElement('div');
            const cn = (td.cols[colIdx] || '').toLowerCase();
            const isTotal = cn.startsWith('стоимость');
            const isNum = isNumericCol(cn);
            const mergeAt = findMergeContaining(td, ri, colIdx);
            cell.className = 'cell';
            cell.contentEditable = isTotal ? 'false' : 'true';
            cell.dataset.r = ri; cell.dataset.c = colIdx;
            if (isNum) cell.classList.add('num');
            if (isTotal) cell.classList.add('total');
            if (tableSettings.wrapText) cell.classList.add('wrap');
            const formulaKey = ri + ':' + colIdx;
            if (td.formulas && td.formulas[formulaKey]) cell.classList.add('has-formula');
            const w = colWidths[td.cols[colIdx]];
            if (w) { tdEl.style.width = w + 'px'; tdEl.style.minWidth = w + 'px'; tdEl.style.maxWidth = w + 'px'; }
            if (mergeAt && mergeAt.r1 === ri && mergeAt.c1 === colIdx) {
                let cs = 0;
                for (let cc = mergeAt.c1; cc <= mergeAt.c2; cc++) if (!hidden.has(cc)) cs++;
                tdEl.rowSpan = mergeAt.r2 - mergeAt.r1 + 1;
                tdEl.colSpan = Math.max(1, cs);
                tdEl.classList.add('merged-start');
            }
            const style = getCellStyle(td, ri, colIdx);
            applyStyleToCell(cell, style);
            const note = td.notes && td.notes[formulaKey];
            if (note) cell.classList.add('has-note');
            cell.textContent = v ?? '';

            cell.addEventListener('focus', () => { cell.dataset.old = cell.innerText; setAct(td.id); activeTbCell = { r: ri, c: colIdx }; updateTbFromCell(td, ri, colIdx); });
            cell.addEventListener('input', () => { let val = cell.innerText; if (val.endsWith('\n')) val = val.slice(0, -1); td.rows[ri][colIdx] = val; if (isNum && !isTotal && !isFormula(val)) updCalcRow(td, ri, true); });
            cell.addEventListener('blur', () => {
                let val = cell.innerText; if (val.endsWith('\n')) val = val.slice(0, -1);
                if (isFormula(val)) {
                    if (!td.formulas) td.formulas = {};
                    td.formulas[formulaKey] = val;
                    const result = evalFormula(td, val);
                    if (result !== null) { td.rows[ri][colIdx] = result; cell.textContent = result; }
                    else cell.textContent = val;
                    cell.classList.add('has-formula');
                } else {
                    if (td.formulas) delete td.formulas[formulaKey];
                    cell.classList.remove('has-formula');
                    if (isNum && !isTotal) {
                        const n = pn(val);
                        if (!isNaN(n)) { val = n.toFixed(2); td.rows[ri][colIdx] = val; cell.textContent = val; }
                        updCalcRow(td, ri, false);
                    } else td.rows[ri][colIdx] = val;
                }
                if (cell.dataset.old !== undefined && cell.dataset.old !== val) hist.push({ a: 'editCell', tid: td.id, d: { ri, ci: colIdx, old: cell.dataset.old, val: val } });
            });
            cell.addEventListener('dblclick', () => { if (td.formulas && td.formulas[formulaKey]) cell.textContent = td.formulas[formulaKey]; });
            cell.addEventListener('keydown', e => {
                if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); document.execCommand('insertLineBreak'); return; }
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (ri === rows.length - 1) addRowEnd(td); moveFocus(td, ri, colIdx, 0, 1); return; }
                if (e.key === 'Tab') { e.preventDefault(); moveFocus(td, ri, colIdx, e.shiftKey ? -1 : 1); return; }
                if (e.key === 'Escape') { if (paintBuffer) { stopFormatPainter(); toast('Формат отменён', 'info'); } else cell.blur(); return; }
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
                if (paintBuffer) { e.preventDefault(); applyFormatToCell(td, ri, colIdx); stopFormatPainter(); toast('Формат применён', 'success'); return; }
                if (e.shiftKey) { e.preventDefault(); selectCell(td, ri, colIdx, true); return; }
                cellSel.tid = td.id; cellSel.anchorR = ri; cellSel.anchorC = colIdx;
                cellSel.r1 = ri; cellSel.c1 = colIdx; cellSel.r2 = ri; cellSel.c2 = colIdx; cellSel.dragging = true;
                updateCellSelectionUI(td); updateStatusBar();
            });
            cell.addEventListener('mouseenter', () => {
                if (cellSel.dragging && cellSel.tid === td.id) { cellSel.r2 = ri; cellSel.c2 = colIdx; updateCellSelectionUI(td); updateStatusBar(); }
                if (paintBuffer) cell.classList.add('paint-hover'); else cell.classList.remove('paint-hover');
                const note = td.notes && td.notes[formulaKey];
                if (note) { const popup = Q('#notePopup'); const rect = cell.getBoundingClientRect(); popup.textContent = note; popup.style.left = Math.min(rect.left, window.innerWidth - 340) + 'px'; popup.style.top = (rect.bottom + 6) + 'px'; popup.classList.add('show'); }
            });
            cell.addEventListener('mouseleave', () => { const popup = Q('#notePopup'); if (popup) popup.classList.remove('show'); cell.classList.remove('paint-hover'); });
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

    // Total row — суммы только по колонкам "Стоимость" (и по совместимости — где реально нужно)
    if (tableSettings.showTotals && rows.length > 0) {
        const totTr = document.createElement('tr');
        totTr.className = 'row-total';
        let html = '';
        if (tableSettings.showRowNums) html += '<td class="row-num"></td>';
        const firstCostIdx = td.cols.findIndex(c => (c || '').toLowerCase().startsWith('стоимость'));
        const labelIdx = firstCostIdx > 0 ? firstCostIdx - 1 : td.cols.length - 2;
        td.cols.forEach((col, i) => {
            if (hidden.has(i)) return;
            const cn = (col || '').toLowerCase();
            const isCostCol = cn.startsWith('стоимость');
            const isQtyCol = cn.includes('ко-во') || cn.includes('количество');
            const isPriceCol = cn.startsWith('цена');

            if (isCostCol) {
                const cur = getColCurrency(td, i) || td.currency;
                html += `<td style="padding:0"><div class="cell total" style="padding:var(--cell-padding) 12px;font-weight:700">${sumCol(td, i).toFixed(2)} ${cur}</div></td>`;
            } else if (isQtyCol) {
                // НЕ суммируем количество — оставляем пустым
                html += '<td></td>';
            } else if (isPriceCol) {
                html += `<td style="padding:10px 12px;color:var(--text-tertiary);text-align:right">—</td>`;
            } else if (i === labelIdx) {
                html += '<td style="text-align:right;padding:10px 12px;font-weight:700">Итого</td>';
            } else {
                html += '<td></td>';
            }
        });
        html += '<td class="actions-col"></td>';
        totTr.innerHTML = html;
        tbody.appendChild(totTr);
    }

    updateCellSelectionUI(td);
    updateCardStats(td);
}

function updCalcRow(td, ri, skipRecalc) {
    if (!skipRecalc) {
        calc(td.rows[ri], td.cols, td);
        if (td.formulas) {
            for (const [key, formula] of Object.entries(td.formulas)) {
                const [r, c] = key.split(':').map(Number);
                if (r === ri) {
                    const result = evalFormula(td, formula);
                    if (result !== null) td.rows[r][c] = result;
                }
            }
        }
    }
    td.cols.forEach((col, ci2) => {
        const cn = (col || '').toLowerCase();
        if (cn.startsWith('стоимость') || cn.startsWith('цена') || cn.includes('ко-во') || cn.includes('количество')) {
            const cell = td.el.querySelector(`.cell[data-r="${ri}"][data-c="${ci2}"]`);
            if (cell && document.activeElement !== cell) cell.textContent = td.rows[ri][ci2] ?? '';
        }
    });
    const totTr = td.el.querySelector('tbody tr.row-total');
    if (totTr) {
        const cells = totTr.querySelectorAll('.cell.total');
        let idx = 0;
        td.cols.forEach((col, i) => {
            const cn = (col || '').toLowerCase();
            if (cn.startsWith('стоимость')) {
                const cur = getColCurrency(td, i) || td.currency;
                if (cells[idx]) cells[idx].textContent = `${sumCol(td, i).toFixed(2)} ${cur}`;
                idx++;
            }
        });
    }
    updateCardStats(td);
}

function moveFocus(td, ri, ci2, dc, dr = 0) {
    const hidden = hiddenCols[td.id] || new Set();
    let nr = ri + dr, nc = ci2 + dc;
    if (nc >= td.cols.length) { nc = 0; nr++; }
    if (nc < 0) { nc = td.cols.length - 1; nr--; }
    if (nr >= td.rows.length || nr < 0) return;
    let safety = 0;
    while ((isMergeCovered(td, nr, nc) || hidden.has(nc)) && safety < 100) {
        safety++;
        nc += dc >= 0 ? 1 : -1;
        if (nc >= td.cols.length) { nc = 0; nr++; if (nr >= td.rows.length) return; }
        if (nc < 0) { nc = td.cols.length - 1; nr--; if (nr < 0) return; }
    }
    const cell = td.el.querySelector(`.cell[data-r="${nr}"][data-c="${nc}"]`);
    if (cell) {
        cell.focus();
        const range = document.createRange();
        range.selectNodeContents(cell);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges(); sel.addRange(range);
    }
}

function updateTbFromCell(td, ri, ci2) {
    const st = getCellStyle(td, ri, ci2);
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
    forEachSelectedCell(td, (r, c) => setCellStyle(td, r, c, { [prop]: value || null }));
    render(td);
}

// ========== FORMAT PAINTER ==========
function startFormatPainter() {
    const td = active(); if (!td) { toast('Выберите таблицу', 'warning'); return; }
    if (cellSel.r1 < 0) { toast('Выделите ячейку-источник', 'warning'); return; }
    paintBuffer = JSON.parse(JSON.stringify(getCellStyle(td, cellSel.anchorR, cellSel.anchorC) || {}));
    document.body.classList.add('paint-mode');
    toast('Формат скопирован — выберите ячейку', 'info');
}
function applyFormatToCell(td, ri, ci2) {
    if (!paintBuffer) return;
    if (!td.styles) td.styles = {};
    const key = ri + ':' + ci2;
    if (Object.keys(paintBuffer).length) td.styles[key] = { ...paintBuffer };
    else delete td.styles[key];
    const cell = td.el.querySelector(`.cell[data-r="${ri}"][data-c="${ci2}"]`);
    if (cell) applyStyleToCell(cell, paintBuffer);
    saveNow();
}
function stopFormatPainter() {
    paintBuffer = null;
    document.body.classList.remove('paint-mode');
    document.querySelectorAll('.cell.paint-hover').forEach(c => c.classList.remove('paint-hover'));
}

// ========== HIDE COLS ==========
function toggleHideCol(td, ci2) {
    if (!hiddenCols[td.id]) hiddenCols[td.id] = new Set();
    const s = hiddenCols[td.id];
    if (s.has(ci2)) s.delete(ci2); else s.add(ci2);
    render(td);
    toast(s.has(ci2) ? 'Колонка скрыта' : 'Колонка показана', 'info');
}
function showAllCols() {
    const td = active(); if (!td) { toast('Выберите таблицу', 'warning'); return; }
    hiddenCols[td.id] = new Set();
    render(td);
    toast('Все колонки показаны', 'success');
}

// ========== MARKUP / DISCOUNT ==========
function applyMarkupToSelection(percent) {
    const td = active(); if (!td) { toast('Выберите таблицу', 'warning'); return; }
    if (cellSel.r1 < 0) { toast('Выделите ячейки в колонке Цена', 'warning'); return; }
    let changed = 0;
    forEachSelectedCell(td, (r, c) => {
        const cn = (td.cols[c] || '').toLowerCase();
        if (!cn.startsWith('цена')) return;
        const v = pn(td.rows[r][c]);
        if (!isNaN(v)) { td.rows[r][c] = (v * (1 + percent / 100)).toFixed(2); changed++; }
    });
    if (changed === 0) { toast('Нет числовых значений в колонках Цена', 'warning'); return; }
    recalcAll(td); render(td); saveSession();
    toast(`Наценка ${percent}% → ${changed} ячеек`, 'success');
}
function applyDiscountToSelection(percent) {
    const td = active(); if (!td) { toast('Выберите таблицу', 'warning'); return; }
    if (cellSel.r1 < 0) { toast('Выделите ячейки в колонке Цена', 'warning'); return; }
    let changed = 0;
    forEachSelectedCell(td, (r, c) => {
        const cn = (td.cols[c] || '').toLowerCase();
        if (!cn.startsWith('цена')) return;
        const v = pn(td.rows[r][c]);
        if (!isNaN(v)) { td.rows[r][c] = (v * (1 - percent / 100)).toFixed(2); changed++; }
    });
    if (changed === 0) { toast('Нет числовых значений', 'warning'); return; }
    recalcAll(td); render(td); saveSession();
    toast(`Скидка ${percent}% → ${changed} ячеек`, 'success');
}

// ========== ROW / COL OPERATIONS ==========
function insRowBelow(td, idx) { insRow(td, idx + 1); }
function insRowAbove(td, idx) { insRow(td, idx); }
function insRow(td, idx) {
    td.rows.splice(idx, 0, Array(td.cols.length).fill(''));
    calc(td.rows[idx], td.cols, td);
    if (td.merges) td.merges = td.merges.map(m => ({ ...m, r1: m.r1 >= idx ? m.r1 + 1 : m.r1, r2: m.r2 >= idx ? m.r2 + 1 : m.r2 }));
    if (td.styles) { const ns = {}; for (const [k, v] of Object.entries(td.styles)) { const [r, c] = k.split(':').map(Number); ns[(r >= idx ? r + 1 : r) + ':' + c] = v; } td.styles = ns; }
    if (td.rowTypes) { const nt = {}; for (const [k, v] of Object.entries(td.rowTypes)) { const n = +k; nt[n >= idx ? n + 1 : n] = v; } td.rowTypes = nt; }
    if (td.notes) { const nn = {}; for (const [k, v] of Object.entries(td.notes)) { const [r, c] = k.split(':').map(Number); nn[(r >= idx ? r + 1 : r) + ':' + c] = v; } td.notes = nn; }
    if (td.formulas) { const nf = {}; for (const [k, v] of Object.entries(td.formulas)) { const [r, c] = k.split(':').map(Number); nf[(r >= idx ? r + 1 : r) + ':' + c] = v; } td.formulas = nf; }
    recalcAll(td); render(td); saveSession();
}
function delRow(td, idx) {
    if (td.rows.length <= 1) { toast('Нельзя удалить последнюю строку', 'warning'); return; }
    hist.push({ a: 'delRow', tid: td.id, d: { i: idx, r: [...td.rows[idx]] } });
    td.rows.splice(idx, 1);
    if (td.merges) td.merges = td.merges.map(m => ({ ...m, r1: m.r1 > idx ? m.r1 - 1 : m.r1, r2: m.r2 >= idx ? m.r2 - 1 : m.r2 })).filter(m => m.r1 <= m.r2);
    if (td.styles) { const ns = {}; for (const [k, v] of Object.entries(td.styles)) { const [r, c] = k.split(':').map(Number); if (r === idx) continue; ns[(r > idx ? r - 1 : r) + ':' + c] = v; } td.styles = ns; }
    if (td.rowTypes) { const nt = {}; for (const [k, v] of Object.entries(td.rowTypes)) { const n = +k; if (n === idx) continue; nt[n > idx ? n - 1 : n] = v; } td.rowTypes = nt; }
    if (td.notes) { const nn = {}; for (const [k, v] of Object.entries(td.notes)) { const [r, c] = k.split(':').map(Number); if (r === idx) continue; nn[(r > idx ? r - 1 : r) + ':' + c] = v; } td.notes = nn; }
    if (td.formulas) { const nf = {}; for (const [k, v] of Object.entries(td.formulas)) { const [r, c] = k.split(':').map(Number); if (r === idx) continue; nf[(r > idx ? r - 1 : r) + ':' + c] = v; } td.formulas = nf; }
    recalcAll(td); render(td); saveSession();
}
function addRowEnd(td) {
    td.rows.push(Array(td.cols.length).fill(''));
    calc(td.rows[td.rows.length - 1], td.cols, td);
    render(td);
    setTimeout(() => { const cell = td.el.querySelector(`.cell[data-r="${td.rows.length - 1}"][data-c="0"]`); if (cell) cell.focus(); }, 50);
    saveSession();
}
function delRowEnd(td) { if (td.rows.length <= 1) { toast('Нельзя удалить последнюю', 'warning'); return; } delRow(td, td.rows.length - 1); }
function insCol(td, idx) {
    openPrompt('Название новой колонки:', '', (name) => {
        if (!name.trim()) return;
        td.cols.splice(idx, 0, name.trim());
        td.rows.forEach(r => r.splice(idx, 0, ''));
        if (td.merges) td.merges = td.merges.map(m => ({ ...m, c1: m.c1 >= idx ? m.c1 + 1 : m.c1, c2: m.c2 >= idx ? m.c2 + 1 : m.c2 }));
        if (td.styles) { const ns = {}; for (const [k, v] of Object.entries(td.styles)) { const [r, c] = k.split(':').map(Number); ns[r + ':' + (c >= idx ? c + 1 : c)] = v; } td.styles = ns; }
        if (td.formulas) { const nf = {}; for (const [k, v] of Object.entries(td.formulas)) { const [r, c] = k.split(':').map(Number); nf[r + ':' + (c >= idx ? c + 1 : c)] = v; } td.formulas = nf; }
        if (td.colCurrencies) { const nc = {}; for (const [k, v] of Object.entries(td.colCurrencies)) { const n = +k; nc[n >= idx ? n + 1 : n] = v; } td.colCurrencies = nc; }
        render(td); saveSession();
    });
}
function delCol(td, idx) {
    if (td.cols.length <= 2) { toast('Минимум 2 колонки', 'warning'); return; }
    hist.push({ a: 'delCol', tid: td.id, d: { i: idx, n: td.cols[idx], c: td.rows.map(r => r[idx]) } });
    td.cols.splice(idx, 1); td.rows.forEach(r => r.splice(idx, 1));
    if (td.merges) td.merges = td.merges.filter(m => !(m.c1 === idx && m.c2 === idx)).map(m => ({ ...m, c1: m.c1 > idx ? m.c1 - 1 : m.c1, c2: m.c2 > idx ? m.c2 - 1 : m.c2 })).filter(m => m.c1 <= m.c2);
    if (td.styles) { const ns = {}; for (const [k, v] of Object.entries(td.styles)) { const [r, c] = k.split(':').map(Number); if (c === idx) continue; ns[r + ':' + (c > idx ? c - 1 : c)] = v; } td.styles = ns; }
    if (td.formulas) { const nf = {}; for (const [k, v] of Object.entries(td.formulas)) { const [r, c] = k.split(':').map(Number); if (c === idx) continue; nf[r + ':' + (c > idx ? c - 1 : c)] = v; } td.formulas = nf; }
    if (td.colCurrencies) { const nc = {}; for (const [k, v] of Object.entries(td.colCurrencies)) { const n = +k; if (n === idx) continue; nc[n > idx ? n - 1 : n] = v; } td.colCurrencies = nc; }
    recalcAll(td); render(td); saveSession();
}
function renameCol(td, idx) {
    openPrompt('Новое название:', td.cols[idx], (name) => {
        if (!name.trim() || name.trim() === td.cols[idx]) return;
        const oldName = td.cols[idx];
        const w = colWidths[oldName];
        td.cols[idx] = name.trim();
        if (w) { delete colWidths[oldName]; colWidths[name.trim()] = w; }
        render(td); saveSession();
    });
}
function dupCol(td, idx) {
    const name = td.cols[idx] + ' (копия)';
    td.cols.splice(idx + 1, 0, name);
    td.rows.forEach(r => r.splice(idx + 1, 0, r[idx]));
    if (td.merges) td.merges = td.merges.map(m => ({ ...m, c1: m.c1 > idx ? m.c1 + 1 : m.c1, c2: m.c2 > idx ? m.c2 + 1 : m.c2 }));
    if (td.colCurrencies) { const nc = {}; for (const [k, v] of Object.entries(td.colCurrencies)) { const n = +k; nc[n > idx ? n + 1 : n] = v; } td.colCurrencies = nc; }
    render(td); toast('Колонка дублирована', 'info'); saveSession();
}
function addColEnd(td) {
    openPrompt('Название новой колонки:', '', (name) => {
        if (!name.trim()) return;
        td.cols.push(name.trim()); td.rows.forEach(r => r.push(''));
        render(td); saveSession();
    });
}
function delColEnd(td) { if (td.cols.length <= 2) { toast('Минимум 2 колонки', 'warning'); return; } delCol(td, td.cols.length - 1); }
function dupRow(td, idx) {
    const copy = [...td.rows[idx]];
    td.rows.splice(idx + 1, 0, copy);
    if (td.styles) { const ns = {}; for (const [k, v] of Object.entries(td.styles)) { const [r, c] = k.split(':').map(Number); if (r === idx) ns[(idx + 1) + ':' + c] = { ...v }; } Object.assign(td.styles, ns); }
    if (td.rowTypes && td.rowTypes[idx]) td.rowTypes[idx + 1] = td.rowTypes[idx];
    if (td.merges) td.merges = td.merges.map(m => ({ ...m, r1: m.r1 > idx ? m.r1 + 1 : m.r1, r2: m.r2 > idx ? m.r2 + 1 : m.r2 }));
    if (td.formulas) {
        const nf = {};
        for (const [k, v] of Object.entries(td.formulas)) {
            const [r, c] = k.split(':').map(Number);
            if (r === idx) nf[(idx + 1) + ':' + c] = v;
            else if (r > idx) nf[(r + 1) + ':' + c] = v;
            else nf[k] = v;
        }
        td.formulas = nf;
    }
    render(td); toast('Строка дублирована', 'info'); saveSession();
}
function addSectionRow(td, atIdx) {
    if (!td) { toast('Выберите таблицу', 'warning'); return; }
    const idx = (atIdx !== undefined && atIdx !== null) ? atIdx : td.rows.length;
    const newRow = Array(td.cols.length).fill('');
    newRow[0] = 'Заголовок раздела';
    td.rows.splice(idx, 0, newRow);
    if (!td.rowTypes) td.rowTypes = {};
    const newTypes = {};
    for (const [k, v] of Object.entries(td.rowTypes)) { const n = +k; newTypes[n >= idx ? n + 1 : n] = v; }
    newTypes[idx] = 'section';
    td.rowTypes = newTypes;
    if (td.merges) td.merges = td.merges.map(m => ({ ...m, r1: m.r1 >= idx ? m.r1 + 1 : m.r1, r2: m.r2 >= idx ? m.r2 + 1 : m.r2 }));
    if (td.styles) { const ns = {}; for (const [k, v] of Object.entries(td.styles)) { const [r, c] = k.split(':').map(Number); ns[(r >= idx ? r + 1 : r) + ':' + c] = v; } td.styles = ns; }
    if (td.notes) { const nn = {}; for (const [k, v] of Object.entries(td.notes)) { const [r, c] = k.split(':').map(Number); nn[(r >= idx ? r + 1 : r) + ':' + c] = v; } td.notes = nn; }
    render(td);
    toast('Строка-заголовок добавлена', 'success');
    setTimeout(() => {
        const cell = td.el.querySelector(`.cell[data-r="${idx}"][data-c="0"]`);
        if (cell) { cell.focus(); const range = document.createRange(); range.selectNodeContents(cell); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range); }
    }, 50);
    saveSession();
}

// ========== ADD COLUMN WITH CURRENCY (создаёт ПАРУ: Цена + Стоимость) ==========
function addColWithCurrency(td, cur) {
    if (!td) { toast('Выберите таблицу', 'warning'); return; }
    const priceName = `Цена, ${cur} с НДС`;
    const costName = `Стоимость, ${cur} с НДС`;

    const existingPrice = td.cols.findIndex(c => c === priceName);
    const existingCost = td.cols.findIndex(c => c === costName);

    if (existingPrice >= 0 && existingCost >= 0) {
        toast(`Колонки для ${cur} уже существуют`, 'warning');
        return;
    }

    const added = [];
    if (!td.colCurrencies) td.colCurrencies = {};

    if (existingPrice < 0) {
        const idx = td.cols.length;
        td.cols.push(priceName);
        td.rows.forEach(r => r.push(''));
        td.colCurrencies[idx] = cur;
        added.push(priceName);
    }

    if (existingCost < 0) {
        const idx = td.cols.length;
        td.cols.push(costName);
        td.rows.forEach(r => r.push(''));
        td.colCurrencies[idx] = cur;
        added.push(costName);
    }

    recalcAll(td);
    render(td);
    saveSession();
    if (added.length) toast(`Добавлено: ${added.join(' + ')}`, 'success');
}

// ========== SORT / AUTOFIT ==========
function sortByColumn(td, col, forceDir) {
    const st = sortState[td.id] || { col: -1, dir: 'asc' };
    let dir = forceDir || 'asc';
    if (!forceDir) { if (st.col === col && st.dir === 'asc') dir = 'desc'; else if (st.col === col && st.dir === 'desc') dir = 'asc'; }
    sortState[td.id] = { col, dir };
    const sectionIdx = new Set(Object.entries(td.rowTypes || {}).filter(([k, v]) => v === 'section').map(([k]) => +k));
    const dataRows = [];
    td.rows.forEach((r, i) => { if (sectionIdx.has(i)) return; dataRows.push({ r: [...r], i }); });
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
    render(td); saveSession();
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
    const td = getTables(activeWorkspace).find(t => t.id === l.tid);
    if (!td) { toast('Таблица не найдена', 'error'); return; }
    switch (l.a) {
        case 'editCell': td.rows[l.d.ri][l.d.ci] = l.d.old; render(td); toast('Отменено', 'info'); break;
        case 'delRow': case 'delRowEnd': td.rows.splice(l.d.i, 0, l.d.r); render(td); toast('Строка возвращена', 'info'); break;
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
    let startIdx = (td.rows.length === 1 && isEmptyRow(td.rows[0])) ? 0 : td.rows.length;
    parsedRows.forEach((r, pi) => {
        const nr = Array(td.cols.length).fill('');
        for (let i = 0; i < td.cols.length; i++) {
            let v = r[i] ?? '';
            const cn = td.cols[i].toLowerCase();
            if (isNumericCol(cn)) { const n = pn(v); if (!isNaN(n) && v !== '') v = n.toFixed(2); }
            nr[i] = v;
        }
        if (startIdx === 0 && pi === 0) td.rows[0] = nr; else td.rows.push(nr);
        calc(nr, td.cols, td);
    });
    hist.push({ a: 'paste', tid: td.id, d: { si: startIdx, count: parsedRows.length } });
    recalcAll(td); render(td);
    toast(`Вставлено ${parsedRows.length} строк`, 'success'); saveSession();
}
function pasteAt(td, ri, ci2, parsed) {
    for (let r = 0; r < parsed.length; r++) {
        const targetR = ri + r;
        if (targetR >= td.rows.length) td.rows.push(Array(td.cols.length).fill(''));
        for (let c = 0; c < parsed[r].length; c++) {
            const targetC = ci2 + c;
            if (targetC >= td.cols.length) break;
            let v = parsed[r][c] ?? '';
            const cn = td.cols[targetC].toLowerCase();
            if (isNumericCol(cn)) { const n = pn(v); if (!isNaN(n) && v !== '') v = n.toFixed(2); }
            td.rows[targetR][targetC] = v;
        }
        calc(td.rows[targetR], td.cols, td);
    }
    recalcAll(td); render(td);
    toast(`Вставлено ${parsed.length}×${parsed[0].length}`, 'success'); saveSession();
}

// ========== DIVIDERS ==========
function renderWorkspace(wsNum) {
    const area = Q('#workspaceArea_' + wsNum);
    if (!area) return;
    area.innerHTML = '';
    const items = workspaces[wsNum] || [];
    if (!items.length) { upEmpty(); updateStatusBar(); return; }
    items.forEach(item => {
        if (item.type === 'divider') area.appendChild(buildDividerDOM(item));
        else { const card = buildCardDOM(item); area.appendChild(card); item.card = card; render(item); }
    });
    upEmpty();
    updateStatusBar();
    updateCellSelectionUI(active());
}
function buildDividerDOM(item) {
    const el = document.createElement('div');
    el.className = 'divider'; el.dataset.divid = item.id;
    el.innerHTML = `
        <div class="divider-icon">§</div>
        <div class="divider-title" contenteditable="true" data-divid="${item.id}">${escapeHtml(item.title || 'Новый раздел')}</div>
        <div class="divider-actions">
            <button class="divider-btn" data-divid="${item.id}" data-act="up" title="Вверх">↑</button>
            <button class="divider-btn" data-divid="${item.id}" data-act="down" title="Вниз">↓</button>
            <button class="divider-btn" data-divid="${item.id}" data-act="dup" title="Дублировать">⎘</button>
            <button class="divider-btn danger" data-divid="${item.id}" data-act="del" title="Удалить">✕</button>
        </div>`;
    const titleEl = el.querySelector('.divider-title');
    titleEl.addEventListener('blur', () => { item.title = titleEl.innerText.trim() || 'Новый раздел'; titleEl.innerText = item.title; saveSession(); });
    titleEl.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); titleEl.blur(); } });
    el.querySelectorAll('.divider-btn').forEach(btn => {
        btn.onclick = e => {
            e.stopPropagation();
            const act = btn.dataset.act;
            const ws = workspaces[activeWorkspace];
            const idx = ws.indexOf(item); if (idx < 0) return;
            if (act === 'del') { ws.splice(idx, 1); renderWorkspace(activeWorkspace); toast('Разделитель удалён', 'info'); }
            if (act === 'up' && idx > 0) { ws.splice(idx, 1); ws.splice(idx - 1, 0, item); renderWorkspace(activeWorkspace); }
            if (act === 'down' && idx < ws.length - 1) { ws.splice(idx, 1); ws.splice(idx + 1, 0, item); renderWorkspace(activeWorkspace); }
            if (act === 'dup') { idC++; const copy = { type: 'divider', id: idC, title: item.title + ' (копия)' }; ws.splice(idx + 1, 0, copy); renderWorkspace(activeWorkspace); }
            saveSession();
        };
    });
    return el;
}
function addDivider(options) {
    options = options || {};
    const ws = workspaces[activeWorkspace];
    const position = options.position || 'auto';
    const refTd = options.refTd || active();
    idC++;
    const div = { type: 'divider', id: idC, title: options.title || 'Новый раздел' };
    let insertAt = ws.length;
    if (position === 'before' && refTd) { const idx = ws.indexOf(refTd); if (idx >= 0) insertAt = idx; }
    else if (position === 'after' && refTd) { const idx = ws.indexOf(refTd); if (idx >= 0) insertAt = idx + 1; }
    else if (position === 'auto' && refTd) { const idx = ws.indexOf(refTd); if (idx >= 0) insertAt = idx + 1; }
    ws.splice(insertAt, 0, div);
    renderWorkspace(activeWorkspace);
    toast('Разделитель добавлен', 'success');
    setTimeout(() => {
        const el = Q(`.divider[data-divid="${div.id}"] .divider-title`);
        if (el) { el.focus(); const range = document.createRange(); range.selectNodeContents(el); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range); }
    }, 60);
    saveSession();
}
