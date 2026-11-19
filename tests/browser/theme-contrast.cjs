const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:process.env.BIA_CHROMIUM_PATH||undefined,args:['--no-sandbox']});try{
const p=await b.newPage({viewport:{width:390,height:900},serviceWorkers:'block'}),site=process.env.BIA_TEST_SITE||'http://127.0.0.1:8148';
await p.route('**/*',r=>r.request().url().startsWith(site)?r.continue():r.abort());await p.goto(site);await p.waitForFunction(()=>window.setGuardianMode);await p.evaluate(()=>setGuardianMode(true));
async function pair(fg,bg=fg){const result=await p.evaluate(([f,b])=>{const e=document.querySelector(f),surface=document.querySelector(b),parse=s=>(s.match(/[\d.]+/g)||[]).map(Number);const lum=c=>c.slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((n,x,i)=>n+x*[.2126,.7152,.0722][i],0);const style=getComputedStyle(e),color=parse(style.webkitTextFillColor||style.color),raw=parse(getComputedStyle(surface).backgroundColor);let background=raw;if(raw[3]!==undefined&&raw[3]!==1){let base=[255,255,255],chain=[];for(let n=surface;n;n=n.parentElement)chain.unshift(n);for(const n of chain){const c=parse(getComputedStyle(n).backgroundColor),a=c[3]??1;base=c.slice(0,3).map((v,i)=>v*a+base[i]*(1-a));}background=base;}const l=[lum(color),lum(background)].sort((a,b)=>b-a);return (l[0]+.05)/(l[1]+.05);},[fg,bg]);assert.ok(result>=4.5,`${fg} on ${bg}: ${result.toFixed(2)}:1`);}
for(const theme of ['light','blue','dark','dark-blue']){
 await p.evaluate(t=>t==='light'?document.documentElement.removeAttribute('data-theme'):document.documentElement.setAttribute('data-theme',t),theme);
 await p.evaluate(()=>showPage('home'));await p.locator('[data-intent="quero"]').click();
 await pair('[data-intent="quero"] span','[data-intent="quero"]');
 await p.evaluate(()=>showPage('my-communication'));
 await pair('#myCommPhraseTitle','#page-my-communication .my-comm-panel');await pair('#myCommAddPhrase');await pair('#pictogramCards button .label','#pictogramCards button');await pair('#pictogramSentence','.pictogram-message');
 await p.evaluate(()=>showPage('settings'));await p.locator('#support-voice > summary').click();await pair('#voiceSelect','#voiceSelect');
 if(theme.startsWith('dark')){
  await p.evaluate(()=>showPage('medical'));await pair('#medSignal');
  await p.evaluate(()=>showPage('routine'));await pair('#biaRoutineNow');
  await p.evaluate(()=>showPage('word-goals'));await p.locator('#wgSummaryToggle').click();
  await pair('.wg-report h1','.wg-report');
  await p.getByRole('button',{name:'Revisar resumo para PDF ou WhatsApp'}).click();await pair('.wg-review .wg-report h1','.wg-review .wg-report');await p.getByRole('button',{name:'Voltar',exact:true}).click();
  await p.locator('#wgSummaryToggle').click();
 }
 console.log('PASS: text/background samples '+theme);
}
await p.evaluate(()=>{document.documentElement.setAttribute('data-theme','dark-blue');document.documentElement.classList.add('bia-a11y-contrast');showPage('my-communication')});await pair('#myCommAddPhrase');await pair('#myCommPhraseTitle','#page-my-communication .my-comm-panel');
console.log('PASS: high contrast overrides dark palette; external requests blocked');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
