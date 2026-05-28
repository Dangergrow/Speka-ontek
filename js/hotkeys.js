// Горячие клавиши

const defaultHotkeys={addRow:'A',delRow:'D',addCol:'C',delCol:'X',recalc:'R',paste:'V',load:'O',newRUB:'1',newUSD:'2',dup:'U',clear:'DELETE',find:'F',replace:'H',undo:'Z',save:'S'};
let hotkeys={...defaultHotkeys};
const keyLabels={addRow:'Добавить строку',delRow:'Удалить строку',addCol:'Добавить колонку',delCol:'Удалить колонку',recalc:'Пересчитать',paste:'Вставить',load:'Загрузить',newRUB:'Новая RUB',newUSD:'Новая USD',dup:'Дублировать',clear:'Очистить',find:'Найти',replace:'Заменить',undo:'Отменить',save:'Сохранить'};

function findHotkeyConflict(key,excludeHk){
    for(const[k,v]of Object.entries(hotkeys)){if(k!==excludeHk&&v===key)return k;}
    return null;
}

function renderHotkeyList(){
    const container=document.getElementById('hotkeyList');if(!container)return;
    container.innerHTML=Object.keys(defaultHotkeys).map(k=>{
        const key=hotkeys[k]||'';
        const conflict=key&&findHotkeyConflict(key,k);
        return `<div class="hotkey-row"><span class="hk-label">${keyLabels[k]||k}</span><span class="hk-current${!key?' conflict':''}" data-hk="${k}">${hkDisplay(key)}</span></div>`;
    }).join('');
    container.querySelectorAll('.hk-current').forEach(el=>{el.addEventListener('click',()=>startRecording(el));});
}

function startRecording(el){
    if(recordingKey){recordingKey.classList.remove('recording','conflict');}
    recordingKey=el;recordingHk=el.dataset.hk;el.classList.add('recording');el.textContent='...';
    const handler=e=>{
        e.preventDefault();e.stopPropagation();
        let key=e.key.toUpperCase();
        if(key==='DELETE'||key==='DEL')key='DELETE';
        if(key==='CONTROL'||key==='SHIFT'||key==='ALT')return;
        if(key.length===1&&e.ctrlKey)key='CTRL+'+key;
        const conflict=findHotkeyConflict(key,recordingHk);
        if(conflict&&conflict!==recordingHk){
            if(!confirm(`Клавиша «${hkDisplay(key)}» уже назначена на «${keyLabels[conflict]}».\n\nПереназначить? (снимется с «${keyLabels[conflict]}»)`)){
                el.textContent=hkDisplay(hotkeys[recordingHk]||'');
                el.classList.remove('recording','conflict');
                recordingKey=null;recordingHk=null;
                document.removeEventListener('keydown',handler);return;
            }
            hotkeys[conflict]='';
        }
        hotkeys[recordingHk]=key;el.textContent=hkDisplay(key);
        el.classList.remove('recording','conflict');recordingKey=null;recordingHk=null;
        saveAll();updateAllHKDisplays();document.removeEventListener('keydown',handler);
        toast(`«${keyLabels[recordingHk]}» → ${hkDisplay(key)}`);
    };
    document.addEventListener('keydown',handler);
}

function resetHotkeys(){hotkeys={...defaultHotkeys};saveAll();updateAllHKDisplays();toast('Сброшено к заводским');}

// Привязка кнопки сброса
document.getElementById('btnResetHotkeys').addEventListener('click',resetHotkeys);