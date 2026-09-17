// ==================== ONTEK v7.2.0 — INIT ====================
document.addEventListener('DOMContentLoaded', function () {
    if (typeof ExcelJS === 'undefined' || typeof XLSX === 'undefined') {
        document.body.innerHTML = '<div style="padding:40px;text-align:center;font-family:sans-serif"><h1>Ошибка загрузки библиотек</h1><p>Проверьте наличие exceljs.min.js и xlsx.full.min.js</p></div>';
        return;
    }

    loadTemplates();
    buildWorkspaces();
    buildSidebarV2();

    loadSettings().then(() => {
        applyAllSettings();
    });

    bindAllEvents();
    loadRates();

    const restored = loadSession();
    if (restored && (workspaces[activeWorkspace] || []).length) {
        renderWorkspace(activeWorkspace);
        toast('Сессия восстановлена', 'info', 2000);
    } else {
        addTable('USD');
    }

    setStatus('Готово');
    setTimeout(() => { toast('ONTEK v7.2 готов', 'info', 2000); }, 500);

    setInterval(saveSession, 5000);
    window.addEventListener('beforeunload', saveSession);
});

// ========== BIND ALL EVENTS ==========
function bindAllEvents() {
    Q('#btnTheme').onclick = toggleTheme;
    Q('#fileInput').onchange = e => {
        if (e.target.files[0]) { loadFile(e.target.files[0]); e.target.value = ''; }
    };

    // Settings
    Q('#btnSettings').onclick = () => {
        Q('#settingsModal').classList.add('show');
        renderHotkeyList();
        renderThemeOptions('themeOptionsSettings');
        renderExportThemes('exportThemes');
    };
    Q('#btnCloseSettings').onclick = () => Q('#settingsModal').classList.remove('show');
    Q('#settingsModal').addEventListener('click', function (e) {
        if (e.target === this) this.classList.remove('show');
    });
    Q('#btnResetHotkeys').onclick = () => {
        hotkeys = { ...DEFAULT_HOTKEYS };
        saveNow();
        updateAllHKDisplays();
        renderHotkeyList();
        toast('Сброшено', 'info');
    };
    if (Q('#btnResetTable')) Q('#btnResetTable').onclick = resetTableSettings;
    document.querySelectorAll('[data-toggle]').forEach(el => el.onclick = () => toggleSection(el.dataset.toggle));

    // Table settings
    Q('#setRowHeight').oninput = () => {
        tableSettings.rowHeight = +Q('#setRowHeight').value;
        Q('#valRowHeight').textContent = Q('#setRowHeight').value + ' px';
        applyTableSettings();
    };
    Q('#setFontSize').oninput = () => {
        tableSettings.fontSize = +Q('#setFontSize').value;
        Q('#valFontSize').textContent = Q('#setFontSize').value + ' px';
        applyTableSettings();
    };
    Q('#setFontFamily').onchange = () => {
        tableSettings.fontFamily = Q('#setFontFamily').value;
        applyTableSettings();
    };
    Q('#setPadding').oninput = () => {
        tableSettings.padding = +Q('#setPadding').value;
        Q('#valPadding').textContent = Q('#setPadding').value + ' px';
        applyTableSettings();
    };
    Q('#setWrapText').onchange = () => { tableSettings.wrapText = Q('#setWrapText').checked; applyTableSettings(); };
    Q('#setShowRowNums').onchange = () => { tableSettings.showRowNums = Q('#setShowRowNums').checked; applyTableSettings(); };
    Q('#setShowTotals').onchange = () => { tableSettings.showTotals = Q('#setShowTotals').checked; applyTableSettings(); };
    Q('#setZebra').onchange = () => { tableSettings.zebra = Q('#setZebra').checked; applyTableSettings(); };
    Q('#setVGrid').onchange = () => { tableSettings.vGrid = Q('#setVGrid').checked; applyTableSettings(); };
    Q('#setHGrid').onchange = () => { tableSettings.hGrid = Q('#setHGrid').checked; applyTableSettings(); };
    Q('#setRounded').onchange = () => { tableSettings.rounded = Q('#setRounded').checked; applyTableSettings(); };

    // Notify
    Q('#setShowToasts').onchange = () => { notifySettings.enabled = Q('#setShowToasts').checked; saveNow(); };
    Q('#setToastPos').onchange = () => { notifySettings.position = Q('#setToastPos').value; updateToastPosition(); saveNow(); };
    Q('#setToastDur').oninput = () => {
        notifySettings.duration = +Q('#setToastDur').value;
        Q('#valToastDur').textContent = (+Q('#setToastDur').value / 1000).toFixed(1) + ' s';
        saveNow();
    };

    // Color theme
    Q('#btnColorTheme').onclick = () => {
        Q('#colorThemeModal').classList.add('show');
        renderThemeOptions('colorThemeOptions');
    };
    Q('#btnCloseColorTheme').onclick = () => Q('#colorThemeModal').classList.remove('show');
    Q('#colorThemeModal').addEventListener('click', function (e) {
        if (e.target === this) this.classList.remove('show');
    });

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
        saveTemplates();
        Q('#tplName').value = '';
        renderTemplates();
        toast('Шаблон сохранён', 'success');
    };

    // Sidebar
    const sb = (id, fn, retries = 5) => {
        const el = document.getElementById(id);
        if (el) { el.onclick = fn; return; }
        if (retries > 0) setTimeout(() => sb(id, fn, retries - 1), 100);
    };
    sb('btnAddRow', () => { const t = active(); if (t) addRowEnd(t); else toast('Выберите таблицу', 'warning'); });
    sb('btnAddSection', () => { const t = active(); if (t) addSectionRow(t); else toast('Выберите таблицу', 'warning'); });
    sb('btnAddDivider', () => addDivider({ position: 'auto' }));
    sb('btnDelRow', () => { const t = active(); if (t) delRowEnd(t); else toast('Выберите таблицу', 'warning'); });
    sb('btnAddCol', () => { const t = active(); if (t) addColEnd(t); else toast('Выберите таблицу', 'warning'); });
    sb('btnDelCol', () => { const t = active(); if (t) delColEnd(t); else toast('Выберите таблицу', 'warning'); });
    sb('btnConvert', () => { const t = active(); if (t) convertCurrency(t); else toast('Выберите таблицу', 'warning'); });
    sb('btnRecalc', () => {
        getTables(activeWorkspace).forEach(td => {
            td.rows.forEach(r => calc(r, td.cols, td));
            recalcFormulas(td);
            render(td);
        });
        toast('Пересчитано', 'success');
    });
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
    sb('btnClear', () => {
        if (!getTables(activeWorkspace).length) return;
        openConfirm('Очистить?', 'Все таблицы и разделители удалятся.', () => {
            workspaces[activeWorkspace] = [];
            idC = 0;
            actId = null;
            renderWorkspace(activeWorkspace);
            toast('Очищено', 'info');
            saveSession();
        });
    });
    sb('btnUndo', undo);

    // Prompt / Confirm
    Q('#promptOk').onclick = () => { if (window._promptOk) window._promptOk(); };
    Q('#promptCancel').onclick = () => { if (window._promptCancel) window._promptCancel(); };
    Q('#promptInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); if (window._promptOk) window._promptOk(); }
        if (e.key === 'Escape') { if (window._promptCancel) window._promptCancel(); }
    });
    Q('#confirmOk').onclick = () => { if (window._confirmOk) window._confirmOk(); };
    Q('#confirmCancel').onclick = () => { if (window._confirmCancel) window._confirmCancel(); };

    // Search
    Q('#searchInput').addEventListener('input', doSearch);
    Q('#searchInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) searchPrev(); else searchNext();
        }
        if (e.key === 'Escape') closeSearch();
    });
    Q('#searchNext').onclick = searchNext;
    Q('#searchPrev').onclick = searchPrev;
    Q('#searchClose').onclick = closeSearch;

    // Toolbar
    document.querySelectorAll('.tb-btn[data-cmd]').forEach(btn => {
        btn.onclick = e => {
            e.preventDefault();
            handleToolbarCmd(btn.dataset.cmd);
        };
    });

    // Color palettes в тулбаре
    const buildPalette = (el, cb) => {
        el.innerHTML = COLOR_PALETTE.map(c => c === null
            ? `<div class="color-swatch none" data-color=""></div>`
            : `<div class="color-swatch" style="background:${c}" data-color="${c}"></div>`
        ).join('');
        el.querySelectorAll('.color-swatch').forEach(s => s.onclick = () => {
            cb(s.dataset.color);
            el.classList.remove('show');
        });
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
    document.addEventListener('click', e => {
        if (!e.target.closest('.color-picker')) {
            document.querySelectorAll('.color-palette').forEach(p => p.classList.remove('show'));
        }
    });

    // Font/size
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

    // Global keydown
    document.addEventListener('keydown', handleGlobalHotkeys);
    document.addEventListener('paste', handleGlobalPaste);
}
