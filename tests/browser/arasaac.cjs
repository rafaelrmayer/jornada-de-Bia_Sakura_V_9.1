const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{const b=await chromium.launch({executablePath:process.env.BIA_CHROMIUM_PATH||undefined,args:['--no-sandbox']});try{
 const site=process.env.BIA_TEST_SITE||'http://127.0.0.1:8150',c=await b.newContext({viewport:{width:390,height:900},serviceWorkers:'block'});let searches=0,fail=false;
 const png=fs.readFileSync(path.join(__dirname,'../../assets/arasaac/2276.png'));
 await c.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===site)return r.continue();if(u.hostname==='api.arasaac.org'){searches++;return r.fulfill({status:fail?503:200,contentType:'application/json',body:JSON.stringify([{_id:2276,keywords:[{keyword:'água'}]},{_id:7171,keywords:[{keyword:'ajuda'}]}])})}if(u.hostname==='static.arasaac.org')return r.fulfill({contentType:'image/png',body:png});return r.abort();});
 const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(site);await p.waitForFunction(()=>window.JBCommunication);assert.equal(searches,0);
 await p.evaluate(()=>{setGuardianMode(true);showPage('my-communication')});await p.locator('#myCommAddSymbol').click();
 await p.locator('#arasaacQuery').fill('água');await p.locator('#arasaacSearch').click();await p.locator('#arasaacResults button').first().waitFor();
 await p.locator('#arasaacResults button').first().click();await p.waitForFunction(()=>JBArasaac.getSelected()?.id===2276);if(process.env.BIA_ARASAAC_SCREENSHOT)await p.locator('#arasaacPicker').screenshot({path:process.env.BIA_ARASAAC_SCREENSHOT});
 await p.locator('#symbolLabel').fill('Água ARASAAC teste');await p.locator('#symbolCategory').selectOption('objetos');
 // Falha não fecha o modal nem confirma símbolo sem persistência.
 await p.evaluate(()=>{window.__originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='symbolsData')throw Error('quota');return window.__originalSet.call(this,k,v)}});await p.locator('#symbolModalSave').click();assert.equal(await p.locator('#symbolModal').evaluate(e=>e.classList.contains('active')),true);assert.equal(await p.locator('#symbolLabel').inputValue(),'Água ARASAAC teste');
 await p.evaluate(()=>Storage.prototype.setItem=window.__originalSet);await p.locator('#symbolModalSave').click();
 const saved=await p.evaluate(()=>JSON.parse(StorageService.getItem('symbolsData')).find(s=>s.label==='Água ARASAAC teste'));assert.equal(saved.pictogram.id,2276);assert.equal(saved.pictogram.author,'Sergio Palao');assert.match(saved.pictogram.image,/^data:image\/png;base64,/);
 await p.reload();await p.waitForFunction(()=>window.JBCommunication);await p.evaluate(()=>showPage('my-communication'));await p.locator('#homeQuickSymbolsToggle').click();await p.locator('[aria-controls="home-quick-grid-objetos"]').click();await c.setOffline(true);
 const card=p.locator('#homeQuickSymbolsGrid [data-symbol-id="'+saved.id+'"]');await card.click();assert.equal(await p.locator('#feedbackDisplay .symbol-pictogram').count(),1);assert.equal(await card.locator('img').evaluate(i=>i.complete&&i.naturalWidth>0),true);
 await p.evaluate(()=>saveMessage());assert.equal(await p.evaluate(()=>JSON.parse(StorageService.getItem('symbolHistory'))[0].symbols.some(s=>s.pictogram?.image)),false);
 await c.setOffline(false);await p.evaluate(()=>{setGuardianMode(true);showPage('my-communication')});await p.locator('#myCommAddSymbol').click();fail=true;await p.locator('#arasaacQuery').fill('falha');await p.locator('#arasaacSearch').click();await p.waitForFunction(()=>document.getElementById('arasaacStatus').textContent.includes('Não foi possível'));
 await p.evaluate(()=>setGuardianMode(false));assert.equal(await p.evaluate(()=>JBArasaac.getSelected()),null);assert.deepEqual(errors,[]);
 console.log('PASS: search is explicit, selection saved with attribution, failed write preserves form, image renders offline after reload and builds phrase; search failure and lock preserve safety. API mocked.');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
