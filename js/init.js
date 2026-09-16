document.addEventListener('DOMContentLoaded', function () {
    if (typeof ExcelJS === 'undefined' || typeof XLSX === 'undefined') {
        document.body.innerHTML = '<div style="padding:40px;text-align:center;font-family:sans-serif"><h1>Ошибка загрузки библиотек</h1></div>';
        return;
    }
    loadTemplates();
    buildWorkspaces();
    buildSidebarV2();
    loadSettings().then(() => { applyAllSettings(); });
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
    setTimeout(() => { toast('ONTEK v6.1 готов', 'info', 2000); }, 500);

    setInterval(saveSession, 5000);
    window.addEventListener('beforeunload', saveSession);
});
