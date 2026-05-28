document.addEventListener('DOMContentLoaded', function() {
    if(typeof ExcelJS==='undefined'||typeof XLSX==='undefined'){
        document.body.innerHTML='<h1 style="text-align:center;margin-top:100px;">Ошибка загрузки</h1>';
        return;
    }
    loadAll();
    buildWorkspaces();
    buildSidebarV2();
    applyAllSettings();
    buildShortcuts();
    bindAllEvents();
    loadRates();
    addTable('USD');
});
