document.addEventListener('DOMContentLoaded', function() {
    if(typeof ExcelJS==='undefined'||typeof XLSX==='undefined'){
        document.body.innerHTML='<h1>Ошибка загрузки библиотек</h1>';
        return;
    }
    
    // Шаг 1: Строим интерфейс
    buildWorkspaces();
    buildSidebarV2();
    
    // Шаг 2: Загружаем настройки и применяем
    loadSettings().then(function(){
        applyAllSettings();
    });
    
    // Шаг 3: Биндим события (после того как сайдбар построен)
    bindAllEvents();
    
    // Шаг 4: Всё остальное
    buildShortcuts();
    loadRates();
    addTable('USD');
    
    // Глобальные обработчики
    document.addEventListener('keydown', handleGlobalHotkeys);
    document.addEventListener('paste', handleGlobalPaste);
});
