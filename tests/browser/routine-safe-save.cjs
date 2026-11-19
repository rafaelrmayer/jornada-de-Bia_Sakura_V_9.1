const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:process.env.BIA_CHROMIUM_PATH||undefined,args:['--no-sandbox']});
try{
 const site=process.env.BIA_TEST_SITE||'http://127.0.0.1:8147';
 const context=await browser.newContext({viewport:{width:390,height:900},serviceWorkers:'block'});
 await context.route('**/*',r=>r.request().url().startsWith(site)?r.continue():r.abort());
 async function open(){const p=await context.newPage();await p.goto(site);await p.waitForFunction(()=>window.setGuardianMode);await p.evaluate(()=>{setGuardianMode(true);showPage('routine')});await p.locator('#biaRoutineManage').click();return p;}
 const a=await open(),b=await open();
 const read=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('bia-routine-sakura-v1')));
 const add=async(p,name)=>{await p.locator('#biaRoutineName').fill(name);await p.locator('#biaRoutineAdd').click();};
 await add(a,'Atividade A');await a.waitForFunction(()=>JSON.parse(localStorage.getItem('bia-routine-sakura-v1'))?.items.some(x=>x.name==='Atividade A'));
 await add(b,'Atividade B');await b.waitForFunction(()=>document.getElementById('biaRoutineSaveStatus').textContent.includes('outra aba'));
 assert.equal(await b.locator('#biaRoutineName').inputValue(),'Atividade B');
 assert.ok((await read(b)).items.some(x=>x.name==='Atividade A'));assert.ok(!(await read(b)).items.some(x=>x.name==='Atividade B'));
 await b.locator('#biaRoutineAdd').click();await b.waitForFunction(()=>document.getElementById('biaRoutineName').value==='');
 assert.ok((await read(b)).items.some(x=>x.name==='Atividade A'));assert.ok((await read(b)).items.some(x=>x.name==='Atividade B'));
 // Duas inclusões concorrentes: uma vence; a outra deve exigir revisão.
 const c=await open(),d=await open();await c.locator('#biaRoutineName').fill('Concorrente C');await d.locator('#biaRoutineName').fill('Concorrente D');
 await Promise.all([c.locator('#biaRoutineAdd').click(),d.locator('#biaRoutineAdd').click()]);
 await c.waitForTimeout(150);
 const names=(await read(c)).items.map(x=>x.name);assert.equal(names.filter(n=>/^Concorrente/.test(n)).length,1);
 const loser=names.includes('Concorrente C')?d:c;assert.match(await loser.locator('#biaRoutineSaveStatus').innerText(),/outra aba/);assert.notEqual(await loser.locator('#biaRoutineName').inputValue(),'');
 // Falha de escrita não altera lista, marcação, ordem ou preferências.
 const p=await open(),before=await read(p);
 await p.evaluate(()=>{window.__routineSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='bia-routine-sakura-v1')throw new DOMException('teste','QuotaExceededError');return window.__routineSetItem.call(this,k,v)}});
 await add(p,'Não salvar');await p.waitForFunction(()=>document.getElementById('biaRoutineSaveStatus').textContent.includes('Não foi possível salvar'));
 assert.equal(await p.locator('#biaRoutineName').inputValue(),'Não salvar');assert.equal((await p.locator('#biaRoutineList').innerText()).includes('Não salvar'),false);assert.deepEqual(await read(p),before);
 await p.locator('#biaRoutineLearn').uncheck();await p.waitForFunction(()=>document.getElementById('biaRoutineLearn').checked);assert.deepEqual(await read(p),before);
 await p.locator('#biaRoutineFinishNow').click();await p.waitForTimeout(100);assert.deepEqual(await read(p),before);assert.equal(await p.locator('.bia-routine-card.done').count(),0);
 await p.evaluate(()=>Storage.prototype.setItem=window.__routineSetItem);
 await p.locator('#biaRoutineAdd').click();await p.waitForFunction(()=>document.getElementById('biaRoutineName').value==='');
 await p.reload();await p.evaluate(()=>showPage('routine'));assert.ok((await read(p)).items.some(x=>x.name==='Não salvar'));
 // Virada do dia preserva tarefas e reinicia marcações, sem duplicar itens.
 await p.evaluate(()=>{const k='bia-routine-sakura-v1',s=JSON.parse(localStorage.getItem(k));s.date='2026-01-01';s.items.forEach(x=>x.done=true);localStorage.setItem(k,JSON.stringify(s));});
 await p.reload();await p.waitForFunction(()=>JSON.parse(localStorage.getItem('bia-routine-sakura-v1')).items.every(x=>!x.done));assert.equal((await read(p)).items.length,before.items.length+1);
 console.log('PASS: stale tabs preserve both additions after explicit retry; concurrent writes serialized; quota errors preserve draft and persisted state; retry, reload and daily reset work. No production requests.');
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
