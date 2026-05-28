// Инициализация после загрузки всех функций
document.addEventListener('DOMContentLoaded', function() {
    // Проверка что библиотеки загружены
    if(typeof ExcelJS==='undefined'||typeof XLSX==='undefined'){
        document.body.innerHTML='<h1 style="text-align:center;margin-top:100px;">Ошибка загрузки библиотек</h1>';
        return;
    }
    
    // Загружаем настройки
    loadAll();
    applyAllSettings();
    
    // Строим тулбар V1
    buildToolbarV1();
    
    // Строим сайдбар V2
    buildSidebarV2();
    
    // Привязываем события
    bindAllEvents();
    
    // Рендерим горячие клавиши
    renderHotkeyList();
    renderThemeOptions();
    
    // Горячие клавиши
    document.addEventListener('keydown', handleGlobalHotkeys);
    document.addEventListener('paste', handleGlobalPaste);
    
    // Создаём первую таблицу
    addTable('USD');
    
    // Обновляем отображение клавиш
    updateAllHKDisplays();
});
