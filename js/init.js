document.addEventListener('DOMContentLoaded', function() {
    if(typeof ExcelJS==='undefined'||typeof XLSX==='undefined'){
        document.body.innerHTML='<h1>Ошибка загрузки библиотек</h1>';
        return;
    }
    
    // Строим интерфейс
    buildWorkspaces();
    buildSidebarV2();
    
    // Загружаем настройки и применяем
    loadSettings().then(function(){
        applyAllSettings();
    });
    
    // Остальное
    buildShortcuts();
    bindAllEvents();
    loadRates();
    addTable('USD');
    
    document.addEventListener('keydown', handleGlobalHotkeys);
    document.addEventListener('paste', handleGlobalPaste);
});
