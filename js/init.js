document.addEventListener('DOMContentLoaded', function() {
    if(typeof ExcelJS==='undefined'||typeof XLSX==='undefined'){
        document.body.innerHTML='<h1 style="text-align:center;margin-top:100px;">Ошибка загрузки библиотек</h1>';
        return;
    }
    loadAll();
    applyAllSettings();
    buildToolbarV1();
    buildSidebarV2();
    buildShortcuts();
    bindAllEvents();
    addTable('USD');
    updateAllHKDisplays();
});
