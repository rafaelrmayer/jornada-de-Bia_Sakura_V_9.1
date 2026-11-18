const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:process.env.BIA_CHROMIUM_PATH||undefined,args:['--no-sandbox']});
const site=process.env.BIA_TEST_SITE||'http://127.0.0.1:8129',family='00000000-0000-4000-8000-000000000001',category='00000000-0000-4000-8000-000000000002',id='00000000-0000-4000-8000-000000000003';
let card={id,category_id:category,text:'Quero a mochila',image_ref:null,display_order:0,created_at:'2026-11-18T12:00:00Z',updated_at:'2026-11-18T12:00:00Z',deleted_at:null};const requests=[];const catalog=[{id:category,name:"Geral"}];
const c=await browser.newContext({viewport:{width:390,height:900},serviceWorkers:'block'});
await c.route('**/*',async r=>{
const url=new URL(r.request().url());
if(url.origin===site)return r.continue();
if(url.hostname!=='jornada-de-bia-data-api.onrender.com')return r.abort();
const path=url.pathname;requests.push(r.request().method()+' '+path);let body;
if(path==='/openapi.json')body={paths:Object.fromEntries(['/v1/family-categories','/v1/auth/families','/v1/card-trash','/v1/cards/{card_id}/archive','/v1/cards/{card_id}/restore'].map(x=>[x,{}])),components:{schemas:{CardCreate:{properties:{client_id:{}}}}}};
else if(path==='/v1/auth/password-recovery/status')body={enabled:true};
else if(path==='/v1/auth/login')body={access_token:'fake-test-token',expires_in:900};
else if(path==='/v1/auth/families')body=[{id:family,name:'Teste',role:'owner'}];
else if(path==='/v1/categories')body=catalog;
else if(path==='/v1/family-categories'){body={id:require('node:crypto').randomUUID(),name:JSON.parse(r.request().postData()).name};catalog.push(body);}
else if(path==='/v1/cards')body=card.deleted_at?[]:[card];
else if(path==='/v1/card-trash')body=card.deleted_at?[card]:[];
else if(path.endsWith('/archive')){card={...card,deleted_at:'2026-11-18T12:01:00Z',updated_at:'2026-11-18T12:01:00Z'};body=card;}
else if(path.endsWith('/restore')){card={...card,deleted_at:null,updated_at:'2026-11-18T12:02:00Z'};body=card;}
else throw Error('Unexpected request '+path);
return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
});
const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());await p.goto(site);await p.waitForFunction(()=>window.JBCommunication);
await p.evaluate(()=>{sessionStorage.setItem('jornadaGuardianUnlocked','true');setGuardianMode(true);});
const nav=name=>p.locator('.visual-bottom-nav [data-page="'+name+'"]').click();
await nav('my-communication');await p.locator('#myCommAddPhrase').click();await p.locator('#myCommPhraseText').fill('Quero a mochila');await p.locator('#myCommPhraseCategory').selectOption('Geral');await p.locator('#myCommPhraseForm button[type="submit"]').click();
const before=await p.evaluate(()=>JBCommunication.snapshot());
// Lixeira local funciona sem API, preserva aprendizado e restaura acima dos filtros.
const learned=await p.evaluate(()=>['phraseUsage','contextBrainData'].map(k=>StorageService.getItem(k)));
await p.locator('#myCommPhraseList [data-delete]').click();
assert.equal(await p.locator('#myCommPhraseList [data-delete]').count(),0);
assert.equal(await p.evaluate(()=>JBCommunication.snapshot().trash.length),1);
await p.locator('#myCommTrash').evaluate(el=>el.open=true);
await p.locator('[data-restore-phrase]').click();
assert.match(await p.locator('#myCommPhraseList').innerText(),/Quero a mochila/);
assert.equal(await p.evaluate(()=>JBCommunication.snapshot().trash.length),0);
assert.deepEqual(await p.evaluate(()=>['phraseUsage','contextBrainData'].map(k=>StorageService.getItem(k))),learned);
assert.equal(requests.length,0);
// Uma falha de gravação não remove a frase nem anuncia sucesso.
await p.evaluate(()=>{window.__saveOriginal=StorageService.setItem;StorageService.setItem=()=>false;});
await p.locator('#myCommPhraseList [data-delete]').click();
assert.match(await p.locator('#myCommPhraseList').innerText(),/Quero a mochila/);
assert.match(await p.locator('#myCommPhraseStatus').innerText(),/preservadas/);
await p.evaluate(()=>{StorageService.setItem=window.__saveOriginal;});
// Confirmar cancelamento não move frases.
p.removeAllListeners('dialog');p.on('dialog',d=>d.dismiss());
await p.locator('#myCommPhraseList [data-delete]').click();
assert.equal(await p.evaluate(()=>JBCommunication.snapshot().phrases.length),1);
p.removeAllListeners('dialog');p.on('dialog',d=>d.accept());
await nav('settings');await p.locator('#dataAccountEmail').fill('test@example.com');await p.locator('#dataAccountPassword').fill('abc123');await p.locator('#dataAccountSubmit').click();await p.locator('#dataAccountConnected').waitFor({state:'visible'});
assert.equal(await p.locator('#dataAccountAdvanced').getAttribute('open'),null);
await p.locator('#dataAccountSave').click();await p.waitForFunction(()=>document.getElementById('dataAccountStatus').textContent.includes('guardadas'));
assert.equal(requests.filter(x=>x==='POST /v1/family-categories').length,6);
await p.locator('#dataAccountSave').click();await p.waitForFunction(()=>document.getElementById('dataAccountStatus').textContent.includes('guardadas'));
assert.equal(requests.filter(x=>x==='POST /v1/family-categories').length,6);
await p.locator('#dataAccountAdvanced > summary').click();
await p.locator('#dataAccountTrash').click();
await p.locator('#dataAccountDifferences details > summary').click();
await p.getByRole('button',{name:'Arquivar somente na conta',exact:true}).click();
await p.waitForFunction(()=>document.getElementById('dataAccountStatus').textContent.includes('Cópia arquivada'));
assert.deepEqual(await p.evaluate(()=>JBCommunication.snapshot()),before);
await nav('my-communication');assert.match(await p.locator('#myCommPhraseList').innerText(),/Quero a mochila/);
await nav('settings');await p.locator('#dataAccountTrash').click();await p.getByRole('button',{name:'Restaurar em Minhas frases',exact:true}).click();await p.waitForFunction(()=>document.getElementById('dataAccountStatus').textContent.includes('Frase disponível'));
const recovered=await p.evaluate(()=>JBCommunication.snapshot());assert.deepEqual(recovered.phrases.map(({cloudSources,...phrase})=>phrase),before.phrases);
await nav('my-communication');assert.match(await p.locator('#myCommPhraseList').innerText(),/Quero a mochila/);
await p.reload();await p.waitForFunction(()=>window.JBCommunication);assert.deepEqual(await p.evaluate(()=>JBCommunication.snapshot()),recovered);
// A frase ausente localmente é recuperada por um único botão na conta.
await p.evaluate(()=>{sessionStorage.setItem('jornadaGuardianUnlocked','true');setGuardianMode(true);});
await nav('my-communication');await p.locator('#myCommPhraseList [data-delete]').click();
assert.equal(await p.evaluate(()=>JBCommunication.snapshot().trash.length),1);
await nav('settings');await p.locator('#dataAccountEmail').fill('test@example.com');await p.locator('#dataAccountPassword').fill('abc123');await p.locator('#dataAccountSubmit').click();await p.locator('#dataAccountConnected').waitFor({state:'visible'});
await p.locator('#dataAccountImport').click();await p.waitForFunction(()=>document.getElementById('dataAccountStatus').textContent.includes('já estão'));
assert.equal(await p.evaluate(()=>JBCommunication.snapshot().phrases.length),0); // não ressuscita por importação genérica
await p.locator('#dataAccountAdvanced').evaluate(el=>el.open=true);
await p.locator('#dataAccountTrash').click();await p.getByRole('button',{name:'Restaurar em Minhas frases',exact:true}).click();
await p.waitForFunction(()=>document.getElementById('dataAccountStatus').textContent.includes('Frase disponível'));
assert.equal(await p.evaluate(()=>JBCommunication.snapshot().phrases.length),1);
assert.equal(await p.evaluate(()=>JBCommunication.snapshot().trash.length),0);
await nav('my-communication');assert.match(await p.locator('#myCommPhraseList').innerText(),/Quero a mochila/);
assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
if(process.env.BIA_TEST_SCREENSHOT)await p.screenshot({path:process.env.BIA_TEST_SCREENSHOT,fullPage:true});
// Backup real criptografado inclui a lixeira e restauração local funciona offline.
await p.locator('#myCommPhraseList [data-delete]').click();
await nav('settings');p.removeAllListeners('dialog');p.on('dialog',d=>d.accept(d.type()==='prompt'?'SenhaFicticiaBackup2026':undefined));
const downloadPromise=p.waitForEvent('download');await p.locator('#exportDataBtn').click();const download=await downloadPromise;
const wrapper=JSON.parse(require('node:fs').readFileSync(await download.path(),'utf8'));assert.equal(wrapper.encrypted,true);
const backup=await p.evaluate(wrapper=>BackupCrypto.decrypt(wrapper,'SenhaFicticiaBackup2026'),wrapper);
assert.equal(backup.data.myCommunicationData.trash.length,1);assert.equal(backup.data.myCommunicationData.phrases.length,0);
await nav('my-communication');await p.locator('#myCommOpenTrash').click();
await p.evaluate(()=>setGuardianMode(false));await p.locator('[data-restore-phrase]').click();
assert.equal(await p.evaluate(()=>JBCommunication.snapshot().trash.length),1);
await p.evaluate(()=>setGuardianMode(true));await c.setOffline(true);const beforeOffline=requests.length;
await p.locator('[data-restore-phrase]').click();assert.equal(await p.evaluate(()=>JBCommunication.snapshot().phrases.length),1);
assert.equal(requests.length,beforeOffline);await c.setOffline(false);
// Servidor restaurado + falha local: não anunciar sucesso e permitir recuperar de novo.
await nav('settings');if(await p.locator('#dataAccountForm').isVisible()){await p.locator('#dataAccountEmail').fill('test@example.com');await p.locator('#dataAccountPassword').fill('abc123');await p.locator('#dataAccountSubmit').click();await p.locator('#dataAccountConnected').waitFor({state:'visible'});}await p.locator('#dataAccountAdvanced').evaluate(el=>el.open=true);await p.locator('#dataAccountTrash').click();
await p.locator('#dataAccountDifferences details > summary').click();await p.getByRole('button',{name:'Arquivar somente na conta',exact:true}).click();
await p.waitForFunction(()=>document.getElementById('dataAccountStatus').textContent.includes('Cópia arquivada'));
await p.evaluate(()=>{window.__saveOriginal=StorageService.setItem;StorageService.setItem=()=>false;});
await p.getByRole('button',{name:'Restaurar em Minhas frases',exact:true}).click();
await p.waitForFunction(()=>document.getElementById('dataAccountStatus').textContent.includes('não pôde ser salva'));
assert.equal(card.deleted_at,null);assert.equal(await p.evaluate(()=>JBCommunication.snapshot().phrases.length),1);
await p.evaluate(()=>{StorageService.setItem=window.__saveOriginal;});
await p.getByRole('button',{name:'Restaurar em Minhas frases',exact:true}).click();
await p.waitForFunction(()=>document.getElementById('dataAccountStatus').textContent.includes('Frase disponível'));
assert.deepEqual(errors,[]);
console.log('PASS: local trash, restore, cancel, failed write, reload, no learning changes, remote archive preserves local, recovery restores local trash in one action, generic import preserves local trash, mobile. API mocked; no production request.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
