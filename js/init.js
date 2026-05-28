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
    
    // Автосохранение каждые 5 минут
    let autoSaveEnabled = true;
    const autoSaveCheck = document.getElementById('autoSaveCheck');
    if(autoSaveCheck){
        autoSaveCheck.addEventListener('change', function(){
            autoSaveEnabled = this.checked;
        });
    }
    setInterval(function(){
        if(autoSaveEnabled && typeof saveAll === 'function'){
            saveAll();
            console.log('Автосохранение...');
        }
    }, 300000); // 5 минут
    
    addTable('USD');
    document.addEventListener('keydown', handleGlobalHotkeys);
    document.addEventListener('paste', handleGlobalPaste);
});
