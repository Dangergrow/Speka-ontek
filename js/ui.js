// UI - интерфейс
const RU={'Ф':'A','А':'A','В':'D','Д':'D','С':'C','Ц':'C','Ч':'X','Х':'X','К':'R','Р':'R','М':'V','Ж':'V','Щ':'O','О':'O','Г':'U','У':'U','Ы':'S','Я':'Z'};
let theme='light',colorTheme='blue';
const defaultHotkeys={addRow:'A',delRow:'D',addCol:'C',delCol:'X',recalc:'R',paste:'V',load:'O',newRUB:'1',newUSD:'2',dup:'U',clear:'DELETE',find:'F',replace:'H',undo:'Z',save:'S'};
let hotkeys={...defaultHotkeys};
const keyLabels={addRow:'Добавить строку',delRow:'Удалить строку',addCol:'Добавить колонку',delCol:'Удалить колонку',recalc:'Пересчитать',paste:'Вставить',load:'Загрузить',newRUB:'Новая RUB',newUSD:'Новая USD',dup:'Дублировать',clear:'Очистить',find:'Найти',replace:'Заменить',undo:'Отменить',save:'Сохранить'};
let recordingKey=null,recordingHk=null;

function hkDisplay(key){if(!key)return'—';if(key==='DELETE')return'Del';return key;}

function saveAll(){try{const s={ui:uiMode,theme,color:colorTheme,hotkeys};localStorage.setItem('ontek_settings',JSON.stringify(s));}catch(e){}}
function loadAll(){try{const s=JSON.parse(localStorage.getItem('ontek_settings'));if(s){uiMode=s.ui||'v1';theme=s.theme||'light';colorTheme=s.color||'blue';if(s.hotkeys)hotkeys=s.hotkeys;}}catch(e){}}
loadAll();

function updateAllHKDisplays(){
    document.querySelectorAll('.hk[data-hk]').forEach(el=>{const k=el.dataset.hk;if(hotkeys[k])el.textContent=hkDisplay(hotkeys[k]);});
    document.querySelectorAll('.s-hotkey[data-hk]').forEach(el=>{const k=el.dataset.hk;if(hotkeys[k])el.textContent=hkDisplay(hotkeys[k]);});
    if(typeof renderHotkeyList==='function')renderHotkeyList();
}

function applyAllSettings(){
    document.body.classList.toggle('dark',theme==='dark');
    Q('#btnTheme').textContent=theme==='dark'?'☀️':'🌙';
    document.body.className=document.body.className.replace(/theme-\w+/g,'');
    document.body.classList.add('theme-'+colorTheme);
    Q('#uiV1').classList.toggle('active',uiMode==='v1');
    Q('#uiV2').classList.toggle('active',uiMode==='v2');
    Q('#toolbarV1').style.display=uiMode==='v1'?'block':'none';
    Q('#tablesAreaV1').style.display=uiMode==='v1'?'block':'none';
    Q('#layoutV2').classList.toggle('active',uiMode==='v2');
    document.querySelectorAll('.theme-card').forEach(c=>c.classList.toggle('active',c.dataset.theme===colorTheme));
    updateAllHKDisplays();
    saveAll();
}
applyAllSettings();

function switchUI(mode){uiMode=mode;applyAllSettings();if(mode==='v2')reRenderAll();}
function toggleTheme(){theme=theme==='light'?'dark':'light';applyAllSettings();}
function setColorTheme(t){colorTheme=t;applyAllSettings();}

const themes=[
    {id:'blue',name:'Синяя',desc:'Классический синий',gradient:'linear-gradient(135deg,#3b82f6,#6366f1)',letter:'S'},
    {id:'green',name:'Зелёная',desc:'Природная свежесть',gradient:'linear-gradient(135deg,#10b981,#059669)',letter:'G'},
    {id:'purple',name:'Фиолетовая',desc:'Креативный стиль',gradient:'linear-gradient(135deg,#8b5cf6,#7c3aed)',letter:'P'},
    {id:'orange',name:'Оранжевая',desc:'Тёплая энергия',gradient:'linear-gradient(135deg,#f59e0b,#ea580c)',letter:'O'}
];

function renderThemeOptions(){
    const container=Q('#themeOptions');if(!container)return;
    container.innerHTML=themes.map(t=>`<div class="theme-card${t.id===colorTheme?' active':''}" data-theme="${t.id}"><div class="theme-preview" style="background:${t.gradient}">${t.letter}</div><div class="theme-name">${t.name}</div><div class="theme-desc">${t.desc}</div></div>`).join('');
    container.querySelectorAll('.theme-card').forEach(c=>c.onclick=()=>setColorTheme(c.dataset.theme));
}

function toggleSection(toggleId,sectionId){Q(toggleId).classList.toggle('open');Q(sectionId).classList.toggle('open');}

function hideCtx(){Q('#ctxMenu').style.display='none';}
Q('#ctxMenu').addEventListener('click',e=>{
    const item=e.target.closest('.ctx-item');if(!item)return;const a=item.dataset.action;
    hideCtx();const td=T.find(t=>t.id===ctxD.t);if(!td&&!['paste','dupTable'].includes(a))return;
    if(td)setAct(td.id);
    switch(a){case'addRowAbove':if(td&&ctxD.r!==null)insRowAbove(td,ctxD.r);break;case'addRowBelow':if(td&&ctxD.r!==null)insRowBelow(td,ctxD.r);break;case'delRow':if(td&&ctxD.r!==null)delRow(td,ctxD.r);break;case'renameCol':if(td&&ctxD.c!==null)renameCol(td,ctxD.c);break;case'addColBefore':if(td&&ctxD.c!==null)insCol(td,ctxD.c);break;case'addColAfter':if(td&&ctxD.c!==null)insCol(td,ctxD.c+1);break;case'delCol':if(td&&ctxD.c!==null)delCol(td,ctxD.c);break;case'paste':paste();break;case'dupTable':if(td)dupTable(td);else dupTable();break;case'delTable':if(td&&T.length>1){td.card.remove();T.splice(T.indexOf(td),1);if(actId===td.id)actId=T.length?T[0].id:null;upEmpty();}break;}
});
document.addEventListener('click',e=>{if(!Q('#ctxMenu').contains(e.target))hideCtx();});

function findInTable(){const td=active();if(!td)return toast('Выберите таблицу!',0);const q=prompt('Что искать:','');if(!q||!q.trim())return;const res=[];td.rows.forEach((r,ri)=>{r.forEach((v,ci)=>{if(String(v??'').toLowerCase().includes(q.toLowerCase()))res.push({ri,ci});});});if(!res.length)return toast('Ничего не найдено',false);toast(`Найдено: ${res.length}`);let idx=0;hlRes(td,res[idx]);window._nr=()=>{idx=(idx+1)%res.length;hlRes(td,res[idx]);};}
function hlRes(td,res){const rows=td.el.querySelectorAll('tbody tr:not(.tot)');if(res.ri<rows.length){const tds=rows[res.ri].querySelectorAll('td:not(.rn):not(.act-cell)');if(res.ci<tds.length){const inp=tds[res.ci].querySelector('input');if(inp){inp.focus();inp.select();rows[res.ri].classList.add('sel');}}}}
function replaceInTable(){const td=active();if(!td)return toast('Выберите таблицу!',0);const q=prompt('Что заменить:','');if(!q||!q.trim())return;const rp=prompt('На что:','');if(rp===null)return;let c=0;td.rows.forEach(r=>{for(let i=0;i<r.length;i++){if(String(r[i]??'').toLowerCase().includes(q.toLowerCase())){r[i]=String(r[i]??'').replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),rp);c++;}}});render(td);toast(`Заменено: ${c}`);}

async function checkUpdate(){toast('Проверка обновлений...');try{const r=await fetch('https://raw.githubusercontent.com/Dangergrow/Speka-ontek/main/version.json',{cache:'no-cache'});const d=await r.json();if(d.version>'4.2.0'){if(confirm(`🆕 Версия ${d.version}!\n\n${d.notes||''}\n\nОбновить?`)){if(window.pywebview&&window.pywebview.api){const result=JSON.parse(await window.pywebview.api.apply_update());if(result.success){toast('✅ Обновлено!');setTimeout(()=>location.reload(),1500);}else toast('Ошибка',false);}}}else toast('✅ Последняя версия');}catch(e){toast('Ошибка проверки',false);}}

// Привязка кнопок
setTimeout(()=>{
    Q('#uiV1').onclick=()=>switchUI('v1');Q('#uiV2').onclick=()=>switchUI('v2');
    Q('#btnTheme').onclick=toggleTheme;Q('#btnUpdate').onclick=checkUpdate;
    Q('#fileInput').onchange=e=>{if(e.target.files[0]){if(typeof load!=='undefined')load(e.target.files[0]);e.target.value='';}};
    
    // Настройки
    Q('#btnSettings').onclick=()=>{Q('#settingsModal').classList.add('show');renderHotkeyList();};
    Q('#btnCloseSettings').onclick=()=>Q('#settingsModal').classList.remove('show');
    Q('#settingsModal').onclick=e=>{if(e.target===Q('#settingsModal'))Q('#settingsModal').classList.remove('show');};
    Q('#hkToggle').onclick=()=>toggleSection('hkToggle','hkSection');
    Q('#aboutToggle').onclick=()=>toggleSection('aboutToggle','aboutSection');
    Q('#btnResetHotkeys').onclick=()=>{hotkeys={...defaultHotkeys};saveAll();updateAllHKDisplays();toast('Сброшено');};
    
    // Цветовые темы
    Q('#btnColorTheme').onclick=()=>{Q('#colorThemeModal').classList.add('show');renderThemeOptions();};
    Q('#btnCloseColorTheme').onclick=()=>Q('#colorThemeModal').classList.remove('show');
    Q('#colorThemeModal').onclick=e=>{if(e.target===Q('#colorThemeModal'))Q('#colorThemeModal').classList.remove('show');};
    
    // V1 кнопки
    const bind=(id,fn)=>{const el=Q(id);if(el)el.onclick=fn;};
    bind('#btnAddRow1',()=>{const t=active();t?addRowEnd(t):toast('Выберите таблицу!',0);});
    bind('#btnDelRow1',()=>{const t=active();t?delRowEnd(t):toast('Выберите таблицу!',0);});
    bind('#btnAddCol1',()=>{const t=active();t?addColEnd(t):toast('Выберите таблицу!',0);});
    bind('#btnDelCol1',()=>{const t=active();t?delColEnd(t):toast('Выберите таблицу!',0);});
    bind('#btnRecalc1',()=>{T.forEach(td=>{td.rows.forEach(r=>calc(r,td.cols));updTot(td);});toast('Пересчитано');});
    bind('#btnPaste1',paste);bind('#btnNewRUB1',()=>addTable('RUB'));bind('#btnNewUSD1',()=>addTable('USD'));
    bind('#btnSave1',save);bind('#btnLoad1',loadViaDialog);
    bind('#btnClear1',()=>{if(!T.length)return;if(confirm('Удалить все?')){getArea().innerHTML='';T.length=0;idC=0;actId=null;hist.length=0;upEmpty();toast('Очищено');}});
    bind('#btnDup1',()=>dupTable());bind('#btnUndo1',undo);bind('#btnFind1',findInTable);bind('#btnReplace1',replaceInTable);
    
    // V2 кнопки
    bind('#btnAddRow2',()=>{const t=active();t?addRowEnd(t):toast('Выберите таблицу!',0);});
    bind('#btnDelRow2',()=>{const t=active();t?delRowEnd(t):toast('Выберите таблицу!',0);});
    bind('#btnAddCol2',()=>{const t=active();t?addColEnd(t):toast('Выберите таблицу!',0);});
    bind('#btnDelCol2',()=>{const t=active();t?delColEnd(t):toast('Выберите таблицу!',0);});
    bind('#btnRecalc2',()=>{T.forEach(td=>{td.rows.forEach(r=>calc(r,td.cols));updTot(td);});toast('Пересчитано');});
    bind('#btnPaste2',paste);bind('#btnNewRUB2',()=>addTable('RUB'));bind('#btnNewUSD2',()=>addTable('USD'));
    bind('#btnSave2',save);bind('#btnLoad2',loadViaDialog);
    bind('#btnClear2',()=>{if(!T.length)return;if(confirm('Удалить все?')){getArea().innerHTML='';T.length=0;idC=0;actId=null;hist.length=0;upEmpty();toast('Очищено');}});
    bind('#btnDup2',()=>dupTable());bind('#btnUndo2',undo);bind('#btnFind2',findInTable);bind('#btnReplace2',replaceInTable);
},100);

// Горячие клавиши
function findHotkeyConflict(key,excludeHk){for(const[k,v]of Object.entries(hotkeys)){if(k!==excludeHk&&v===key)return k;}return null;}
function renderHotkeyList(){
    const container=Q('#hotkeyList');if(!container)return;
    container.innerHTML=Object.keys(defaultHotkeys).map(k=>{const key=hotkeys[k]||'';return`<div class="hotkey-row"><span class="hk-label">${keyLabels[k]||k}</span><span class="hk-current${!key?' conflict':''}" data-hk="${k}">${hkDisplay(key)}</span></div>`;}).join('');
    container.querySelectorAll('.hk-current').forEach(el=>{el.onclick=()=>startRecording(el);});
}
function startRecording(el){
    if(recordingKey){recordingKey.classList.remove('recording','conflict');}
    recordingKey=el;recordingHk=el.dataset.hk;el.classList.add('recording');el.textContent='...';
    const handler=e=>{e.preventDefault();e.stopPropagation();let key=e.key.toUpperCase();if(key==='DELETE'||key==='DEL')key='DELETE';if(key==='CONTROL'||key==='SHIFT'||key==='ALT')return;if(key.length===1&&e.ctrlKey)key='CTRL+'+key;const conflict=findHotkeyConflict(key,recordingHk);if(conflict&&conflict!==recordingHk){if(!confirm(`Клавиша «${hkDisplay(key)}» уже назначена на «${keyLabels[conflict]}».\n\nПереназначить?`)){el.textContent=hkDisplay(hotkeys[recordingHk]||'');el.classList.remove('recording','conflict');recordingKey=null;recordingHk=null;document.removeEventListener('keydown',handler);return;}hotkeys[conflict]='';}hotkeys[recordingHk]=key;el.textContent=hkDisplay(key);el.classList.remove('recording','conflict');recordingKey=null;recordingHk=null;saveAll();updateAllHKDisplays();document.removeEventListener('keydown',handler);toast(`«${keyLabels[recordingHk]}» → ${hkDisplay(key)}`);};
    document.addEventListener('keydown',handler);
}