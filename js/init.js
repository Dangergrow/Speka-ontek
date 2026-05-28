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
    
    // Строим интерфейс
    buildToolbarV1();
    buildSidebarV2();
    
    // Привязываем события (кнопки, модалки)
    bindAllEvents();
    
    // Создаём первую таблицу
    addTable('USD');
    
    // Обновляем отображение горячих клавиш
    updateAllHKDisplays();
});
