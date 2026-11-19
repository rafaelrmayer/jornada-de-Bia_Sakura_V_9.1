const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:process.env.BIA_CHROMIUM_PATH||undefined,args:['--no-sandbox']});try{
const site=process.env.BIA_TEST_SITE||'http://127.0.0.1:8149',context=await browser.newContext({serviceWorkers:'block'});
await context.route('**/*',r=>r.request().url().startsWith(site)?r.continue():r.abort());
await context.addInitScript(()=>{for(const key of ['symbolsData','guardians','symbolHistory','favoriteIds','childProfile','symbolUsage','aiFeedback'])localStorage.setItem(key,'{invalid-json');});
const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept('senha-ficticia-teste'));
await p.goto(site);await p.waitForFunction(()=>window.JBCommunication);assert.deepEqual(errors,[]);
assert.equal(await p.evaluate(()=>localStorage.getItem('symbolHistory')),'{invalid-json');
await p.evaluate(()=>{setGuardianMode(true);showPage('medical');openAllergiesSelector()});
assert.equal(await p.locator('#allergiesModal').evaluate(e=>e.classList.contains('active')),true);
await p.evaluate(()=>setGuardianMode(false));assert.equal(await p.locator('#allergiesModal').evaluate(e=>e.classList.contains('active')),false);assert.equal(await p.locator('#allergiesList').innerText(),'');assert.equal(await p.locator('#healthPlanModal').count(),0);
// Bloquear e desbloquear não autoriza retomar uma importação iniciada na sessão anterior.
await p.evaluate(()=>{setGuardianMode(true);window.__saved=localStorage.getItem('symbolsData');BackupService.readAndValidate=()=>new Promise(resolve=>window.__resolveRead=resolve)});
await p.locator('#importDataInput').setInputFiles({name:'teste.json',mimeType:'application/json',buffer:Buffer.from('{}')});await p.waitForFunction(()=>window.__resolveRead);
await p.evaluate(()=>{setGuardianMode(false);setGuardianMode(true);window.__resolveRead({type:'full',data:{symbolsData:[],guardians:[]}})});await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>localStorage.getItem('symbolsData')===window.__saved),true);
// Revalida novamente depois do backup de segurança assíncrono.
await p.evaluate(()=>{BackupService.readAndValidate=async()=>({type:'full',data:{symbolsData:[],guardians:[]}});BackupService.export=()=>new Promise(resolve=>window.__resolveExport=resolve);for(const k of ['predictorData','predictivePhraseData','phraseUsage','contextBrainData'])localStorage.setItem(k,'{}');});
await p.locator('#importDataInput').setInputFiles({name:'teste2.json',mimeType:'application/json',buffer:Buffer.from('{}')});await p.waitForFunction(()=>window.__resolveExport);
await p.evaluate(()=>{setGuardianMode(false);setGuardianMode(true);window.__resolveExport({data:{}})});await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>localStorage.getItem('symbolsData')===window.__saved),true);
assert.deepEqual(errors,[]);console.log('PASS: malformed local JSON does not stop app or overwrite originals; allergy dialog closes on lock; imports stop after session changes at both async stages. No production requests.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
