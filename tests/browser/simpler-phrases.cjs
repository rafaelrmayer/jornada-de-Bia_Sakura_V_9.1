const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:process.env.BIA_CHROMIUM_PATH||undefined,args:['--no-sandbox']});
const site=process.env.BIA_TEST_SITE||'http://127.0.0.1:8129',family='00000000-0000-4000-8000-000000000001',category='00000000-0000-4000-8000-000000000002',id='00000000-0000-4000-8000-000000000003';
let card={id,category_id:category,text:'Quero a mochila',image_ref:null,display_order:0,created_at:'2026-11-18T12:00:00Z',updated_at:'2026-11-18T12:00:00Z',deleted_at:null};const requests=[];const catalog=[{id:category,name:'Geral'}];
const ownerId='00000000-0000-4000-8000-000000000004',memberId='00000000-0000-4000-8000-000000000005',inviteId='00000000-0000-4000-8000-000000000006';
let accountRole='owner',experimentAdmin=false;let invites=[],members=[{id:ownerId,user_id:ownerId,email:'owner@gmail.com',role:'owner'},{id:memberId,user_id:memberId,email:'guest@gmail.com',role:'viewer'}];
const c=await browser.newContext({viewport:{width:390,height:900},serviceWorkers:'block'});
await c.addInitScript(()=>{
const voice={voiceURI:'local-test',name:'Voz local de teste',lang:'pt-BR',localService:true,default:true};
Object.defineProperty(window,'SpeechSynthesisUtterance',{value:class{constructor(text){this.text=text;}},configurable:true});
Object.defineProperty(window,'speechSynthesis',{value:{speaking:false,getVoices:()=>[voice],addEventListener(){},speak(u){queueMicrotask(()=>u.onend?.());},cancel(){},resume(){},pause(){}},configurable:true});
let config=null;window.google={accounts:{id:{initialize(value){config=value;window.__googleNonce=value.nonce;},renderButton(container){const button=document.createElement('button');button.type='button';button.id='fakeGoogleSignIn';button.textContent='Continuar com o Google (teste)';button.onclick=()=>config.callback({credential:'fictitious-google-token'});container.replaceChildren(button);},cancel(){},disableAutoSelect(){}}}};});
await c.route('**/*',async r=>{
const url=new URL(r.request().url());
if(url.origin===site)return r.continue();
if(url.hostname!=='jornada-de-bia-data-api.onrender.com')return r.abort();
const path=url.pathname;requests.push(r.request().method()+' '+path);let body;
if(path==='/openapi.json')body={paths:Object.fromEntries(['/v1/family-invitations/accept','/v1/family-members','/v1/family-categories','/v1/auth/families','/v1/card-trash','/v1/cards/{card_id}/archive','/v1/cards/{card_id}/restore'].map(x=>[x,{}])),components:{schemas:{CardCreate:{properties:{client_id:{}}}}}};
else if(path==='/v1/auth/password-recovery/status')body={enabled:true};
else if(path==='/v1/auth/capabilities')body={manage_experiments:experimentAdmin};
else if(path==='/v1/auth/google/config')body={enabled:true,client_id:'test-client.apps.googleusercontent.com'};
else if(path==='/v1/auth/google/challenge')body={challenge:'fictitious-challenge',nonce:'n'.repeat(43),expires_in:300};
else if(path==='/v1/auth/google/login')body={access_token:'fake-test-token',email:'test@gmail.com',expires_in:900};
else if(path==='/v1/auth/families')body=[{id:family,name:'Teste',role:accountRole}];
else if(path==='/v1/family-members')body=members;
else if(path==='/v1/family-invitations'&&r.request().method()==='POST'){const payload=JSON.parse(r.request().postData());body={id:inviteId,email:payload.email,role:payload.role,code:'a'.repeat(43),expires_at:new Date(Date.now()+48*3600000).toISOString(),used_at:null,revoked_at:null};invites=[body];}
else if(path==='/v1/family-invitations')body=invites;
else if(path==='/v1/family-invitations/accept'){if(JSON.parse(r.request().postData()).code!=='b'.repeat(43))return r.fulfill({status:400,contentType:'application/json',body:'{}'});body={id:family,name:'Teste',role:'viewer'};}
else if(path==='/v1/family-members/'+memberId&&r.request().method()==='PATCH'){const role=JSON.parse(r.request().postData()).role;members=members.map(m=>m.id===memberId?{...m,role}:m);body=members.find(m=>m.id===memberId);}
else if(path==='/v1/family-members/'+memberId&&r.request().method()==='DELETE'){members=members.filter(m=>m.id!==memberId);return r.fulfill({status:204});}
else if(path==='/v1/family-invitations/'+inviteId&&r.request().method()==='DELETE'){invites=invites.map(i=>({...i,revoked_at:new Date().toISOString()}));return r.fulfill({status:204});}
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
assert.equal(requests.length,0);assert.equal(await p.locator('#experimentalCardsAdmin').isVisible(),false);assert.equal(await p.locator('#dataAccountPassword').count(),0);assert.equal(await p.locator('#dataRecoveryForm').count(),0);
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
await nav('settings');await p.locator('#dataGoogleStart').click();await p.locator('#fakeGoogleSignIn').click();await p.locator('#dataAccountConnected').waitFor({state:'visible'});
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
await nav('settings');await p.locator('#dataGoogleStart').click();await p.locator('#fakeGoogleSignIn').click();await p.locator('#dataAccountConnected').waitFor({state:'visible'});
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
await nav('settings');if(await p.locator('#dataAccountSignIn').isVisible()){await p.locator('#dataGoogleStart').click();await p.locator('#fakeGoogleSignIn').click();await p.locator('#dataAccountConnected').waitFor({state:'visible'});}await p.locator('#dataAccountAdvanced').evaluate(el=>el.open=true);await p.locator('#dataAccountTrash').click();
await p.locator('#dataAccountDifferences details > summary').click();await p.getByRole('button',{name:'Arquivar somente na conta',exact:true}).click();
await p.waitForFunction(()=>document.getElementById('dataAccountStatus').textContent.includes('Cópia arquivada'));
await p.evaluate(()=>{window.__saveOriginal=StorageService.setItem;StorageService.setItem=()=>false;});
await p.getByRole('button',{name:'Restaurar em Minhas frases',exact:true}).click();
await p.waitForFunction(()=>document.getElementById('dataAccountStatus').textContent.includes('não pôde ser salva'));
assert.equal(card.deleted_at,null);assert.equal(await p.evaluate(()=>JBCommunication.snapshot().phrases.length),1);
await p.evaluate(()=>{StorageService.setItem=window.__saveOriginal;});
await p.getByRole('button',{name:'Restaurar em Minhas frases',exact:true}).click();
await p.waitForFunction(()=>document.getElementById('dataAccountStatus').textContent.includes('Frase disponível'));
// Compartilhamento: três ações recolhidas, convite copiável, lista atualizada e papéis preservados.
await nav('settings');
assert.equal(await p.locator('.family-sharing-choice[open]').count(),0);
await p.getByText('Convidar alguém',{exact:true}).click();
await p.locator('#dataInviteEmail').fill('newguest@gmail.com');
assert.match(await p.locator('#dataInviteRoleHelp').innerText(),/Não pode alterar/);
await p.locator('#dataInviteRole').selectOption('member');assert.match(await p.locator('#dataInviteRoleHelp').innerText(),/Não pode convidar/);
await p.locator('#dataInviteForm button[type="submit"]').click();await p.locator('#dataInviteCreated').waitFor({state:'visible'});
await p.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async value=>window.__copiedInvite=value},configurable:true});});
await p.locator('#dataInviteCopy').click();
assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
if(process.env.BIA_SHARING_SCREENSHOT)await p.locator('.family-sharing').screenshot({path:process.env.BIA_SHARING_SCREENSHOT});
const shared=await p.evaluate(()=>window.__copiedInvite);assert(shared.includes('newguest@gmail.com')&&shared.includes('a'.repeat(43))&&shared.includes('48 horas'));
assert.equal(await p.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}).includes('a'.repeat(43))),false);
await p.getByText('Pessoas com acesso',{exact:true}).click();
await p.waitForFunction(()=>document.getElementById('dataAccessList').textContent.includes('guest@gmail.com'));
assert.equal(await p.locator('#dataInviteForm').isVisible(),false);
await p.getByRole('button',{name:'Permitir alterações',exact:true}).click();
await p.waitForFunction(()=>document.getElementById('dataAccessList').textContent.includes('Pode editar e organizar'));
await p.getByRole('button',{name:'Remover acesso',exact:true}).click();
await p.waitForFunction(()=>!document.getElementById('dataAccessList').textContent.includes('guest@gmail.com — Pode'));
await p.getByRole('button',{name:'Cancelar convite',exact:true}).click();
await p.waitForFunction(()=>document.getElementById('dataAccessList').textContent.includes('cancelado'));
await p.getByText('Recebi um convite',{exact:true}).click();assert.equal(await p.locator('#dataAccessLoad').isVisible(),false);
assert.equal(await p.locator('#dataInviteAcceptForm').isVisible(),true);
await p.locator('#dataInviteAcceptCode').fill('b'.repeat(43));await p.locator('#dataInviteAcceptForm button[type="submit"]').click();
await p.waitForFunction(()=>document.getElementById('dataAccountStatus').textContent.includes('Convite aceito'));
await p.locator('#dataAccountLogout').click();accountRole='viewer';
await p.locator('#dataGoogleStart').click();await p.locator('#fakeGoogleSignIn').click();await p.locator('#dataAccountConnected').waitFor({state:'visible'});
assert.equal(await p.locator('#dataInviteForm').isVisible(),false);
assert.equal(await p.getByText('Pessoas com acesso',{exact:true}).isVisible(),false);
assert.equal(await p.getByText('Recebi um convite',{exact:true}).isVisible(),true);
// O papel de responsável não concede laboratório. Mesmo submit programático não grava sem capacidade.
assert.equal(await p.locator('#experimentalCardsAdmin').isVisible(),false);
const previousMode=await p.evaluate(()=>localStorage.getItem('bia-card-suggestion-mode'));
await p.locator('#neuralApiForm').evaluate(form=>form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
await p.waitForFunction(()=>document.getElementById('neuralApiConfigStatus').textContent.includes('administradora autorizada'));
assert.equal(await p.evaluate(()=>localStorage.getItem('bia-card-suggestion-mode')),previousMode);
await p.locator('#dataAccountLogout').click();accountRole='owner';experimentAdmin=true;
await p.locator('#dataGoogleStart').click();await p.locator('#fakeGoogleSignIn').click();await p.locator('#dataAccountConnected').waitFor({state:'visible'});
assert.equal(await p.locator('#experimentalCardsAdmin').isVisible(),true);
await p.locator('#neuralCardsMode').selectOption('remote');await p.locator('#neuralApiUrl').fill('https://api.example.test');
await p.locator('#neuralApiForm button[type="submit"]').click();
await p.waitForFunction(()=>localStorage.getItem('bia-card-suggestion-mode')==='remote');
experimentAdmin=false;
await p.locator('#neuralCardsMode').selectOption('local');await p.locator('#neuralApiForm button[type="submit"]').click();
await p.waitForFunction(()=>document.getElementById('experimentalCardsAdmin').hidden);
assert.equal(await p.evaluate(()=>localStorage.getItem('bia-card-suggestion-mode')),'remote');
await p.locator('#dataAccountLogout').click();assert.equal(await p.locator('#experimentalCardsAdmin').isVisible(),false);
assert.equal(await p.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}).includes('fake-test-token')),false);
// Comunicação única e atalhos de uso real, sem mudar a ordem da lista.
await nav('settings');await p.locator('#voiceSelect').selectOption({label:'Voz local de teste (pt-BR)'});await nav('my-communication');
assert.equal(await p.locator('.visual-bottom-nav [data-page="cards"]').count(),0);
assert.equal(await p.locator('#page-cards').count(),0);
assert.equal(await p.locator('#myCommMostUsed').isVisible(),false);
for(const text of ['Quero descansar','Quero água']){
 await p.locator('#myCommAddPhrase').click();await p.locator('#myCommPhraseText').fill(text);await p.locator('#myCommPhraseCategory').selectOption('Geral');await p.locator('#myCommPhraseForm button[type="submit"]').click();
}
await p.locator('#myCommAddSymbol').click();await p.locator('#symbolEmoji').fill('🎒');await p.locator('#symbolLabel').fill('Mochila pessoal');await p.locator('#symbolModalSave').click();
assert((await p.locator('#homeQuickSymbolsGrid').textContent()).includes('Mochila pessoal'));
const orderBefore=await p.evaluate(()=>JBCommunication.snapshot().phrases.map(p=>p.id));
const water=await p.evaluate(()=>JBCommunication.snapshot().phrases.find(p=>p.text==='Quero água').id);
const rest=await p.evaluate(()=>JBCommunication.snapshot().phrases.find(p=>p.text==='Quero descansar').id);
await p.locator('#myCommPhraseList [data-speak="'+water+'"]').click();await p.locator('#myCommPhraseList [data-speak="'+water+'"]').click();await p.locator('#myCommPhraseList [data-speak="'+rest+'"]').click();
assert.deepEqual(await p.locator('#myCommMostUsedGrid [data-speak]').evaluateAll(nodes=>nodes.map(n=>n.dataset.speak)),[water,rest]);
assert.deepEqual(await p.evaluate(()=>JBCommunication.snapshot().phrases.map(p=>p.id)),orderBefore);
assert(!(await p.locator('#page-my-communication').innerText()).includes('Quero jogar Zelda: Ocarina of Time.'));
await p.evaluate(()=>showPage('cards'));assert.equal(await p.locator('#page-my-communication').isVisible(),true);
// Prévia e cancelamento não aumentam uso; confirmação aumenta uma única vez.
await nav('settings');await p.locator('#guidedVoiceEnabled').check();await nav('my-communication');
const count=()=>p.evaluate(()=>JSON.parse(StorageService.getItem('phraseUsage'))['Quero água']);
const prior=await count();await p.locator('#myCommMostUsedGrid [data-speak="'+water+'"]').click();await p.locator('#guidedVoiceListen').click();await p.locator('#guidedVoiceCancel').click();assert.equal(await count(),prior);
await p.locator('#myCommMostUsedGrid [data-speak="'+water+'"]').click();await p.locator('#guidedVoiceConfirm').click();assert.equal(await count(),prior+1);
await nav('settings');await p.locator('#guidedVoiceEnabled').uncheck();await nav('my-communication');
await p.locator('#myCommPhraseList [data-delete="'+water+'"]').click();assert.equal(await p.locator('#myCommMostUsedGrid [data-speak="'+water+'"]').count(),0);
await p.locator('#myCommOpenTrash').click();await p.locator('[data-restore-phrase="'+water+'"]').click();assert.equal(await p.locator('#myCommMostUsedGrid [data-speak="'+water+'"]').count(),1);
assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
// O backup protegido mantém as contagens que alimentam os atalhos.
await nav('settings');const usageDownloadPromise=p.waitForEvent('download');await p.locator('#exportDataBtn').click();const usageDownload=await usageDownloadPromise;
const usageWrapper=JSON.parse(require('node:fs').readFileSync(await usageDownload.path(),'utf8'));
const usageBackup=await p.evaluate(wrapper=>BackupService.readAndValidate(new File([JSON.stringify(wrapper)],'backup-teste.json',{type:'application/json'})),usageWrapper);
assert.equal(usageBackup.data.phraseUsage['Quero água'],prior+1);
await nav('my-communication');
if(process.env.BIA_UNIFIED_SCREENSHOT)await p.locator('#page-my-communication').screenshot({path:process.env.BIA_UNIFIED_SCREENSHOT});
assert.deepEqual(errors,[]);
console.log('PASS: local trash, restore, cancel, failed write, reload, no learning changes, remote archive preserves local, recovery restores local trash in one action, generic import preserves local trash, mobile. API mocked; no production request.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
