document.addEventListener('DOMContentLoaded', function () {
    if (typeof ExcelJS === 'undefined' || typeof XLSX === 'undefined') {
        document.body.innerHTML = '<div style="padding:40px;text-align:center;font-family:sans-serif"><h1>Ошибка загрузки библиотек</h1><p>Проверьте наличие exceljs.min.js и xlsx.full.min.js</p></div>';
        return;
    }

    buildWorkspaces();
    buildSidebarV2();

    loadSettings().then(() => {
        applyAllSettings();
    });

    bindAllEvents();
    loadRates();
    addTable('USD');

    setStatus('Готово');

    setTimeout(() => {
        toast('ONTEK v5.0 готов к работе', 'info', 2000);
    }, 500);
});
