// ==================== ONTEK v4.8.0 ====================
const T=[],DC=['Артикул','Наименование','Ко-во, шт','Цена','Стоимость'];
let idC=0,actId=null,ctxD={t:null,r:null,c:null},hist=[],theme='light',colorTheme='blue',recordingKey=null,recordingHk=null,activeWorkspace=1,currentUSDRate=0,currentEURRate=0;
const workspaces={};for(let i=1;i<=5;i++)workspaces[i]=[];
const Q=s=>document.querySelector(s);
const QA=s=>document.querySelectorAll(s);
const RU={'Ф':'A','А':'A','В':'D','Д':'D','С':'C','Ц':'C','Ч':'X','Х':'X','К':'R','Р':'R','М':'V','Ж':'V','Щ':'O','О':'O','Г':'U','У':'U','Ы':'S','Я':'Z','Ь':'DELETE','Т':'DELETE','1':'1','2':'2','3':'3','4':'4','5':'5'};

const defaultHotkeys={addRow:'A',delRow:'D',addCol:'C',delCol:'X',recalc:'R',paste:'V',load:'O',newRUB:'1',newUSD:'2',dup:'U',clear:'DELETE',undo:'Z',save:'S',convert:'K'};
let hotkeys={...defaultHotkeys};
const keyLabels={addRow:'Добавить строку',delRow:'Удалить строку',addCol:'Добавить колонку',delCol:'Удалить колонку',recalc:'Пересчитать',paste:'Вставить',load:'Загрузить',newRUB:'Новая RUB',newUSD:'Новая USD',dup:'Дублировать',clear:'Очистить',undo:'Отменить',save:'Сохранить',convert:'Конвертировать валюту'};
const themes=[{id:'blue',name:'Синяя',desc:'Классический',gradient:'linear-gradient(135deg,#3b82f6,#6366f1)',letter:'S'},{id:'green',name:'Зелёная',desc:'Природная',gradient:'linear-gradient(135deg,#10b981,#059669)',letter:'G'},{id:'purple',name:'Фиолетовая',desc:'Креативная',gradient:'linear-gradient(135deg,#8b5cf6,#7c3aed)',letter:'P'},{id:'orange',name:'Оранжевая',desc:'Тёплая',gradient:'linear-gradient(135deg,#f59e0b,#ea580c)',letter:'O'}];

// ==================== ПРАЙС-ЛИСТ ====================
let priceData = null;
let priceSearchResults = [];
let selectedPriceRow = null;
let priceViewCtxRow = null;

const PRICE_COLUMN_PATTERNS = [
    { keywords: ['артикул','article','арт'], id: 'article', label: 'Артикул' },
    { keywords: ['наименование','название','name','наименование товара','товар'], id: 'name', label: 'Наименование' },
    { keywords: ['мега','мегадистрибутор','мега дистрибутор'], id: 'mega', label: 'Мега' },
    { keywords: ['дистрибутор','дистрибьютор','distributor'], id: 'distributor', label: 'Дистрибутор' },
    { keywords: ['партнер','партнёр','partner','регистрация'], id: 'partner', label: 'Партнер (регистрация), USD' },
    { keywords: ['дилер','диллер','dealer'], id: 'dealer', label: 'Дилер, USD' },
    { keywords: ['мрц','mrp'], id: 'mrp', label: 'МРЦ, USD' },
    { keywords: ['ррц','rrp','рекомендованная'], id: 'rrp', label: 'РРЦ, USD' }
];

// ==================== УТИЛИТЫ ====================
function toast(m,ok=true){const o=Q('.toast');if(o)o.remove();const d=document.createElement('div');d.className='toast '+(ok?'toast-ok':'toast-err');d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),2500);}
function active(){const ws=workspaces[activeWorkspace];if(actId===null&&ws.length)actId=ws[0].id;return ws.find(t=>t.id===actId)||null;}
function setAct(id){actId=id;document.querySelectorAll('.card').forEach(c=>c.classList.toggle('active',+c.dataset.tid===actId));}
function getArea(){return Q('#workspaceArea_'+activeWorkspace);}
function upEmpty(){const a=getArea();const e=a.querySelector('.empty');if(!workspaces[activeWorkspace].length&&!e)a.innerHTML='<div class="empty">Создайте таблицу — <b>Shift+1</b> RUB или <b>Shift+2</b> USD</div>';else if(workspaces[activeWorkspace].length&&e)e.remove();}
function ci(cols,kw){return cols.findIndex(c=>c.toLowerCase().includes(kw.toLowerCase()));}
function cln(s){if(!s)return'';let x=String(s).trim().replace(/\s/g,'').replace(/,/g,'.').replace(/[^\d.\-]/g,'');const p=x.split('.');if(p.length>2)x=p[0]+'.'+p.slice(1).join('.');if(x.includes('-')&&x.indexOf('-')>0)x=x.replace(/-/g,'');return x;}
function pn(v){const c=cln(v);return(c===''||c==='-'||c==='.')?NaN:parseFloat(c);}
function getQi(cols){return ci(cols,'Ко-во')>=0?ci(cols,'Ко-во'):ci(cols,'Количество');}
function calc(r,cols){const qi=getQi(cols),pi=ci(cols,'Цена'),ti=ci(cols,'Стоимость');if(qi>=0&&pi>=0&&ti>=0)r[ti]=((pn(r[qi])||0)*(pn(r[pi])||0)).toFixed(2);}
function sumT(td){const ti=ci(td.cols,'Стоимость');return ti<0?0:td.rows.reduce((s,r)=>s+(pn(r[ti])||0),0);}
function hdrs(cols,cur){return cols.map(c=>c.toLowerCase().startsWith('цена')?`Цена, ${cur} с НДС`:c.toLowerCase().startsWith('стоимость')?`Стоимость, ${cur} с НДС`:c);}
function cA(r,c){let s='';while(c>0){c--;s=String.fromCharCode(65+(c%26))+s;c=Math.floor(c/26);}return s+r;}
function ccl(n){const l=n.toLowerCase();if(l.includes('артикул'))return'col-article';if(l.includes('наименование'))return'col-name';if(l.includes('ко-во')||l.includes('количество'))return'col-qty';if(l.startsWith('цена'))return'col-price';if(l.startsWith('стоимость'))return'col-total';return'col-default';}
function hkDisplay(key){if(!key)return'—';if(key==='DELETE')return'Del';return key;}
function normalizeStr(s){return String(s||'').toLowerCase().replace(/[\s\-_.,\/\\]/g,'').trim();}
function isExactMatch(a,b){return normalizeStr(a)===normalizeStr(b);}
function isPartialMatch(a,b){return normalizeStr(a).includes(normalizeStr(b))||normalizeStr(b).includes(normalizeStr(a));}
function isEmptyRow(row){return !row||row.every(c=>String(c??'').trim()==='');}

function saveNow(){const s={theme:theme,color:colorTheme,hotkeys:hotkeys,activeWorkspace:activeWorkspace};const json=JSON.stringify(s);localStorage.setItem('ontek_settings',json);if(window.pywebview&&window.pywebview.api){window.pywebview.api.save_settings(json).catch(e=>console.error(e));}}

async function loadSettings(){for(let i=0;i<30;i++){if(window.pywebview&&window.pywebview.api)break;await new Promise(r=>setTimeout(r,100));}if(window.pywebview&&window.pywebview.api){try{const json=await window.pywebview.api.load_settings();if(json&&json!=='{}'){const s=JSON.parse(json);if(s.theme)theme=s.theme;if(s.color)colorTheme=s.color;if(s.hotkeys)hotkeys=s.hotkeys;if(s.activeWorkspace)activeWorkspace=s.activeWorkspace;return;}}catch(e){}}try{const s=JSON.parse(localStorage.getItem('ontek_settings'));if(s){if(s.theme)theme=s.theme;if(s.color)colorTheme=s.color;if(s.hotkeys)hotkeys=s.hotkeys;if(s.activeWorkspace)activeWorkspace=s.activeWorkspace;}}catch(e){}}

function updateAllHKDisplays(){document.querySelectorAll('.s-hotkey[data-hk]').forEach(el=>{const k=el.dataset.hk;if(hotkeys[k])el.textContent='Shift+'+hkDisplay(hotkeys[k]);});buildShortcuts();}
function applyAllSettings(){document.body.classList.toggle('dark',theme==='dark');document.body.className=document.body.className.replace(/theme-\w+/g,'');document.body.classList.add('theme-'+colorTheme);const tb=Q('#btnTheme');if(tb)tb.textContent=theme==='dark'?'☀️':'🌙';document.querySelectorAll('.workspace-tab').forEach(t=>t.classList.toggle('active',+t.dataset.ws===activeWorkspace));document.querySelectorAll('.workspace-panel').forEach(p=>p.classList.toggle('active',+p.dataset.ws===activeWorkspace));document.querySelectorAll('.theme-card').forEach(c=>c.classList.toggle('active',c.dataset.theme===colorTheme));updateAllHKDisplays();}
function switchWorkspace(ws){activeWorkspace=ws;actId=null;applyAllSettings();saveNow();}
function toggleTheme(){theme=theme==='light'?'dark':'light';applyAllSettings();saveNow();}
function setColorTheme(t){colorTheme=t;applyAllSettings();saveNow();}

function convertCurrency(td){
    if(currentUSDRate<=0){toast('Курс USD не загружен',false);return;}
    const oldCurrency=td.currency;const newCurrency=oldCurrency==='USD'?'RUB':'USD';
    const priceCol=ci(td.cols,'Цена');
    if(priceCol>=0){td.rows.forEach(row=>{const price=parseFloat(row[priceCol]);if(!isNaN(price)){if(oldCurrency==='USD'){row[priceCol]=(price*currentUSDRate).toFixed(2);}else{row[priceCol]=(price/currentUSDRate).toFixed(2);}}});}
    td.currency=newCurrency;td.rows.forEach(r=>calc(r,td.cols));render(td);saveNow();
    toast(`✅ ${oldCurrency} → ${newCurrency} (курс: ${currentUSDRate.toFixed(2)} ₽)`);
}

async function loadRates(){
    const rates=Q('#ratesBar');
    const showFallback=()=>{if(rates)rates.textContent='💵 USD: — ₽  💶 EUR: — ₽';};
    try{
        const r=await fetch('https://www.cbr-xml-daily.ru/daily_json.js',{cache:'no-cache'});
        if(!r.ok)throw new Error('HTTP '+r.status);
        const d=await r.json();
        currentUSDRate=d.Valute.USD.Value;
        currentEURRate=d.Valute.EUR.Value;
        const usdUp=currentUSDRate>d.Valute.USD.Previous;
        const eurUp=currentEURRate>d.Valute.EUR.Previous;
        if(rates)rates.innerHTML=`💵 USD: <span class="${usdUp?'up':'down'}">${currentUSDRate.toFixed(2)} ₽</span> &nbsp;💶 EUR: <span class="${eurUp?'up':'down'}">${currentEURRate.toFixed(2)} ₽</span>`;
    }catch(e1){
        try{
            const r2=await fetch('https://api.exchangerate-api.com/v4/latest/USD',{cache:'no-cache'});
            if(!r2.ok)throw new Error('HTTP '+r2.status);
            const d2=await r2.json();
            currentUSDRate=d2.rates.RUB;
            currentEURRate=d2.rates.RUB/(d2.rates.USD/d2.rates.EUR);
            if(rates)rates.innerHTML=`💵 USD: <span>${currentUSDRate.toFixed(2)} ₽</span> &nbsp;💶 EUR: <span>${currentEURRate.toFixed(2)} ₽</span>`;
        }catch(e2){showFallback();}
    }
}

// ==================== САЙДБАР ====================
function buildSidebarV2(){const sb=Q('#sidebarV2');if(!sb)return;const s=[
{t:'Таблица',b:[
    {id:'btnAddRow',c:'sb-blue',i:'＋',x:'Добавить строку',h:'addRow'},
    {id:'btnDelRow',c:'sb-blue',i:'－',x:'Удалить строку',h:'delRow'},
    {id:'btnAddCol',c:'sb-blue',i:'＋',x:'Добавить колонку',h:'addCol'},
    {id:'btnDelCol',c:'sb-blue',i:'－',x:'Удалить колонку',h:'delCol'}
]},
{t:'Прайс-лист',b:[
    {id:'btnLoadPrice',c:'sb-orange',i:'📥',x:'Загрузить прайс',h:null},
    {id:'btnViewPrice',c:'sb-orange',i:'📋',x:'Показать прайс',h:null},
    {id:'btnSearchPrice',c:'sb-orange',i:'🔎',x:'Поиск в прайсе',h:null}
]},
{t:'Действия',b:[
    {id:'btnConvert',c:'sb-teal',i:'💱',x:'Конвертировать',h:'convert'},
    {id:'btnPaste',c:'sb-teal',i:'📋',x:'Вставить',h:'paste'},
    {id:'btnDup',c:'sb-teal',i:'📑',x:'Дублировать',h:'dup'},
    {id:'btnRecalc',c:'sb-teal',i:'🔄',x:'Пересчёт',h:'recalc'},
    {id:'btnFind',c:'sb-teal',i:'🔍',x:'Найти в таблице',h:'find'}
]},
{t:'Создать',b:[
    {id:'btnNewRUB',c:'sb-green',i:'🆕',x:'Новая RUB',h:'newRUB'},
    {id:'btnNewUSD',c:'sb-green',i:'🆕',x:'Новая USD',h:'newUSD'}
]},
{t:'Файл',b:[
    {id:'btnLoad',c:'sb-slate',i:'📂',x:'Открыть',h:'load'},
    {id:'btnSave',c:'sb-slate',i:'💾',x:'Сохранить',h:'save'},
    {id:'btnClear',c:'sb-slate',i:'🗑',x:'Очистить',h:'clear'},
    {id:'btnUndo',c:'sb-slate',i:'↩',x:'Отменить',h:'undo'}
]}
];sb.innerHTML=s.map(x=>`<div class="sidebar-section"><div class="sidebar-section-title">${x.t}</div>${x.b.map(b=>`<button class="sidebar-btn ${b.c}" id="${b.id}"><span class="s-icon">${b.i}</span> ${b.x} ${b.h?`<span class="s-hotkey" data-hk="${b.h}">Shift+${hkDisplay(hotkeys[b.h])}</span>`:''}</button>`).join('')}</div>`).join('');}

// ==================== РАБОЧИЕ ОБЛАСТИ ====================
function buildWorkspaces(){const tabs=Q('#workspaceTabs'),container=Q('#workspaceContainer');tabs.innerHTML='';container.innerHTML='';for(let i=1;i<=5;i++){tabs.innerHTML+=`<div class="workspace-tab${i===activeWorkspace?' active':''}" data-ws="${i}" onclick="switchWorkspace(${i})">Окно ${i}</div>`;container.innerHTML+=`<div class="workspace-panel${i===activeWorkspace?' active':''}" data-ws="${i}"><div class="tables-area" id="workspaceArea_${i}"><div class="empty">Создайте таблицу — <b>Shift+1</b> RUB или <b>Shift+2</b> USD</div></div></div>`;}}

function addTable(cur='RUB'){const ws=workspaces[activeWorkspace];upEmpty();idC++;const td={id:idC,cols:[...DC],rows:[['','','','','']],currency:cur,el:null,card:null};ws.push(td);const a=getArea();const card=buildCardDOM(td);a.appendChild(card);td.card=card;setAct(td.id);render(td);toast(`Таблица ${cur} создана`);}
function dupTable(src){if(!src)src=active();if(!src)return;const ws=workspaces[activeWorkspace];idC++;const td={id:idC,cols:[...src.cols],rows:src.rows.map(r=>[...r]),currency:src.currency,el:null,card:null};ws.push(td);const a=getArea();const card=buildCardDOM(td);a.appendChild(card);td.card=card;render(td);toast('Дублирована');}

function buildCardDOM(td){const card=document.createElement('div');card.className='card';card.dataset.tid=td.id;card.addEventListener('click',e=>{if(!e.target.closest('button')&&!e.target.closest('input'))setAct(td.id);});card.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();const thEl=e.target.closest('thead th:not(.rn)');const trEl=e.target.closest('tbody tr');let ri=null,ci=null;if(thEl){const ths=[...card.querySelectorAll('thead th:not(.rn)')];ci=ths.indexOf(thEl);if(ci>=td.cols.length)ci=null;}if(trEl&&!trEl.classList.contains('tot')){ri=+trEl.dataset.ri;const tdEl=e.target.closest('td:not(.rn):not(.act-cell)');if(tdEl){const tds=[...trEl.querySelectorAll('td:not(.rn):not(.act-cell)')];ci=tds.indexOf(tdEl);if(ci>=td.cols.length)ci=null;}}ctxD={t:td.id,r:ri,c:ci};setAct(td.id);const cm=Q('#ctxMenu');cm.style.display='block';cm.style.left=Math.min(e.clientX,window.innerWidth-220)+'px';cm.style.top=Math.min(e.clientY,window.innerHeight-400)+'px';});const hdr=document.createElement('div');hdr.className='card-hdr';hdr.innerHTML=`<span>📋 ${td.currency} с НДС <span class="badge badge-${td.currency==='USD'?'usd':'rub'}">${td.currency}</span><span class="badge badge-act">Активна</span></span><div class="card-acts"><button class="btn b-outline cur-btn" style="padding:4px 10px;font-size:11px;" title="Конвертировать валюту">${td.currency==='USD'?'💵 USD':'💰 RUB'}</button><button class="btn b-outline dup-btn" style="padding:4px 6px;font-size:11px;">📑</button><button class="btn b-red del-btn" style="padding:4px 10px;font-size:11px;">🗑</button></div>`;hdr.querySelector('.cur-btn').onclick=e=>{e.stopPropagation();convertCurrency(td);};hdr.querySelector('.dup-btn').onclick=e=>{e.stopPropagation();dupTable(td);};hdr.querySelector('.del-btn').onclick=e=>{e.stopPropagation();const ws=workspaces[activeWorkspace];if(ws.length<=1)return toast('Нужна хотя бы одна таблица!',0);card.remove();ws.splice(ws.indexOf(td),1);if(actId===td.id)actId=ws.length?ws[0].id:null;upEmpty();toast('Удалена');};const scr=document.createElement('div');scr.className='scroll';const tbl=document.createElement('table');tbl.innerHTML='<thead><tr></tr></thead><tbody></tbody>';scr.appendChild(tbl);card.appendChild(hdr);card.appendChild(scr);td.el=tbl;return card;}

function render(td){if(!td.el)return;const th=td.el.querySelector('thead tr'),tb=td.el.querySelector('tbody');th.innerHTML='<th class="rn">№</th>'+hdrs(td.cols,td.currency).map((h,i)=>`<th class="${ccl(td.cols[i])}">${h}</th>`).join('')+'<th style="width:44px"></th>';tb.innerHTML='';td.rows.forEach((r,ri)=>{const tr=document.createElement('tr');tr.dataset.ri=ri;const nt=document.createElement('td');nt.className='rn';nt.textContent=ri+1;tr.appendChild(nt);r.forEach((v,ci)=>{const tdEl=document.createElement('td');tdEl.className=ccl(td.cols[ci]);const inp=document.createElement('input');const cn=(td.cols[ci]||'').toLowerCase();if(cn.startsWith('стоимость')){inp.className='total';inp.readOnly=true;}inp.value=v??'';if(!cn.startsWith('стоимость'))inp.className=(cn.includes('ко-во')||cn.includes('количество'))?'qty':cn.startsWith('цена')?'price':'';if(cn.includes('наименование')){inp.style.whiteSpace='pre-wrap';inp.style.wordWrap='break-word';}inp.addEventListener('focus',()=>{tb.querySelectorAll('tr').forEach(r=>r.classList.remove('sel'));tr.classList.add('sel');inp.dataset.oldValue=inp.value;});if((cn.includes('ко-во')||cn.includes('количество'))||cn.startsWith('цена')){inp.addEventListener('input',()=>{td.rows[ri][ci]=inp.value;updCalc(td);});inp.addEventListener('blur',()=>{const n=pn(td.rows[ri][ci]);if(!isNaN(n)){td.rows[ri][ci]=n.toFixed(2);inp.value=td.rows[ri][ci];updCalc(td);}});}else if(!cn.startsWith('стоимость')){inp.addEventListener('input',()=>{td.rows[ri][ci]=inp.value;});}inp.addEventListener('change',()=>{if(inp.dataset.oldValue!==undefined&&inp.value!==inp.dataset.oldValue){hist.push({a:'editCell',tid:td.id,d:{ri:ri,ci:ci,old:inp.dataset.oldValue,val:inp.value}});}});inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.shiftKey){e.preventDefault();const s=inp.selectionStart,en=inp.selectionEnd,v=inp.value;inp.value=v.substring(0,s)+'\n'+v.substring(en);inp.selectionStart=inp.selectionEnd=s+1;td.rows[ri][ci]=inp.value;}else if(e.key==='Tab'&&!e.shiftKey){e.preventDefault();mvFocus(td,ri,ci,1);}else if(e.key==='Tab'&&e.shiftKey){e.preventDefault();mvFocus(td,ri,ci,-1);}else if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();mvFocus(td,ri,ci,0,1);}});tdEl.appendChild(inp);tr.appendChild(tdEl);});const at=document.createElement('td');at.className='act-cell';at.innerHTML='<div style="display:flex;gap:3px;justify-content:center;"><button class="rbtn rbtn-add">+</button><button class="rbtn rbtn-del">✕</button></div>';at.querySelector('.rbtn-add').onclick=e=>{e.stopPropagation();insRowBelow(td,ri);};at.querySelector('.rbtn-del').onclick=e=>{e.stopPropagation();delRow(td,ri);};tr.appendChild(at);tb.appendChild(tr);});if(td.rows.length>0){const totTr=document.createElement('tr');totTr.className='tot';const ti=ci(td.cols,'Стоимость');totTr.innerHTML='<td class="rn"></td>'+td.cols.map((_,ci)=>{if(ci===(ti>=0?ti-1:td.cols.length-2))return'<td style="text-align:right;font-weight:700;padding-right:8px">Итого</td>';if(ci===ti)return`<td><input value="${sumT(td).toFixed(2)}" readonly class="total" style="font-weight:700"></td>`;return'<td></td>';}).join('')+'<td class="act-cell"></td>';tb.appendChild(totTr);}}

function updCalc(td){if(!td||!td.el)return;const ti=ci(td.cols,'Стоимость');if(ti<0)return;const rows=td.el.querySelectorAll('tbody tr:not(.tot)');rows.forEach((tr,ri)=>{if(ri<td.rows.length){calc(td.rows[ri],td.cols);const tds=tr.querySelectorAll('td');if(tds[ti+1]){const inp=tds[ti+1].querySelector('input');if(inp&&document.activeElement!==inp)inp.value=td.rows[ri][ti]??'';}}});updTot(td);}
function mvFocus(td,ri,ci,dc,dr=0){let nr=ri+dr,nc=ci+dc;if(nc>=td.cols.length){nc=0;nr++;}if(nc<0){nc=td.cols.length-1;nr--;}if(nr>=td.rows.length)nr=0;if(nr<0)nr=td.rows.length-1;const rows=td.el.querySelectorAll('tbody tr:not(.tot)');if(nr>=0&&nr<rows.length){const tds=rows[nr].querySelectorAll('td:not(.rn):not(.act-cell)');if(nc>=0&&nc<tds.length){const inp=tds[nc].querySelector('input');if(inp){inp.focus();inp.select();}}}}
function updTot(td){if(!td.el)return;const tr=td.el.querySelector('tbody tr.tot');if(!tr)return;const ti=ci(td.cols,'Стоимость');if(ti<0)return;const tds=tr.querySelectorAll('td');if(tds[ti+1]){const inp=tds[ti+1].querySelector('input');if(inp)inp.value=sumT(td).toFixed(2);}}
function insRowBelow(td,idx){insRow(td,idx+1);}function insRowAbove(td,idx){insRow(td,idx);}
function insRow(td,idx){td.rows.splice(idx,0,Array(td.cols.length).fill(''));calc(td.rows[idx],td.cols);render(td);}
function delRow(td,idx){if(td.rows.length<=1)return toast('Нельзя удалить строку!',0);hist.push({a:'delRow',tid:td.id,d:{i:idx,r:[...td.rows[idx]]}});td.rows.splice(idx,1);render(td);}
function addRowEnd(td){td.rows.push(Array(td.cols.length).fill(''));calc(td.rows[td.rows.length-1],td.cols);render(td);}
function delRowEnd(td){if(td.rows.length<=1)return toast('Нельзя удалить строку!',0);hist.push({a:'delRowEnd',tid:td.id,d:{i:td.rows.length-1,r:[...td.rows[td.rows.length-1]]}});td.rows.pop();render(td);}
function insCol(td,idx){const n=prompt('Название:','Новая колонка');if(!n||!n.trim())return;hist.push({a:'insCol',tid:td.id,d:{i:idx}});td.cols.splice(idx,0,n.trim());td.rows.forEach(r=>r.splice(idx,0,''));render(td);}
function delCol(td,idx){if(td.cols.length<=2)return toast('Минимум 2 колонки!',0);hist.push({a:'delCol',tid:td.id,d:{i:idx,n:td.cols[idx],c:td.rows.map(r=>r[idx])}});td.cols.splice(idx,1);td.rows.forEach(r=>r.splice(idx,1));render(td);}
function renameCol(td,idx){const old=td.cols[idx];const n=prompt('Новое название:',old);if(!n||!n.trim()||n.trim()===old)return;td.cols[idx]=n.trim();render(td);}
function addColEnd(td){const n=prompt('Название:','Новая колонка');if(!n||!n.trim())return;hist.push({a:'addCol',tid:td.id});td.cols.push(n.trim());td.rows.forEach(r=>r.push(''));render(td);}
function delColEnd(td){if(td.cols.length<=2)return toast('Минимум 2 колонки!',0);hist.push({a:'delColEnd',tid:td.id,d:{i:td.cols.length-1,n:td.cols[td.cols.length-1],c:td.rows.map(r=>r[td.cols.length-1])}});td.cols.pop();td.rows.forEach(r=>r.pop());render(td);}

function undo(){if(!hist.length)return toast('Нечего отменять',false);const l=hist.pop();const td=workspaces[activeWorkspace].find(t=>t.id===l.tid);if(!td)return toast('Таблица не найдена',false);switch(l.a){case'editCell':td.rows[l.d.ri][l.d.ci]=l.d.old;render(td);toast('Отменено: ввод');break;case'delRow':td.rows.splice(l.d.i,0,l.d.r);render(td);toast('Отменено: строка возвращена');break;case'delRowEnd':td.rows.splice(l.d.i,0,l.d.r);render(td);toast('Отменено: строка возвращена');break;case'addRow':case'insRow':if(td.rows.length>1){td.rows.pop();render(td);toast('Отменено: строка удалена');}break;case'delCol':td.cols.splice(l.d.i,0,l.d.n);td.rows.forEach(r=>r.splice(l.d.i,0,l.d.c));render(td);toast('Отменено: колонка возвращена');break;case'delColEnd':td.cols.splice(l.d.i,0,l.d.n);td.rows.forEach(r=>r.splice(l.d.i,0,l.d.c));render(td);toast('Отменено: колонка возвращена');break;case'addCol':if(td.cols.length>2){td.cols.pop();td.rows.forEach(r=>r.pop());render(td);toast('Отменено: колонка удалена');}break;case'insCol':td.cols.splice(l.d.i,1);td.rows.forEach(r=>r.splice(l.d.i,1));render(td);toast('Отменено: колонка удалена');break;case'paste':td.rows.splice(l.d.si,l.d.count);render(td);toast(`Отменено: ${l.d.count} стр.`);break;}}

function parseCB(text){if(!text||!text.trim())return[];return text.trim().split(/\r?\n/).map(l=>l.includes('\t')?l.split('\t'):l.split('|')?l.split('|').map(c=>c.trim()).filter(c=>c):l.split(/\s{2,}/)).filter(r=>r.some(c=>c.trim()));}
function paste(){const td=active();if(!td)return toast('Выберите таблицу!',0);navigator.clipboard.readText().then(text=>{const p=parseCB(text);if(!p.length)return toast('Нет данных',0);insertRowsIntoTable(td,p);}).catch(()=>{const m=prompt('Вставьте:','');if(m){const p=parseCB(m);insertRowsIntoTable(td,p);}});}

function insertRowsIntoTable(td,parsedRows){
    if(!td||!parsedRows.length)return;
    let startIdx=0;
    if(td.rows.length===1&&isEmptyRow(td.rows[0])){startIdx=0;}else{startIdx=td.rows.length;}
    parsedRows.forEach((r,pi)=>{
        const nr=Array(td.cols.length).fill('');
        for(let i=0;i<td.cols.length;i++){let v=r[i]??'';const cn=td.cols[i].toLowerCase();if(cn.includes('ко-во')||cn.includes('количество')||cn.startsWith('цена')){const n=pn(v);if(!isNaN(n))v=n.toFixed(2);}nr[i]=v;}
        if(startIdx===0&&pi===0){td.rows[0]=nr;}else{td.rows.push(nr);}
        calc(nr,td.cols);
    });
    hist.push({a:'paste',tid:td.id,d:{si:startIdx,count:parsedRows.length}});
    render(td);toast(`Вставлено строк: ${parsedRows.length}`);
}

function findInTable(){const td=active();if(!td)return toast('Выберите таблицу!',0);const q=prompt('Что искать:','');if(!q||!q.trim())return;const res=[];td.rows.forEach((r,ri)=>{r.forEach((v,ci)=>{if(String(v??'').toLowerCase().includes(q.toLowerCase()))res.push({ri,ci});});});if(!res.length)return toast('Ничего не найдено',false);toast(`Найдено: ${res.length}`);let idx=0;hlRes(td,res[idx]);window._nr=()=>{idx=(idx+1)%res.length;hlRes(td,res[idx]);};}
function hlRes(td,res){const rows=td.el.querySelectorAll('tbody tr:not(.tot)');if(res.ri<rows.length){const tds=rows[res.ri].querySelectorAll('td:not(.rn):not(.act-cell)');if(res.ci<tds.length){const inp=tds[res.ci].querySelector('input');if(inp){inp.focus();inp.select();rows[res.ri].classList.add('sel');}}}}

// ==================== ЗАГРУЗКА ПРАЙС-ЛИСТА ====================
function findHeaderRow(sheetData,maxRows=10){
    for(let r=0;r<Math.min(maxRows,sheetData.length);r++){
        const row=sheetData[r];
        if(!row||!row.length)continue;
        const rowStr=row.map(c=>String(c||'').toLowerCase()).join(' ');
        const hasArticle=PRICE_COLUMN_PATTERNS.find(p=>p.id==='article').keywords.some(k=>rowStr.includes(k));
        const hasName=PRICE_COLUMN_PATTERNS.find(p=>p.id==='name').keywords.some(k=>rowStr.includes(k));
        if(hasArticle&&hasName)return r;
    }
    return 0;
}
function matchPriceColumn(headerName){const h=String(headerName||'').toLowerCase().replace(/[\s,.\-_]/g,'');for(const pattern of PRICE_COLUMN_PATTERNS){for(const kw of pattern.keywords){if(h.includes(kw.toLowerCase()))return pattern.id;}}return null;}
function getDisplayColumns(headers){const result=[];const usedPatterns=new Set();for(let i=0;i<headers.length;i++){const pid=matchPriceColumn(headers[i]);if(pid&&!usedPatterns.has(pid)){result.push({index:i,name:headers[i],patternId:pid});usedPatterns.add(pid);}}const order=['article','name','mega','distributor','partner','dealer','mrp','rrp'];result.sort((a,b)=>order.indexOf(a.patternId)-order.indexOf(b.patternId));return result;}

function loadPriceFile(file){const reader=new FileReader();reader.onload=function(e){try{const wb=XLSX.read(new Uint8Array(e.target.result),{type:'array'});processPriceWB(wb,file.name);}catch(er){toast('Ошибка чтения прайс-листа: '+er.message,false);}};reader.readAsArrayBuffer(file);}
function processPriceWB(wb,fileName){const sheets=[];wb.SheetNames.forEach(sheetName=>{const raw=XLSX.utils.sheet_to_json(wb.Sheets[sheetName],{header:1,defval:''});if(!raw||!raw.length)return;const headerRow=findHeaderRow(raw);const headers=raw[headerRow].map(c=>String(c||'').trim());const rows=[];for(let i=headerRow+1;i<raw.length;i++){const row=raw[i];if(!row||row.every(c=>String(c??'').trim()===''))continue;const rowStr=row.map(c=>String(c||'').trim()).join(' ').toLowerCase();if(rowStr==='итого'||rowStr.startsWith('итого'))continue;rows.push(row.map(c=>String(c??'').trim()));}const hasArticle=headers.some(h=>PRICE_COLUMN_PATTERNS.find(p=>p.id==='article').keywords.some(k=>h.toLowerCase().includes(k)));const hasName=headers.some(h=>PRICE_COLUMN_PATTERNS.find(p=>p.id==='name').keywords.some(k=>h.toLowerCase().includes(k)));const displayCols=getDisplayColumns(headers);const articleIdx=headers.findIndex(h=>PRICE_COLUMN_PATTERNS.find(p=>p.id==='article').keywords.some(k=>h.toLowerCase().includes(k)));const nameIdx=headers.findIndex(h=>PRICE_COLUMN_PATTERNS.find(p=>p.id==='name').keywords.some(k=>h.toLowerCase().includes(k)));sheets.push({name:sheetName,headers:headers,rows:rows,headerRow:headerRow,hasArticle:hasArticle,hasName:hasName,displayCols:displayCols,articleIdx:articleIdx,nameIdx:nameIdx});});priceData={fileName:fileName,sheets:sheets};const totalRows=sheets.reduce((s,sh)=>s+sh.rows.length,0);toast(`✅ Прайс загружен: ${sheets.length} листов, ${totalRows} строк`);}
async function loadPriceViaDialog(){if(window.pywebview&&window.pywebview.api){try{const r=JSON.parse(await window.pywebview.api.load_file());if(r.success){const bs=atob(r.data);const bytes=new Uint8Array(bs.length);for(let i=0;i<bs.length;i++)bytes[i]=bs.charCodeAt(i);processPriceWB(XLSX.read(bytes,{type:'array'}),r.name);}}catch(e){toast('Ошибка загрузки прайса',false);}}else{Q('#priceFileInput').click();}}

// ==================== ПРОСМОТР ПРАЙСА ====================
function viewPrice(){if(!priceData||!priceData.sheets.length){toast('Сначала загрузите прайс-лист!',false);return;}const modal=Q('#priceViewModal');if(!modal){toast('Ошибка интерфейса: окно просмотра не найдено',false);return;}const tabsContainer=Q('#priceViewTabs');if(!tabsContainer)return;tabsContainer.innerHTML=priceData.sheets.map((s,i)=>`<button class="price-view-tab${i===0?' active':''}" onclick="switchPriceViewSheet(${i})">${s.name}</button>`).join('');window._currentViewSheet=0;renderPriceViewSheet(0);modal.classList.add('show');}
function switchPriceViewSheet(idx){window._currentViewSheet=idx;document.querySelectorAll('.price-view-tab').forEach((t,i)=>t.classList.toggle('active',i===idx));renderPriceViewSheet(idx);}

function renderPriceViewSheet(idx){
    const sheet=priceData.sheets[idx];
    const content=Q('#priceViewContent');
    if(!content)return;
    let html='<div class="price-view-scroll"><table class="price-view-table"><thead><tr><th class="pv-rn">№</th>';
    sheet.headers.forEach(h=>html+=`<th>${h||'—'}</th>`);
    html+='</tr></thead><tbody>';
    sheet.rows.forEach((row,ri)=>{
        const hasStrikethrough=row.some(v=>String(v).includes('~~')||String(v).includes('̶'));
        html+=`<tr class="${hasStrikethrough?'strikethrough-row':''}" data-pv-sheet="${idx}" data-pv-row="${ri}" onclick="selectPriceViewRow(${idx},${ri})">`;
        html+=`<td class="pv-rn">${ri+1}</td>`;
        row.forEach((v,ci)=>html+=`<td data-pv-col="${ci}" data-pv-val="${encodeURIComponent(v||'')}" onclick="event.stopPropagation();">${v||''}</td>`);
        html+='</tr>';
    });
    html+='</tbody></table></div>';
    content.innerHTML=html;
    content.querySelectorAll('tr[data-pv-row]').forEach(tr=>{tr.addEventListener('contextmenu',function(e){e.preventDefault();e.stopPropagation();const sIdx=parseInt(this.dataset.pvSheet);const rIdx=parseInt(this.dataset.pvRow);selectPriceViewRow(sIdx,rIdx);const td=e.target.closest('td[data-pv-col]');if(td){window._priceViewClickedCell={colIdx:parseInt(td.dataset.pvCol),value:decodeURIComponent(td.dataset.pvVal||'')};}else{window._priceViewClickedCell=null;}showPriceViewCtx(e.clientX,e.clientY);});});
}

function selectPriceViewRow(sheetIdx,rowIdx){document.querySelectorAll('#priceViewContent tr').forEach(tr=>tr.classList.remove('selected'));const tr=Q(`#priceViewContent tr[data-pv-sheet="${sheetIdx}"][data-pv-row="${rowIdx}"]`);if(tr)tr.classList.add('selected');priceViewCtxRow={sheetIdx:sheetIdx,rowIdx:rowIdx};}

function showPriceViewCtx(x,y){
    const cm=Q('#priceViewCtxMenu');if(!cm)return;
    let html='<div class="ctx-item" data-action="transferToTable">📋 Перенести в таблицу</div>';
    if(window._priceViewClickedCell&&window._priceViewClickedCell.value){html+='<div class="ctx-div"></div><div class="ctx-item" data-action="copyCell">📝 Копировать ячейку</div>';}
    cm.innerHTML=html;cm.style.display='block';cm.style.left=Math.min(x,window.innerWidth-200)+'px';cm.style.top=Math.min(y,window.innerHeight-150)+'px';
    cm.onclick=function(e){const item=e.target.closest('.ctx-item');if(!item)return;if(item.dataset.action==='transferToTable')transferFromPriceView();if(item.dataset.action==='copyCell')copyPriceViewCell();hidePriceViewCtx();};
}

function hidePriceViewCtx(){const cm=Q('#priceViewCtxMenu');if(cm)cm.style.display='none';}
function transferFromPriceView(){if(!priceViewCtxRow||!priceData)return;hidePriceViewCtx();const sheet=priceData.sheets[priceViewCtxRow.sheetIdx];const row=sheet.rows[priceViewCtxRow.rowIdx];selectedPriceRow={sheetName:sheet.name,row:row,rowIndex:priceViewCtxRow.rowIdx,headers:sheet.headers,displayCols:sheet.displayCols,matchType:'manual',articleIdx:sheet.articleIdx,nameIdx:sheet.nameIdx,matchedCol:-1};Q('#priceViewModal').classList.remove('show');setTimeout(()=>showPriceSelect(),200);}
function copyPriceViewCell(){if(!window._priceViewClickedCell||!window._priceViewClickedCell.value)return;navigator.clipboard.writeText(window._priceViewClickedCell.value).then(()=>{toast('✅ Скопировано: '+window._priceViewClickedCell.value);}).catch(()=>{toast('Ошибка копирования',false);});window._priceViewClickedCell=null;}

// ==================== ПОИСК В ПРАЙС-ЛИСТЕ ====================
function searchInPrice(){if(!priceData||!priceData.sheets.length){toast('Сначала загрузите прайс-лист!',false);return;}Q('#priceSearchModal').classList.add('show');setTimeout(()=>Q('#priceSearchInput').focus(),100);Q('#priceSearchInput').value='';}
function executeSearch(){const query=Q('#priceSearchInput').value.trim();if(!query){toast('Введите артикул или наименование',false);return;}if(!priceData||!priceData.sheets.length){toast('Прайс не загружен',false);return;}const searchType=Q('input[name="searchType"]:checked').value;priceSearchResults=[];priceData.sheets.forEach(sheet=>{const articleIdx=sheet.articleIdx;const nameIdx=sheet.nameIdx;sheet.rows.forEach((row,ri)=>{let matchType='partial';let matchedCol=-1;if(searchType==='article'){if(articleIdx>=0){const articleVal=row[articleIdx]||'';if(isExactMatch(articleVal,query)){matchType='exact';matchedCol=articleIdx;}else if(isPartialMatch(articleVal,query)){matchType='partial';matchedCol=articleIdx;}else return;}else if(nameIdx>=0){const nameVal=row[nameIdx]||'';if(isPartialMatch(nameVal,query)){matchType='partial';matchedCol=nameIdx;}else return;}else return;}else{if(nameIdx>=0){const nameVal=row[nameIdx]||'';if(isExactMatch(nameVal,query)){matchType='exact';matchedCol=nameIdx;}else if(isPartialMatch(nameVal,query)){matchType='partial';matchedCol=nameIdx;}else return;}else if(articleIdx>=0){const articleVal=row[articleIdx]||'';if(isPartialMatch(articleVal,query)){matchType='partial';matchedCol=articleIdx;}else return;}else return;}priceSearchResults.push({sheetName:sheet.name,row:row,rowIndex:ri,headers:sheet.headers,displayCols:sheet.displayCols,matchType:matchType,articleIdx:articleIdx,nameIdx:nameIdx,matchedCol:matchedCol});});});priceSearchResults.sort((a,b)=>{if(a.matchType==='exact'&&b.matchType!=='exact')return -1;if(a.matchType!=='exact'&&b.matchType==='exact')return 1;return 0;});showSearchResults();}

function showSearchResults(){const resultsModal=Q('#priceResultsModal');const resultsHead=Q('#priceResultsHead');const resultsBody=Q('#priceResultsBody');const resultsEmpty=Q('#priceResultsEmpty');const resultsTable=Q('#priceResultsTable');const resultsCount=Q('#resultsCount');const resultsInfo=Q('#resultsInfo');resultsCount.textContent=priceSearchResults.length;if(!priceSearchResults.length){resultsHead.innerHTML='';resultsBody.innerHTML='';resultsEmpty.style.display='block';resultsTable.style.display='none';resultsInfo.textContent='Ничего не найдено. Попробуйте изменить запрос или тип поиска.';resultsModal.classList.add('show');return;}resultsEmpty.style.display='none';resultsTable.style.display='table';const firstResult=priceSearchResults[0];const displayCols=firstResult.displayCols;let headerHTML='<tr><th>Лист</th>';for(const dc of displayCols){headerHTML+=`<th>${dc.name||'—'}</th>`;}headerHTML+='</tr>';resultsHead.innerHTML=headerHTML;resultsBody.innerHTML=priceSearchResults.map((res,idx)=>{let rowHTML=`<tr class="${res.matchType==='exact'?'exact-match':''}" data-idx="${idx}" onclick="selectSearchResult(${idx})">`;rowHTML+=`<td><span class="badge badge-usd">${res.sheetName}</span></td>`;for(const dc of displayCols){const val=res.row[dc.index]||'';rowHTML+=`<td>${val}</td>`;}rowHTML+='</tr>';return rowHTML;}).join('');const exactCount=priceSearchResults.filter(r=>r.matchType==='exact').length;resultsInfo.textContent=`Точных совпадений: ${exactCount}, частичных: ${priceSearchResults.length-exactCount}`;resultsModal.classList.add('show');}
function selectSearchResult(idx){document.querySelectorAll('#priceResultsBody tr').forEach(tr=>tr.classList.remove('selected'));const tr=Q(`#priceResultsBody tr[data-idx="${idx}"]`);if(tr)tr.classList.add('selected');selectedPriceRow=priceSearchResults[idx];setTimeout(()=>{Q('#priceResultsModal').classList.remove('show');showPriceSelect();},200);}

function showPriceSelect(){if(!selectedPriceRow){toast('Строка не выбрана',false);return;}const modal=Q('#priceSelectModal');const infoEl=Q('#selectedItemInfo');const buttonsGrid=Q('#priceButtonsGrid');const manualArea=Q('#manualCopyArea');manualArea.style.display='none';if(buttonsGrid)buttonsGrid.style.display='grid';const articleVal=selectedPriceRow.articleIdx>=0?selectedPriceRow.row[selectedPriceRow.articleIdx]:'—';const nameVal=selectedPriceRow.nameIdx>=0?selectedPriceRow.row[selectedPriceRow.nameIdx]:'—';infoEl.innerHTML=`<div class="info-label">Артикул</div><div class="info-value">${articleVal}</div><div class="info-label" style="margin-top:8px;">Наименование</div><div class="info-value">${nameVal}</div><div class="info-label" style="margin-top:8px;">Лист</div><div class="info-value">${selectedPriceRow.sheetName}</div>`;const displayCols=selectedPriceRow.displayCols;const priceButtons=[];for(const dc of displayCols){if(dc.patternId==='article'||dc.patternId==='name')continue;const val=selectedPriceRow.row[dc.index]||'';const isEmpty=!val||String(val).trim()==='';const numVal=pn(val);const displayVal=(!isEmpty&&!isNaN(numVal))?numVal.toFixed(2):val;priceButtons.push({label:dc.name,value:displayVal,patternId:dc.patternId,isEmpty:isEmpty,colIndex:dc.index});}if(priceButtons.length===0){buttonsGrid.innerHTML='<div style="grid-column:1/-1;text-align:center;color:var(--text2);padding:20px;">Нет колонок с ценами.<br>Используйте «Скопировать вручную».</div>';}else{buttonsGrid.innerHTML=priceButtons.map(pb=>{const escapedValue=String(pb.value).replace(/'/g,"\\'").replace(/"/g,'&quot;');const escapedLabel=pb.label.replace(/'/g,"\\'");if(pb.isEmpty){return`<button class="price-btn empty-price" disabled><span>${pb.label}</span><span class="price-value">нет цены</span></button>`;}else{return`<button class="price-btn" onclick="insertPriceFromSearch('${escapedLabel}','${escapedValue}')"><span>${pb.label}</span><span class="price-value">${pb.value}</span></button>`;}}).join('');}modal.classList.add('show');}
function insertPriceFromSearch(priceType,priceValue){const td=active();if(!td){toast('Выберите активную таблицу!',false);return;}if(!selectedPriceRow){toast('Строка не выбрана',false);return;}const articleVal=selectedPriceRow.articleIdx>=0?(selectedPriceRow.row[selectedPriceRow.articleIdx]||''):'';const nameVal=selectedPriceRow.nameIdx>=0?(selectedPriceRow.row[selectedPriceRow.nameIdx]||''):'';const articleCol=ci(td.cols,'Артикул');const nameCol=ci(td.cols,'Наименование');const priceCol=ci(td.cols,'Цена');const numPrice=pn(priceValue);const finalPrice=!isNaN(numPrice)?numPrice.toFixed(2):String(priceValue);const newRow=Array(td.cols.length).fill('');if(articleCol>=0)newRow[articleCol]=articleVal;if(nameCol>=0)newRow[nameCol]=nameVal;if(priceCol>=0)newRow[priceCol]=finalPrice;insertRowIntoTable(td,newRow);Q('#priceSelectModal').classList.remove('show');selectedPriceRow=null;toast(`✅ Добавлено: ${articleVal||nameVal} (${priceType})`);}
function showManualCopy(){if(!selectedPriceRow)return;const manualArea=Q('#manualCopyArea');const manualHead=Q('#manualCopyHead');const manualBody=Q('#manualCopyBody');const priceButtonsGrid=Q('#priceButtonsGrid');if(priceButtonsGrid)priceButtonsGrid.style.display='none';manualArea.style.display='block';Q('#btnCancelManual').style.display='block';const displayCols=selectedPriceRow.displayCols;manualHead.innerHTML='<tr>'+displayCols.map(dc=>`<th>${dc.name||'—'}</th>`).join('')+'</tr>';manualBody.innerHTML='<tr>'+displayCols.map(dc=>{const val=selectedPriceRow.row[dc.index]||'';const numVal=pn(val);const displayVal=(!isNaN(numVal))?numVal.toFixed(2):val;const escapedVal=String(displayVal).replace(/'/g,"\\'").replace(/"/g,'&quot;');return`<td class="clickable-cell" onclick="insertManualCell('${dc.patternId}','${escapedVal}')">${displayVal||'—'}</td>`;}).join('')+'</tr>';}
function insertManualCell(patternId,value){const td=active();if(!td){toast('Выберите активную таблицу!',false);return;}if(!selectedPriceRow){toast('Строка не выбрана',false);return;}const articleVal=selectedPriceRow.articleIdx>=0?(selectedPriceRow.row[selectedPriceRow.articleIdx]||''):'';const nameVal=selectedPriceRow.nameIdx>=0?(selectedPriceRow.row[selectedPriceRow.nameIdx]||''):'';const articleCol=ci(td.cols,'Артикул');const nameCol=ci(td.cols,'Наименование');const priceCol=ci(td.cols,'Цена');const numPrice=pn(value);const finalValue=!isNaN(numPrice)?numPrice.toFixed(2):String(value);const newRow=Array(td.cols.length).fill('');if(articleCol>=0)newRow[articleCol]=articleVal;if(nameCol>=0)newRow[nameCol]=nameVal;if(patternId==='article'&&articleCol>=0)newRow[articleCol]=finalValue;else if(patternId==='name'&&nameCol>=0)newRow[nameCol]=finalValue;else if(priceCol>=0)newRow[priceCol]=finalValue;insertRowIntoTable(td,newRow);Q('#priceSelectModal').classList.remove('show');selectedPriceRow=null;toast(`✅ Добавлено: ${articleVal||nameVal}`);}
function insertRowIntoTable(td,newRow){if(td.rows.length===1&&isEmptyRow(td.rows[0])){td.rows[0]=newRow;}else{td.rows.push(newRow);}calc(newRow,td.cols);render(td);}

// ==================== FALLBACK ====================
function showFallbackResults(sheet){const modal=Q('#priceFallbackModal');Q('#fallbackInfo').textContent=`Лист «${sheet.name}» — не найдены колонки «Артикул» и «Наименование». Выберите строку:`;const displayCols=sheet.displayCols;Q('#fallbackHead').innerHTML='<tr>'+displayCols.map(dc=>`<th>${dc.name||'—'}</th>`).join('')+'</tr>';window._fallbackSheet=sheet;Q('#fallbackBody').innerHTML=sheet.rows.map((row,ri)=>`<tr data-fidx="${ri}" onclick="selectFallbackRow(${ri})">`+displayCols.map(dc=>`<td>${row[dc.index]||'—'}</td>`).join('')+`</tr>`).join('');modal.classList.add('show');}
function selectFallbackRow(idx){document.querySelectorAll('#fallbackBody tr').forEach(tr=>tr.classList.remove('selected'));const tr=Q(`#fallbackBody tr[data-fidx="${idx}"]`);if(tr)tr.classList.add('selected');window._selectedFallbackIdx=idx;}
function useFallbackRow(){const sheet=window._fallbackSheet;const idx=window._selectedFallbackIdx;if(!sheet||idx===undefined||idx<0){toast('Выберите строку в таблице!',false);return;}const row=sheet.rows[idx];selectedPriceRow={sheetName:sheet.name,row:row,rowIndex:idx,headers:sheet.headers,displayCols:sheet.displayCols,matchType:'manual',articleIdx:sheet.articleIdx,nameIdx:sheet.nameIdx,matchedCol:-1};Q('#priceFallbackModal').classList.remove('show');showPriceSelect();}

// ==================== DRAG-AND-DROP ====================
function makeDraggable(dialogId,handleId){const dialog=document.getElementById(dialogId);const handle=document.getElementById(handleId);if(!dialog||!handle)return;let isDragging=false,startX,startY,initialLeft,initialTop;handle.addEventListener('mousedown',function(e){if(e.target.closest('button'))return;isDragging=true;startX=e.clientX;startY=e.clientY;const rect=dialog.getBoundingClientRect();initialLeft=rect.left;initialTop=rect.top;dialog.style.position='fixed';dialog.style.margin='0';dialog.style.left=initialLeft+'px';dialog.style.top=initialTop+'px';});document.addEventListener('mousemove',function(e){if(!isDragging)return;dialog.style.left=(initialLeft+e.clientX-startX)+'px';dialog.style.top=(initialTop+e.clientY-startY)+'px';});document.addEventListener('mouseup',function(){isDragging=false;});}

// ==================== СОХРАНЕНИЕ ====================
function save(){const ws=workspaces[activeWorkspace];if(!ws.length)return toast('Нет таблиц!',0);const wb=new ExcelJS.Workbook();const wsheet=wb.addWorksheet('Заказы');let cr=1;const mc=Math.max(...ws.map(t=>t.cols.length),5);wsheet.columns=[{width:6},...Array(mc).fill({width:24})];ws.forEach(td=>{const ni=ci(td.cols,'Наименование');if(ni>=0)wsheet.getColumn(ni+2).width=88;const qi=getQi(td.cols);if(qi>=0)wsheet.getColumn(qi+2).width=18;const pi=ci(td.cols,'Цена');if(pi>=0)wsheet.getColumn(pi+2).width=22;const toti=ci(td.cols,'Стоимость');if(toti>=0)wsheet.getColumn(toti+2).width=22;});ws.forEach(td=>{if(!td.rows.length)return;const tc=td.cols.length,qi=getQi(td.cols),pi=ci(td.cols,'Цена'),toti=ci(td.cols,'Стоимость'),ni=ci(td.cols,'Наименование');const hr=wsheet.getRow(cr);hr.getCell(1).value='№';hr.getCell(1).font={bold:true,size:12,color:{argb:'FFCBD5E1'},name:'Calibri'};hr.getCell(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF64748B'}};hdrs(td.cols,td.currency).forEach((h,ci)=>{const c=hr.getCell(ci+2);c.value=h;c.font={bold:true,size:12,color:{argb:'FFFFFFFF'},name:'Calibri'};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF64748B'}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true};c.border={top:{style:'thin',color:{argb:'FF475569'}},bottom:{style:'thin',color:{argb:'FF475569'}},left:{style:'thin',color:{argb:'FF475569'}},right:{style:'thin',color:{argb:'FF475569'}}};});hr.height=28;cr++;const fdr=cr;for(let r=0;r<td.rows.length;r++){const row=wsheet.getRow(cr),bg=r%2===0?'FFEFF6FF':'FFDBEAFE';row.getCell(1).value=r+1;row.getCell(1).font={size:9,color:{argb:'FF94A3B8'},name:'Calibri'};row.getCell(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF1F5F9'}};for(let c=0;c<tc;c++){const cell=row.getCell(c+2);if(c===toti)cell.value={formula:`${cA(cr,qi+2)}*${cA(cr,pi+2)}`,result:pn(td.rows[r][c])||0};else if(c===qi||c===pi){const v=pn(td.rows[r][c]);cell.value=isNaN(v)?td.rows[r][c]:v;}else cell.value=td.rows[r][c]??'';if(c===toti||c===qi||c===pi)cell.numFmt='#,##0.00';cell.font={size:11,color:{argb:'FF1E293B'},name:'Calibri'};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};cell.alignment={horizontal:'center',vertical:'middle',wrapText:true};cell.border={top:{style:'thin',color:{argb:'FFBFDBFE'}},bottom:{style:'thin',color:{argb:'FFBFDBFE'}},left:{style:'thin',color:{argb:'FFBFDBFE'}},right:{style:'thin',color:{argb:'FFBFDBFE'}}};if(c===ni)cell.alignment.horizontal='left';if(c===qi||c===pi||c===toti)cell.alignment.horizontal='right';}cr++;}const ldr=cr-1,totr=wsheet.getRow(cr);totr.getCell(1).value='';totr.getCell(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFE2E8F0'}};for(let c=0;c<tc;c++){const cell=totr.getCell(c+2);if(c===(toti>=0?toti-1:tc-2))cell.value='Итого';else if(c===toti)cell.value={formula:`SUM(${cA(fdr,toti+2)}:${cA(ldr,toti+2)})`,result:sumT(td)};if(c===toti)cell.numFmt='#,##0.00';cell.font={bold:true,size:12,name:'Calibri'};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFE2E8F0'}};cell.alignment={horizontal:'right',vertical:'middle',wrapText:true};cell.border={top:{style:'medium',color:{argb:'FF64748B'}},bottom:{style:'medium',color:{argb:'FF64748B'}},left:{style:'thin',color:{argb:'FFBFDBFE'}},right:{style:'thin',color:{argb:'FFBFDBFE'}}};}totr.height=28;cr++;});wb.xlsx.writeBuffer().then(buf=>{const fn=`Заказы_ONTEK_${new Date().toISOString().slice(0,10)}.xlsx`;if(window.pywebview&&window.pywebview.api){const b64=btoa(String.fromCharCode(...new Uint8Array(buf)));window.pywebview.api.save_file(b64,fn).then(r=>{const j=JSON.parse(r);if(j.success)toast('✅ Сохранено!');else toast('Отменено',false);});}else{const blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=fn;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);toast('✅ Сохранено!');}}).catch(e=>{toast('Ошибка сохранения',false);});}
function load(file){const r=new FileReader();r.onload=e=>{try{const wb=XLSX.read(new Uint8Array(e.target.result),{type:'array'});processWB(wb);}catch(er){toast('Ошибка',0);if(!workspaces[activeWorkspace].length)addTable('USD');}};r.readAsArrayBuffer(file);}
async function loadViaDialog(){if(window.pywebview&&window.pywebview.api){const r=JSON.parse(await window.pywebview.api.load_file());if(r.success){const bs=atob(r.data);const bytes=new Uint8Array(bs.length);for(let i=0;i<bs.length;i++)bytes[i]=bs.charCodeAt(i);processWB(XLSX.read(bytes,{type:'array'}));}}else Q('#fileInput').click();}

// ИСПРАВЛЕННАЯ ЗАГРУЗКА РАБОЧИХ ТАБЛИЦ (processWB как в оригинале)
function processWB(wb){
    const a=getArea();a.innerHTML='';
    const ws=workspaces[activeWorkspace];ws.length=0;idC=0;actId=null;
    
    // Проверяем: это рабочий файл (сохранённый из программы) или сторонний
    // В сохранённом файле на первом листе "Заказы" заголовки начинаются с "№"
    const firstSheet=wb.Sheets[wb.SheetNames[0]];
    const firstRow=XLSX.utils.sheet_to_json(firstSheet,{header:1,defval:''})[0]||[];
    const looksLikeSavedFile=firstRow.some(c=>String(c).trim()==='№');
    
    wb.SheetNames.forEach(n=>{
        const raw=XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,defval:''});
        if(!raw.length)return;
        let cur=null,ec=0;
        for(let i=0;i<raw.length;i++){
            const row=raw[i],emp=!row||row.every(c=>String(c??'').trim()==='');
            if(emp){ec++;if(ec>=2&&cur&&cur.rows.length){fin(cur);cur=null;}continue;}
            ec=0;
            const f=String(row[0]||'').trim();
            if(f.toLowerCase()==='итого'){if(cur&&cur.rows.length){fin(cur);cur=null;}continue;}
            if(row.some(c=>['артикул','наименование','ко-во','количество','цена','стоимость'].some(k=>String(c||'').toLowerCase().includes(k)))){
                if(cur&&cur.rows.length)fin(cur);
                const hd=row.map(c=>String(c||'').trim().replace(/,?\s*(USD|RUB)\s*с НДС/i,''));
                let det=row.join(' ').includes('USD')?'USD':'RUB';
                cur={cols:hd.filter(h=>h),rows:[],currency:det};
                if(!cur.cols.length)cur.cols=[...DC];
                continue;
            }
            // Если это сохранённый файл и строка начинается с цифры (номер строки) — извлекаем данные
            if(looksLikeSavedFile&&f&&!isNaN(parseInt(f))&&row.length>=5){
                if(!cur)cur={cols:[...DC],rows:[],currency:'RUB'};
                const dr=row.slice(1).map(c=>{
                    const v=String(c??'').trim();
                    const num=pn(v);
                    return!isNaN(num)?parseFloat(num.toFixed(2)):v;
                });
                while(dr.length<cur.cols.length)dr.push('');
                cur.rows.push(dr.slice(0,cur.cols.length));
                continue;
            }
            if(!cur)cur={cols:[...DC],rows:[],currency:'RUB'};
            const dr=row.map(c=>{
                const v=String(c??'').trim();
                const num=pn(v);
                return!isNaN(num)?parseFloat(num.toFixed(2)):v;
            });
            while(dr.length<cur.cols.length)dr.push('');
            cur.rows.push(dr.slice(0,cur.cols.length));
        }
        if(cur&&cur.rows.length)fin(cur);
        function fin(c){
            if(!c.cols.length)c.cols=[...DC];
            if(!c.rows.length)c.rows=[Array(c.cols.length).fill('')];
            idC++;ws.push({id:idC,cols:c.cols,rows:c.rows,currency:c.currency,el:null,card:null});
        }
    });
    ws.forEach(td=>{const card=buildCardDOM(td);a.appendChild(card);td.card=card;render(td);});
    upEmpty();
    if(!ws.length)addTable('USD');
    else{setAct(ws[0].id);toast(`Загружено: ${ws.length} табл.`);}
}

// ==================== ХОТКЕИ ====================
function findHotkeyConflict(key,excludeHk){for(const[k,v]of Object.entries(hotkeys)){if(k!==excludeHk&&v===key)return k;}return null;}
function renderHotkeyList(){const container=Q('#hotkeyList');if(!container)return;container.innerHTML=Object.keys(defaultHotkeys).map(k=>{const key=hotkeys[k]||'';return`<div class="hotkey-row"><span class="hk-label">${keyLabels[k]||k}</span><span class="hk-current${!key?' conflict':''}" data-hk="${k}">${key?'Shift+'+hkDisplay(key):'—'}</span></div>`;}).join('');container.querySelectorAll('.hk-current').forEach(el=>{el.onclick=()=>startRecording(el);});}
function startRecording(el){if(recordingKey){recordingKey.classList.remove('recording','conflict');}recordingKey=el;recordingHk=el.dataset.hk;el.classList.add('recording');el.textContent='...';const handler=e=>{e.preventDefault();e.stopPropagation();let key=e.key.toUpperCase();if(key==='DELETE'||key==='DEL')key='DELETE';if(key==='CONTROL'||key==='SHIFT'||key==='ALT')return;const conflict=findHotkeyConflict(key,recordingHk);if(conflict&&conflict!==recordingHk){if(!confirm(`Клавиша «Shift+${hkDisplay(key)}» уже назначена на «${keyLabels[conflict]}».\n\nПереназначить?`)){el.textContent=hotkeys[recordingHk]?'Shift+'+hkDisplay(hotkeys[recordingHk]):'—';el.classList.remove('recording','conflict');recordingKey=null;recordingHk=null;document.removeEventListener('keydown',handler);return;}hotkeys[conflict]='';}hotkeys[recordingHk]=key;el.textContent='Shift+'+hkDisplay(key);el.classList.remove('recording','conflict');recordingKey=null;recordingHk=null;saveNow();updateAllHKDisplays();renderHotkeyList();document.removeEventListener('keydown',handler);toast(`«${keyLabels[recordingHk]}» → Shift+${hkDisplay(key)}`);};document.addEventListener('keydown',handler);}
function renderThemeOptions(containerId){const container=document.getElementById(containerId||'themeOptions');if(!container)return;container.innerHTML=themes.map(t=>`<div class="theme-card${t.id===colorTheme?' active':''}" data-theme="${t.id}"><div class="theme-preview" style="background:${t.gradient}">${t.letter}</div><div class="theme-name">${t.name}</div><div class="theme-desc">${t.desc}</div></div>`).join('');container.querySelectorAll('.theme-card').forEach(c=>c.onclick=()=>setColorTheme(c.dataset.theme));}
function toggleSection(toggleId,sectionId){const toggle=document.getElementById(toggleId);const section=document.getElementById(sectionId);if(!toggle||!section)return;toggle.classList.toggle('open');section.classList.toggle('open');}
function hideCtx(){Q('#ctxMenu').style.display='none';}
Q('#ctxMenu').addEventListener('click',e=>{const item=e.target.closest('.ctx-item');if(!item)return;const a=item.dataset.action;hideCtx();const td=active();if(!td&&!['paste','dupTable'].includes(a))return;if(td)setAct(td.id);switch(a){case'addRowAbove':if(td&&ctxD.r!==null)insRowAbove(td,ctxD.r);break;case'addRowBelow':if(td&&ctxD.r!==null)insRowBelow(td,ctxD.r);break;case'delRow':if(td&&ctxD.r!==null)delRow(td,ctxD.r);break;case'renameCol':if(td&&ctxD.c!==null)renameCol(td,ctxD.c);break;case'addColBefore':if(td&&ctxD.c!==null)insCol(td,ctxD.c);break;case'addColAfter':if(td&&ctxD.c!==null)insCol(td,ctxD.c+1);break;case'delCol':if(td&&ctxD.c!==null)delCol(td,ctxD.c);break;case'paste':paste();break;case'dupTable':if(td)dupTable(td);else dupTable();break;case'delTable':if(td&&workspaces[activeWorkspace].length>1){td.card.remove();const ws=workspaces[activeWorkspace];ws.splice(ws.indexOf(td),1);if(actId===td.id)actId=ws.length?ws[0].id:null;upEmpty();}break;}});
document.addEventListener('click',e=>{if(!Q('#ctxMenu').contains(e.target))hideCtx();const pvCtx=Q('#priceViewCtxMenu');if(pvCtx&&!pvCtx.contains(e.target))hidePriceViewCtx();});

function handleGlobalHotkeys(e){
    if(e.ctrlKey&&!e.shiftKey&&!e.altKey&&e.key.toLowerCase()==='z'){e.preventDefault();undo();return;}
    if(e.ctrlKey&&!e.shiftKey&&!e.altKey&&e.key.toLowerCase()==='f'){e.preventDefault();findInTable();return;}
    if(e.ctrlKey&&!e.shiftKey&&!e.altKey&&e.key.toLowerCase()==='t'){e.preventDefault();toggleTheme();return;}
    if(e.ctrlKey&&!e.shiftKey&&!e.altKey&&e.key.toLowerCase()==='u'){e.preventDefault();checkUpdate();return;}
    if(e.key==='F3'){e.preventDefault();if(window._nr)window._nr();return;}
    if(e.ctrlKey&&!e.shiftKey&&!e.altKey&&(e.key>='1'&&e.key<='5')){e.preventDefault();switchWorkspace(parseInt(e.key));return;}
    if(e.shiftKey&&!e.ctrlKey&&!e.altKey&&!e.target.closest('input')&&!recordingKey){
        let key=e.key.toUpperCase();
        if(e.code==='Digit1')key='1';if(e.code==='Digit2')key='2';if(e.code==='Delete')key='DELETE';
        if(e.code==='Numpad1')key='1';if(e.code==='Numpad2')key='2';if(e.code==='NumpadDecimal')key='DELETE';
        if(RU[key])key=RU[key];
        const actions={addRow:()=>{e.preventDefault();const t=active();t?addRowEnd(t):toast('Выберите таблицу!',0);},delRow:()=>{e.preventDefault();const t=active();t?delRowEnd(t):toast('Выберите таблицу!',0);},addCol:()=>{e.preventDefault();const t=active();t?addColEnd(t):toast('Выберите таблицу!',0);},delCol:()=>{e.preventDefault();const t=active();t?delColEnd(t):toast('Выберите таблицу!',0);},recalc:()=>{e.preventDefault();workspaces[activeWorkspace].forEach(td=>{td.rows.forEach(r=>calc(r,td.cols));updTot(td);});toast('Пересчитано');},paste:()=>{e.preventDefault();paste();},load:()=>{e.preventDefault();loadViaDialog();},newRUB:()=>{e.preventDefault();addTable('RUB');},newUSD:()=>{e.preventDefault();addTable('USD');},dup:()=>{e.preventDefault();dupTable();},clear:()=>{e.preventDefault();const a=getArea();if(!workspaces[activeWorkspace].length)return;if(confirm('Удалить все?')){a.innerHTML='';workspaces[activeWorkspace].length=0;idC=0;actId=null;upEmpty();toast('Очищено');}},undo:()=>{e.preventDefault();undo();},save:()=>{e.preventDefault();save();},convert:()=>{e.preventDefault();const t=active();if(t)convertCurrency(t);else toast('Выберите таблицу!',0);}};
        for(const[k,v]of Object.entries(hotkeys)){if(key===v&&actions[k]){actions[k]();return;}}
    }
    if(e.ctrlKey&&!e.shiftKey&&!e.altKey){let k=e.key.toLowerCase();if(RU[k])k=RU[k];if(k==='v'&&!e.target.closest('input')){e.preventDefault();gPaste(e);}if(k==='s'){e.preventDefault();save();}if(k==='o'){e.preventDefault();loadViaDialog();}if(k==='d'&&!e.target.closest('input')){e.preventDefault();dupTable();}}
}
function gPaste(e){const td=active();if(!td)return;if(e)e.preventDefault();navigator.clipboard.readText().then(text=>{const p=parseCB(text);if(!p.length)return toast('Нет данных',0);insertRowsIntoTable(td,p);}).catch(()=>{});}
function handleGlobalPaste(e){if(e.target.closest('input'))return;e.preventDefault();gPaste(e);}
function buildShortcuts(){const bar=Q('#shortcutsBar');if(!bar)return;bar.innerHTML='<span><kbd>Shift+'+hkDisplay(hotkeys.addRow)+'</kbd> Строка</span> <span><kbd>Shift+'+hkDisplay(hotkeys.convert)+'</kbd> Конверт.</span> <span><kbd>Shift+'+hkDisplay(hotkeys.save)+'</kbd> Сохранить</span> <span><kbd>Ctrl+Z</kbd> Отмена</span> <span><kbd>Ctrl+F</kbd> Поиск</span> <span><kbd>ПКМ</kbd> Меню</span>';}
async function checkUpdate(){toast('Проверка обновлений...');try{const r=await fetch('https://raw.githubusercontent.com/Dangergrow/Speka-ontek/main/version.json',{cache:'no-cache'});const d=await r.json();if(d.version>'4.8.0'){if(confirm(`🆕 Версия ${d.version}!\n\n${d.notes||''}\n\nОбновить?`)){if(window.pywebview&&window.pywebview.api){const result=JSON.parse(await window.pywebview.api.apply_update());if(result.success){toast('✅ Обновлено!');setTimeout(()=>location.reload(),1500);}else toast('Ошибка',false);}}}else toast('✅ Последняя версия');}catch(e){toast('Ошибка проверки',false);}}

// ==================== БИНДИНГ ====================
function bindAllEvents(){
    document.getElementById('btnTheme').onclick=toggleTheme;
    document.getElementById('btnUpdate').onclick=checkUpdate;
    document.getElementById('fileInput').onchange=e=>{if(e.target.files[0]){load(e.target.files[0]);e.target.value='';}};
    document.getElementById('priceFileInput').onchange=e=>{if(e.target.files[0]){loadPriceFile(e.target.files[0]);e.target.value='';}};
    document.getElementById('btnSettings').onclick=()=>{document.getElementById('settingsModal').classList.add('show');renderHotkeyList();renderThemeOptions('themeOptionsSettings');};
    document.getElementById('btnCloseSettings').onclick=()=>document.getElementById('settingsModal').classList.remove('show');
    document.getElementById('settingsModal').addEventListener('click',function(e){if(e.target===this)this.classList.remove('show');});
    document.getElementById('hkToggle').onclick=()=>toggleSection('hkToggle','hkSection');
    document.getElementById('themeToggle').onclick=()=>{toggleSection('themeToggle','themeSection');renderThemeOptions('themeOptionsSettings');};
    document.getElementById('backupToggle').onclick=()=>toggleSection('backupToggle','backupSection');
    document.getElementById('aboutToggle').onclick=()=>toggleSection('aboutToggle','aboutSection');
    document.getElementById('btnResetHotkeys').onclick=()=>{hotkeys={...defaultHotkeys};saveNow();updateAllHKDisplays();renderHotkeyList();toast('Сброшено');};
    document.getElementById('btnColorTheme').onclick=()=>{document.getElementById('colorThemeModal').classList.add('show');renderThemeOptions('colorThemeOptions');};
    document.getElementById('btnCloseColorTheme').onclick=()=>document.getElementById('colorThemeModal').classList.remove('show');
    document.getElementById('colorThemeModal').addEventListener('click',function(e){if(e.target===this)this.classList.remove('show');});
    const safeBind=(id,fn,retries=5)=>{const tryBind=()=>{const el=document.getElementById(id);if(el){el.onclick=fn;return true;}return false;};if(!tryBind()&&retries>0){setTimeout(()=>safeBind(id,fn,retries-1),100);}};
    safeBind('btnAddRow',()=>{const t=active();t?addRowEnd(t):toast('Выберите таблицу!',0);});
    safeBind('btnDelRow',()=>{const t=active();t?delRowEnd(t):toast('Выберите таблицу!',0);});
    safeBind('btnAddCol',()=>{const t=active();t?addColEnd(t):toast('Выберите таблицу!',0);});
    safeBind('btnDelCol',()=>{const t=active();t?delColEnd(t):toast('Выберите таблицу!',0);});
    safeBind('btnConvert',()=>{const t=active();if(t)convertCurrency(t);else toast('Выберите таблицу!',0);});
    safeBind('btnRecalc',()=>{workspaces[activeWorkspace].forEach(td=>{td.rows.forEach(r=>calc(r,td.cols));updTot(td);});toast('Пересчитано');});
    safeBind('btnPaste',paste);safeBind('btnNewRUB',()=>addTable('RUB'));safeBind('btnNewUSD',()=>addTable('USD'));
    safeBind('btnSave',save);safeBind('btnLoad',loadViaDialog);
    safeBind('btnClear',()=>{if(!workspaces[activeWorkspace].length)return;if(confirm('Удалить все?')){getArea().innerHTML='';workspaces[activeWorkspace].length=0;idC=0;actId=null;upEmpty();toast('Очищено');}});
    safeBind('btnDup',()=>dupTable());safeBind('btnUndo',undo);safeBind('btnFind',findInTable);
    safeBind('btnLoadPrice',loadPriceViaDialog);safeBind('btnViewPrice',viewPrice);safeBind('btnSearchPrice',searchInPrice);
    document.getElementById('btnPriceSearch').onclick=executeSearch;
    document.getElementById('btnCancelPriceSearch').onclick=()=>Q('#priceSearchModal').classList.remove('show');
    document.getElementById('btnClosePriceSearch').onclick=()=>Q('#priceSearchModal').classList.remove('show');
    Q('#priceSearchModal').addEventListener('click',function(e){if(e.target===this)this.classList.remove('show');});
    Q('#priceSearchInput').addEventListener('keydown',e=>{if(e.key==='Enter')executeSearch();});
    document.getElementById('btnClosePriceResults').onclick=()=>Q('#priceResultsModal').classList.remove('show');
    Q('#priceResultsModal').addEventListener('click',function(e){if(e.target===this)this.classList.remove('show');});
    document.getElementById('btnClosePriceSelect').onclick=()=>{Q('#priceSelectModal').classList.remove('show');selectedPriceRow=null;};
    Q('#priceSelectModal').addEventListener('click',function(e){if(e.target===this){this.classList.remove('show');selectedPriceRow=null;}});
    document.getElementById('btnManualCopy').onclick=showManualCopy;
    document.getElementById('btnCancelManual').onclick=()=>{Q('#manualCopyArea').style.display='none';const g=Q('#priceButtonsGrid');if(g)g.style.display='grid';};
    document.getElementById('btnClosePriceView').onclick=()=>{Q('#priceViewModal').classList.remove('show');hidePriceViewCtx();};
    Q('#priceViewModal').addEventListener('click',function(e){if(e.target===this){this.classList.remove('show');hidePriceViewCtx();}});
    document.getElementById('btnCloseFallback').onclick=()=>Q('#priceFallbackModal').classList.remove('show');
    document.getElementById('btnClosePriceFallback').onclick=()=>Q('#priceFallbackModal').classList.remove('show');
    document.getElementById('btnUseFallbackRow').onclick=useFallbackRow;
    Q('#priceFallbackModal').addEventListener('click',function(e){if(e.target===this)this.classList.remove('show');});
    makeDraggable('priceSearchDialog','priceSearchDragHandle');
    makeDraggable('priceResultsDialog','priceResultsDragHandle');
    makeDraggable('priceSelectDialog','priceSelectDragHandle');
    makeDraggable('priceViewDialog','priceViewDragHandle');
    makeDraggable('priceFallbackDialog','priceFallbackDragHandle');
}
