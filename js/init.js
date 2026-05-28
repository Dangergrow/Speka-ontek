document.addEventListener('DOMContentLoaded', function() {
    if(typeof ExcelJS==='undefined'||typeof XLSX==='undefined'){
        document.body.innerHTML='<h1 style="text-align:center;margin-top:100px;">Ошибка загрузки</h1>';
        return;
    }
    loadAll();              // 1. Загружаем настройки
    buildWorkspaces();       // 2. Строим интерфейс
    buildSidebarV2();        // 3. Строим сайдбар
    applyAllSettings();      // 4. Применяем загруженные настройки
    buildShortcuts();        // 5. Подсказки
    bindAllEvents();         // 6. Привязываем события
    loadRates();             // 7. Курсы валют
    addTable('USD');         // 8. Создаём таблицу
    document.addEventListener('keydown', handleGlobalHotkeys);
    document.addEventListener('paste', handleGlobalPaste);
});
