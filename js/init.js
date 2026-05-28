document.addEventListener('DOMContentLoaded', async function() {
    if(typeof ExcelJS==='undefined'||typeof XLSX==='undefined'){
        document.body.innerHTML='<h1 style="text-align:center;margin-top:100px;">Ошибка загрузки</h1>';
        return;
    }
    
    // Ждём загрузку настроек
    await loadAll();
    
    buildWorkspaces();
    buildSidebarV2();
    applyAllSettings();
    buildShortcuts();
    bindAllEvents();
    loadRates();
    addTable('USD');
    
    document.addEventListener('keydown', handleGlobalHotkeys);
    document.addEventListener('paste', handleGlobalPaste);
    
    console.log('ONTEK v4.5.0 готов');
});
