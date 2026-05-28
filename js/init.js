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
    
    // Автосохранение настроек каждые 5 минут
    let autoSaveEnabled = true;
    const autoSaveCheck = document.getElementById('autoSaveCheck');
    if(autoSaveCheck){
        autoSaveCheck.checked = true;
        autoSaveCheck.addEventListener('change', function(){
            autoSaveEnabled = this.checked;
        });
    }
    setInterval(function(){
        if(autoSaveEnabled){
            saveAll();
        }
    }, 300000);
    
    addTable('USD');
    document.addEventListener('keydown', handleGlobalHotkeys);
    document.addEventListener('paste', handleGlobalPaste);
});
