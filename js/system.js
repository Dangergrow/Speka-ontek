// ==================== ONTEK v7.1.0 — SYSTEM ====================
// Сохранение, загрузка, сессии, хоткеи, экспорт

function saveNow() {
    const s = { theme, color: colorTheme, hotkeys, activeWorkspace, tableSettings, notifySettings, colWidths, exportTheme };
    const json = JSON.stringify(s);
    localStorage.setItem('ontek_settings', json);
    if (window.pywebview && window.pywebview.api) window.pywebview.api.save_settings(json).catch(() => {});
}
async function loadSettings() {
    for (let i = 0; i < 30; i++) { if (window.pywebview && window.pywebview.api) break; await new Promise(r => setTimeout(r, 100)); }
    let raw = null;
    if (window.pywebview && window.pywebview.api) { try { raw = await window.pywebview.api.load_settings(); } catch (e) {} }
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
function saveSession() {
    try {
        const state = { activeWorkspace, workspaces: {} };
        for (const k of Object.keys(workspaces)) {
            state.workspaces[k] = (workspaces[k] || []).map(item => {
                if (item.type === 'divider') return { type: 'divider', id: item.id, title: item.title };
                return {
                    type: 'table', id: item.id, cols: item.cols, rows: item.rows, currency: item.currency,
                    merges: item.merges || [], styles: item.styles || {}, rowTypes: item.rowTypes || {},
                    notes: item.notes || {}, formulas: item.formulas || {}, colCurrencies: item.colCurrencies || {}
                };
            });
        }
        localStorage.setItem('ontek_session', JSON.stringify(state));
    } catch (e) {}
}
function loadSession() {
    try {
        const raw = localStorage.getItem('ontek_session');
        if (!raw) return false;
        const state = JSON.parse(raw);
        if (!state || !state.workspaces) return false;
        let hasData = false;
        for (const k of Object.keys(state.workspaces)) {
            const arr = state.workspaces[k] || [];
            if (arr.length) hasData = true;
            workspaces[+k] = arr;
            arr.forEach(item => { if (item.id > idC) idC = item.id; });
        }
        if (state.activeWorkspace) activeWorkspace = state.activeWorkspace;
        return hasData;
    } catch (e) { return false; }
}

function updateAllHKDisplays() {
    document.querySelectorAll('.s-hotkey[data-hk]').forEach(el => {
        const k = el.dataset.hk;
        if (hotkeys[k]) el.textContent = 'Shift+' + hkDisplay(hotkeys[k]);
    });
}
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
    Object.keys(workspaces).forEach(ws => { getTables(+ws).forEach(td => render(td)); });
    saveNow();
}
function resetTableSettings() {
    tableSettings = {
        rowHeight: 38, fontSize: 13,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        padding: 10, wrapText: false,
        showRowNums: true, showTotals: true,
        zebra: true, vGrid: true, hGrid: true, rounded: true
    };
    colWidths = {};
    applyAllSettings();
    toast('Настройки сброшены', 'success');
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
    set('setRowHeight', tableSettings.rowHeight);
    if (Q('#valRowHeight')) Q('#valRowHeight').textContent = tableSettings.rowHeight + ' px';
    set('setFontSize', tableSettings.fontSize);
    if (Q('#valFontSize')) Q('#valFontSize').textContent = tableSettings.fontSize + ' px';
    set('setFontFamily', tableSettings.fontFamily);
    set('setPadding', tableSettings.padding);
    if (Q('#valPadding')) Q('#valPadding').textContent = tableSettings.padding + ' px';
    setC('setWrapText', tableSettings.wrapText);
    setC('setShowRowNums', tableSettings.showRowNums);
    setC('setShowTotals', tableSettings.showTotals);
    setC('setZebra', tableSettings.zebra);
    setC('setVGrid', tableSettings.vGrid);
    setC('setHGrid', tableSettings.hGrid);
    setC('setRounded', tableSettings.rounded);
    setC('setShowToasts', notifySettings.enabled);
    set('setToastPos', notifySettings.position);
    set('setToastDur', notifySettings.duration);
    if (Q('#valToastDur')) Q('#valToastDur').textContent = (notifySettings.duration / 1000).toFixed(1) + ' s';
    applyTableSettings();
}
function switchWorkspace(ws) {
    activeWorkspace = ws; actId = null; clearCellSelection();
    applyAllSettings(); saveNow(); updateStatusBar(); renderWorkspace(ws);
}
function toggleTheme() { theme = theme === 'light' ? 'dark' : 'light'; applyAllSettings(); saveNow(); }
function setColorTheme(t) { colorTheme = t; applyAllSettings(); saveNow(); }
function setExportTheme(t) {
    exportTheme = t;
    document.querySelectorAll('.export-theme').forEach(c => c.classList.toggle('active', c.dataset.theme === t));
    saveNow(); toast('Тема экспорта: ' + EXPORT_THEMES[t].name, 'success');
}

// ========== STATUS BAR ==========
function updateStatusBar() {
    const td = active();
    const center = Q('#statusCenter');
    if (!center) return;
    if (!td) { center.innerHTML = ''; return; }
    const rows = td.rows.length;
    const totals = getTotalsByCurrency(td);
    let html = `<span class="status-stat">Строк: <b>${rows}</b></span>`;
    const curParts = Object.entries(totals);
    if (curParts.length) {
        const totalsHtml = curParts.map(([cur, val]) => `<span class="status-stat currency-total">${val.toFixed(2)} ${cur}</span>`).join(' ');
        html += `<span class="status-stat">Итого: </span>${totalsHtml}`;
    }
    if (cellSel.tid === td.id && cellSel.r1 >= 0) {
        const r1 = Math.min(cellSel.r1, cellSel.r2), r2 = Math.max(cellSel.r1, cellSel.r2);
        const c1 = Math.min(cellSel.c1, cellSel.c2), c2 = Math.max(cellSel.c1, cellSel.c2);
        let sum = 0, count = 0, nums = 0, minV = Infinity, maxV = -Infinity;
        for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) {
            const v = td.rows[r]?.[c]; count++;
            const n = pn(v);
            if (!isNaN(n)) { sum += n; nums++; if (n < minV) minV = n; if (n > maxV) maxV = n; }
        }
        html += `<span class="status-stat">Выделено: <b>${r2 - r1 + 1}×${c2 - c1 + 1}</b></span>`;
        if (nums > 0) {
            html += `<span class="status-stat accent">Σ: <b>${sum.toFixed(2)}</b></span>`;
            html += `<span class="status-stat">Сред: <b>${(sum / nums).toFixed(2)}</b></span>`;
            html += `<span class="status-stat">Мин: <b>${minV.toFixed(2)}</b></span>`;
            html += `<span class="status-stat">Макс: <b>${maxV.toFixed(2)}</b></span>`;
        } else html += `<span class="status-stat">Ячеек: <b>${count}</b></span>`;
    }
    center.innerHTML = html;
}

// ========== COPY ==========
function copySelectedCells() {
    const td = active(); if (!td) return;
    const sel = selectedRows[td.id];
    if (cellSel.tid === td.id && cellSel.r1 >= 0) { copyCellsWithFormat(td); return; }
    if (sel && sel.size) { copySelectedRowsWithFormat(td); return; }
    copyTableWithFormat(td);
}

// ========== SAVE XLSX (мультивалютный) ==========
function save() {
    const tables = getTables(activeWorkspace);
    if (!tables.length) { toast('Нет таблиц', 'warning'); return; }
    const palette = EXPORT_THEMES[exportTheme] || EXPORT_THEMES.blue;
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('Заказы');
    let cr = 1;
    const mc = Math.max(...tables.map(t => t.cols.length), 5);
    sheet.columns = Array(mc).fill({ width: 24 });
    tables.forEach(td => {
        const ni = ci(td.cols, 'Наименование'); if (ni >= 0) sheet.getColumn(ni + 1).width = 88;
        const qi = getQi(td.cols); if (qi >= 0) sheet.getColumn(qi + 1).width = 18;
        const pi = ci(td.cols, 'Цена'); if (pi >= 0) sheet.getColumn(pi + 1).width = 22;
        const ti = ci(td.cols, 'Стоимость'); if (ti >= 0) sheet.getColumn(ti + 1).width = 22;
    });
    const items = workspaces[activeWorkspace] || [];
    items.forEach(item => {
        if (item.type === 'divider') {
            try { sheet.mergeCells(cr, 1, cr, mc); } catch (e) {}
            const cell = sheet.getCell(cr, 1);
            cell.value = item.title;
            cell.font = { bold: true, size: 14, color: { argb: palette.headerText }, name: 'Calibri' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: palette.header } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            sheet.getRow(cr).height = 32; cr += 2; return;
        }
        const td = item;
        if (!td.rows.length) return;
        const tc = td.cols.length;
        const qi = getQi(td.cols), pi = ci(td.cols, 'Цена'), ti = ci(td.cols, 'Стоимость'), ni = ci(td.cols, 'Наименование');
        // Header
        const hr = sheet.getRow(cr);
        td.cols.forEach((col, i) => {
            const cell = hr.getCell(i + 1);
            const cur = getColCurrency(td, i);
            cell.value = formatHeader(col, td.currency) + (cur ? ` (${cur})` : '');
            cell.font = { bold: true, size: 12, color: { argb: palette.headerText }, name: 'Calibri' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: palette.header } };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = { top: { style: 'thin', color: { argb: palette.borderDark } }, bottom: { style: 'thin', color: { argb: palette.borderDark } }, left: { style: 'thin', color: { argb: palette.borderDark } }, right: { style: 'thin', color: { argb: palette.borderDark } } };
        });
        hr.height = 28; cr++;
        const fdr = cr;
        // Data rows
        for (let r = 0; r < td.rows.length; r++) {
            const isSection = td.rowTypes && td.rowTypes[r] === 'section';
            if (isSection) {
                try { sheet.mergeCells(cr, 1, cr, tc); } catch (e) {}
                const cell = sheet.getCell(cr, 1);
                cell.value = td.rows[r][0] ?? '';
                cell.font = { bold: true, size: 12, color: { argb: palette.sectionText }, name: 'Calibri' };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: palette.section } };
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                for (let c = 1; c <= tc; c++) { const cc = sheet.getCell(cr, c); cc.border = { top: { style: 'thin', color: { argb: palette.border } }, bottom: { style: 'thin', color: { argb: palette.border } }, left: { style: 'thin', color: { argb: palette.border } }, right: { style: 'thin', color: { argb: palette.border } } }; }
                sheet.getRow(cr).height = 24; cr++; continue;
            }
            const row = sheet.getRow(cr);
            const bg = r % 2 === 0 ? palette.rowOdd : palette.rowEven;
            for (let c = 0; c < tc; c++) {
                const cell = row.getCell(c + 1);
                const cn = (td.cols[c] || '').toLowerCase();
                if (cn.startsWith('стоимость')) {
                    // Формула: Ко-во * Цена (соответствующая)
                    const priceIdxs = []; td.cols.forEach((cc, j) => { if ((cc || '').toLowerCase().startsWith('цена')) priceIdxs.push(j); });
                    const costIdxs = []; td.cols.forEach((cc, j) => { if ((cc || '').toLowerCase().startsWith('стоимость')) costIdxs.push(j); });
                    const k = costIdxs.indexOf(c);
                    const pIdx = priceIdxs[k] != null ? priceIdxs[k] : pi;
                    if (qi >= 0 && pIdx >= 0) {
                        cell.value = { formula: `${cA(cr, qi + 1)}*${cA(cr, pIdx + 1)}`, result: pn(td.rows[r][c]) || 0 };
                    } else {
                        cell.value = pn(td.rows[r][c]) || 0;
                    }
                    cell.numFmt = '#,##0.00';
                } else if (cn.startsWith('цена') || cn.includes('ко-во') || cn.includes('количество')) {
                    const v = pn(td.rows[r][c]);
                    cell.value = isNaN(v) ? td.rows[r][c] : v;
                    cell.numFmt = '#,##0.00';
                } else {
                    cell.value = td.rows[r][c] ?? '';
                }
                cell.font = { size: 11, color: { argb: 'FF1E293B' }, name: 'Calibri' };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                cell.border = { top: { style: 'thin', color: { argb: palette.border } }, bottom: { style: 'thin', color: { argb: palette.border } }, left: { style: 'thin', color: { argb: palette.border } }, right: { style: 'thin', color: { argb: palette.border } } };
                const st = getCellStyle(td, r, c);
                if (st.bold) cell.font = { ...cell.font, bold: true };
                if (st.italic) cell.font = { ...cell.font, italic: true };
                if (st.underline) cell.font = { ...cell.font, underline: true };
                if (st.strike) cell.font = { ...cell.font, strike: true };
                if (st.color) cell.font = { ...cell.font, color: { argb: 'FF' + st.color.replace('#', '').toUpperCase() } };
                if (st.bg) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + st.bg.replace('#', '').toUpperCase() } };
                if (st.fontSize) cell.font = { ...cell.font, size: st.fontSize };
                if (st.fontFamily) cell.font = { ...cell.font, name: st.fontFamily.split(',')[0].replace(/['"]/g, '').trim() };
                if (st.align) cell.alignment = { ...cell.alignment, horizontal: st.align };
                if (c === ni && !st.align) cell.alignment = { ...cell.alignment, horizontal: 'left' };
                if ((cn.startsWith('цена') || cn.includes('ко-во') || cn.startsWith('стоимость')) && !st.align) cell.alignment = { ...cell.alignment, horizontal: 'right' };
            }
            cr++;
        }
        if (td.merges) td.merges.forEach(m => { try { sheet.mergeCells(fdr + m.r1, m.c1 + 1, fdr + m.r2, m.c2 + 1); } catch (e) {} });
        // Total row
        const ldr = cr - 1;
        const tr = sheet.getRow(cr);
        // Ищем позицию "Итого"
        const firstCostIdx2 = td.cols.findIndex(c => (c || '').toLowerCase().startsWith('стоимость'));
        const labelIdx = firstCostIdx2 > 0 ? firstCostIdx2 - 1 : tc - 2;
        for (let c = 0; c < tc; c++) {
            const cell = tr.getCell(c + 1);
            const cn = (td.cols[c] || '').toLowerCase();
            if (cn.startsWith('стоимость')) {
                cell.value = { formula: `SUM(${cA(fdr, c + 1)}:${cA(ldr, c + 1)})`, result: sumCol(td, c) };
                cell.numFmt = '#,##0.00';
            } else if (cn.includes('ко-во') || cn.includes('количество')) {
                cell.value = { formula: `SUM(${cA(fdr, c + 1)}:${cA(ldr, c + 1)})`, result: sumCol(td, c) };
                cell.numFmt = '#,##0.00';
            } else if (c === labelIdx) {
                cell.value = 'Итого';
            }
            cell.font = { bold: true, size: 12, name: 'Calibri' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: palette.total } };
            cell.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
            cell.border = { top: { style: 'medium', color: { argb: palette.borderDark } }, bottom: { style: 'medium', color: { argb: palette.borderDark } }, left: { style: 'thin', color: { argb: palette.border } }, right: { style: 'thin', color: { argb: palette.border } } };
        }
        tr.height = 28; cr += 2;
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
    const tables = getTables(activeWorkspace);
    if (!tables.length) { toast('Нет таблиц', 'warning'); return; }
    const lines = [];
    const items = workspaces[activeWorkspace] || [];
    items.forEach(item => {
        if (item.type === 'divider') { lines.push('"' + String(item.title).replace(/"/g, '""') + '"'); lines.push(''); return; }
        const td = item;
        lines.push(td.cols.map(c => formatHeader(c, td.currency)).join(';'));
        td.rows.forEach((row, ri) => {
            if (td.rowTypes && td.rowTypes[ri] === 'section') { lines.push('"' + String(row[0] ?? '').replace(/"/g, '""') + '"'); return; }
            lines.push(row.map(v => { const s = String(v ?? ''); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(';'));
        });
        lines.push('');
    });
    const csv = '\ufeff' + lines.join('\n');
    const fn = `Заказы_ONTEK_${new Date().toISOString().slice(0, 10)}.csv`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    if (window.pywebview && window.pywebview.api) {
        const reader = new FileReader();
        reader.onload = () => { const b64 = reader.result.split(',')[1]; window.pywebview.api.save_file(b64, fn).then(r => { const j = JSON.parse(r); if (j.success) toast('CSV сохранён', 'success'); else toast('Отменено', 'info'); }); };
        reader.readAsDataURL(blob);
    } else {
        const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = fn;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        toast('CSV сохранён', 'success');
    }
}

// ========== PRINT ==========
function printView() {
    const tables = getTables(activeWorkspace);
    if (!tables.length) { toast('Нет таблиц', 'warning'); return; }
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
        .divider { background: #${palette.header.substring(2)}; color: #fff; text-align: center; font-weight: 800; padding: 14px; font-size: 15px; margin: 20px 0; border-radius: 6px; }
        @media print { body { padding: 0; } }
    </style></head><body>`;
    const items = workspaces[activeWorkspace] || [];
    items.forEach(item => {
        if (item.type === 'divider') { html += `<div class="divider">${escapeHtml(item.title)}</div>`; return; }
        const td = item;
        html += `<h1>Таблица ${td.currency}</h1><table><thead><tr>`;
        td.cols.forEach((c, i) => {
            const cur = getColCurrency(td, i);
            html += `<th>${escapeHtml(formatHeader(c, td.currency))}${cur ? ' (' + cur + ')' : ''}</th>`;
        });
        html += '</tr></thead><tbody>';
        td.rows.forEach((row, ri) => {
            if (td.rowTypes && td.rowTypes[ri] === 'section') { html += `<tr><td colspan="${td.cols.length}" class="section">${escapeHtml(row[0])}</td></tr>`; return; }
            html += '<tr>';
            row.forEach(v => html += `<td>${escapeHtml(v)}</td>`);
            html += '</tr>';
        });
        if (tableSettings.showTotals) {
            const firstCost = td.cols.findIndex(c => (c || '').toLowerCase().startsWith('стоимость'));
            const labelIdx = firstCost > 0 ? firstCost - 1 : td.cols.length - 2;
            html += '<tr class="total">';
            td.cols.forEach((_, c) => {
                const cn = (td.cols[c] || '').toLowerCase();
                if (cn.startsWith('стоимость') || cn.includes('ко-во') || cn.includes('количество')) {
                    html += `<td style="text-align:right">${escapeHtml(formatColTotal(td, c))}</td>`;
                } else if (c === labelIdx) html += '<td style="text-align:right">Итого</td>';
                else html += '<td></td>';
            });
            html += '</tr>';
        }
        html += '</tbody></table>';
    });
    html += '</body></html>';
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
                        if (ch === '"') { if (inQ && l[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
                        else if ((ch === ';' || ch === ',') && !inQ) { parts.push(cur); cur = ''; }
                        else cur += ch;
                    }
                    parts.push(cur); return parts;
                });
                processCSV(rows);
            } else {
                const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                processWB(wb);
            }
        } catch (er) { toast('Ошибка чтения файла', 'error'); if (!getTables(activeWorkspace).length) addTable('USD'); }
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
    const ws = workspaces[activeWorkspace]; ws.length = 0; idC = 0; actId = null;
    let cols = null, dataRows = [];
    for (const row of rows) {
        const lower = row.map(c => c.toLowerCase());
        if (!cols && lower.some(c => c.includes('артикул') || c.includes('наименование'))) cols = row.filter(h => h.trim());
        else if (cols) { if (row.every(c => !c.trim())) continue; dataRows.push(row); }
    }
    if (!cols) { cols = [...DEFAULT_COLS]; dataRows = rows; }
    idC++;
    ws.push({ type: 'table', id: idC, cols, rows: dataRows, currency: 'RUB', el: null, card: null, merges: [], styles: {}, rowTypes: {}, notes: {}, formulas: {}, colCurrencies: {} });
    renderWorkspace(activeWorkspace); setAct(idC);
    toast('CSV загружен', 'success'); saveSession();
}
function processWB(wb) {
    setStatus('Загрузка файла...', 'busy');
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
                const cleaned = hs.map(c => c.replace(/,?\s*(USD|RUB|EUR|XAU|BTC|OIL)\s*с НДС/i, ''));
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
            ws.push({ type: 'table', id: idC, cols: c.cols, rows: c.rows, currency: c.currency, el: null, card: null, merges: [], styles: {}, rowTypes: {}, notes: {}, formulas: {}, colCurrencies: {} });
        }
    });
    renderWorkspace(activeWorkspace);
    if (!ws.length) { addTable('USD'); setStatus('Файл пуст', 'warning'); }
    else { setAct(getTables(activeWorkspace)[0].id); updateStatusBar(); setStatus(`Загружено: ${getTables(activeWorkspace).length} табл.`, 'ok'); toast(`Загружено ${getTables(activeWorkspace).length} таблиц`, 'success'); }
    saveSession();
}

// ========== GLOBAL HOTKEYS ==========
function handleGlobalHotkeys(e) {
    const inCell = e.target.closest('.cell[contenteditable="true"]');
    if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key === ';') { e.preventDefault(); const s = new Date().toLocaleDateString('ru-RU'); document.execCommand('insertText', false, s); return; }
    if (e.key === 'Escape') {
        if (paintBuffer) { stopFormatPainter(); toast('Формат отменён', 'info'); return; }
        hideCtx(); closeSearch(); closeFR(); clearCellSelection(); return;
    }
    if (e.key === 'F3') { e.preventDefault(); if (lastSearch.matches.length) searchNext(); return; }

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
        if (k === 'c' && !inCell) {
            const td = active();
            if (td && ((cellSel.tid === td.id && cellSel.r1 >= 0) || (selectedRows[td.id] && selectedRows[td.id].size > 0))) {
                e.preventDefault();
                copySelectedCells();
                return;
            }
        }
    }
    if (e.ctrlKey && e.shiftKey && !e.altKey) {
        const k = e.key.toUpperCase();
        if (k === 'S' && !inCell) { e.preventDefault(); addSectionRow(active()); return; }
        if (k === 'D' && !inCell) { e.preventDefault(); addDivider({ position: 'auto' }); return; }
        if (k === 'M' && !inCell) { e.preventDefault(); const td = active(); if (td && cellSel.r1 >= 0) mergeRect(td, cellSel.r1, cellSel.c1, cellSel.r2, cellSel.c2); return; }
        if (k === 'E' && !inCell) { e.preventDefault(); exportCSV(); return; }
        if (k === 'P' && !inCell) { e.preventDefault(); printView(); return; }
        if (k === 'F' && !inCell) { e.preventDefault(); startFormatPainter(); return; }
        if (k === 'C' && !inCell) { e.preventDefault(); const td = active(); if (td) copyTableWithFormat(td); return; }
        if ((k === '!' || k === '1') && !inCell) { e.preventDefault(); addTable('RUB'); return; }
        if ((k === '@' || k === '2') && !inCell) { e.preventDefault(); addTable('USD'); return; }
    }
    if (e.shiftKey && !e.ctrlKey && !e.altKey && !inCell && !recordingKey) {
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
            recalc: () => { getTables(activeWorkspace).forEach(td => { recalcAll(td); render(td); }); toast('Пересчитано', 'success'); },
            paste: () => paste(),
            load: () => loadViaDialog(),
            newRUB: () => addTable('RUB'),
            newUSD: () => addTable('USD'),
            dup: () => dupTable(),
            clear: () => { if (!getTables(activeWorkspace).length) return; openConfirm('Очистить?', 'Все таблицы и разделители удалятся.', () => { workspaces[activeWorkspace] = []; idC = 0; actId = null; renderWorkspace(activeWorkspace); toast('Очищено', 'info'); saveSession(); }); },
            undo: () => undo(),
            save: () => save(),
            convert: () => { const t = active(); if (t) convertCurrency(t); }
        };
        for (const [k, v] of Object.entries(hotkeys)) { if (key === v && actions[k]) { e.preventDefault(); actions[k](); return; } }
    }
}
function handleGlobalPaste(e) { if (e.target.closest('.cell[contenteditable="true"]')) return; e.preventDefault(); paste(); }
document.addEventListener('mouseup', () => { if (cellSel.dragging) cellSel.dragging = false; });
