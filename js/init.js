document.addEventListener('DOMContentLoaded', async function() {
    if(typeof ExcelJS==='undefined'||typeof XLSX==='undefined'){
        document.body.innerHTML='<h1 style="text-align:center;margin-top:100px;">Ошибка загрузки</h1>';
        return;
    }
    
    await loadAll();
    buildWorkspaces();
    buildSidebarV2();
    applyAllSettings();
    buildShortcuts();
    bindAllEvents();
    loadRates();
    
    // Сохранение настроек при закрытии программы
    window.addEventListener('beforeunload', function() {
        saveAll();
    });
    
    addTable('USD');
    document.addEventListener('keydown', handleGlobalHotkeys);
    document.addEventListener('paste', handleGlobalPaste);
});
