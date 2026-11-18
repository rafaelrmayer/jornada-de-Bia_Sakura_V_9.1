const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');const path=require('node:path');
function env(initial={}){const values=new Map(Object.entries(initial));const storage={get length(){return values.size;},key:i=>[...values.keys()][i],getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};const ctx=vm.createContext({window:{},localStorage:storage,sessionStorage:storage});for(const file of ['module-data','storage'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/'+file+'.js'),'utf8'),ctx);return {ctx,storage,values,api:ctx.window.JornadaModuleData};}
test('backup adicional inclui rotina, emoções, avaliação, voz e preferências sem credenciais',()=>{const e=env({'bia-routine-sakura-v1':'{}',jornadaBiaEmotionHistoryV1:'[]','jornadaBia:rfEvaluationData':'[]',selectedVoice:'default',guardianPinHash:'segredo',jornadaGuardianUnlocked:'true',unrelated:'preservar'});const captured=e.api.snapshot(e.storage);assert.equal(Object.keys(captured).length,4);assert.equal(captured.guardianPinHash,undefined);const restored=env();e.api.restore(restored.storage,captured);assert.equal(restored.storage.getItem('jornadaBiaEmotionHistoryV1'),'[]');});
test('restauração valida todo o conjunto antes de escrever e rejeita chaves de sessão',()=>{const e=env();assert.throws(()=>e.api.restore(e.storage,{'bia-routine-sakura-v1':'{}',jornadaGuardianUnlocked:'true'}));assert.equal(e.storage.length,0);assert.throws(()=>e.api.restore(e.storage,{'bia-routine-sakura-v1':{}}));});
test('limpeza geral alcança módulos adicionais e preserva dados de outros aplicativos',()=>{const e=env({'bia-routine-sakura-v1':'{}',jornadaBiaEmotionHistoryV1:'[]','bia-experience-v1':'{}','bia-card-api-url':'https://api.example',unrelated:'preservar'});assert.equal(e.ctx.window.StorageService.clear(),true);assert.deepEqual([...e.values.entries()],[['unrelated','preservar']]);});
test('cache inicial cobre todos os scripts e folhas locais referenciados no HTML',()=>{const root=path.join(__dirname,'..');const html=fs.readFileSync(path.join(root,'index.html'),'utf8');const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8').split("self.addEventListener")[0];for(const [,asset] of html.matchAll(/(?:src|href)="((?:js|css)\/[^\"]+)"/g)){assert.ok(sw.includes("'./"+asset+"'"),asset);assert.ok(fs.existsSync(path.join(root,asset.split(/[?#]/,1)[0])),asset);}});
function backupService(){const e=env();e.ctx.JornadaModuleData=e.api;vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/backup.js'),'utf8'),e.ctx);return e.ctx.window.BackupService;}
test('leitura continua aceitando backup legado sem módulos adicionais',async()=>{const service=backupService();const text=JSON.stringify({type:'full',backupVersion:3,data:{symbolsData:[],guardians:[]}});const result=await service.readAndValidate({size:text.length,text:async()=>text});assert.equal(result.backupVersion,3);assert.equal(result.data.moduleData,undefined);});
test('backup de configuração não restaura campos pessoais nem dados de módulos extras',async()=>{const service=backupService();const text=JSON.stringify({type:'configuration',backupVersion:4,data:{symbolsData:[],theme:'blue',guardians:[{name:'teste'}],moduleData:{jornadaGuardianUnlocked:'true'}}});const result=await service.readAndValidate({size:text.length,text:async()=>text});assert.equal(result.data.theme,'blue');assert.equal(result.data.guardians,undefined);assert.equal(result.data.moduleData,undefined);});
test('preferência de voz guiada entra no backup protegido e na limpeza geral',()=>{
 const value=JSON.stringify({enabled:true,focus:false,rate:0.9,volume:0.8,voice:''});
 const e=env({'bia-guided-voice-v1':value,unrelated:'preservar'});
 assert.equal(e.api.snapshot(e.storage)['bia-guided-voice-v1'],value);
 e.ctx.window.StorageService.clear();
 assert.equal(e.storage.getItem('bia-guided-voice-v1'),null);
 assert.equal(e.storage.getItem('unrelated'),'preservar');
});

test('backup legado não transporta saúde para a restauração',async()=>{
 const service=backupService(),text=JSON.stringify({type:'full',backupVersion:3,data:{symbolsData:[],guardians:[],medicalData:{allergies:['teste']}}});
 const result=await service.readAndValidate({size:text.length,text:async()=>text});assert.equal(result.data.medicalData,undefined);
});
test('exportação completa exclui saúde mesmo se o chamador a fornecer',async()=>{
 const e=env();Object.assign(e.ctx,{JornadaModuleData:e.api,TextEncoder,crypto:require('node:crypto').webcrypto,Blob,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},setTimeout(){},document:{createElement:()=>({click(){}})},BackupCrypto:{encrypt:async p=>({encrypted:true})}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/backup.js'),'utf8'),e.ctx);
 const payload=await e.ctx.window.BackupService.export({symbolsData:[],guardians:[],medicalData:{gesture:'privado'}},{password:'test-only-password'});
 assert.equal(payload.data.medicalData,undefined);assert.equal(payload.data.symbolsData.length,0);
});

test('backup de saúde criptografa apenas o perfil de saúde e recusa arquivos de outro tipo', async () => {
 const e = env();
 const downloads = [];
 const password = 'senha-ficticia-teste';
 let blob;
 Object.assign(e.ctx, {
  JornadaModuleData: e.api,
  TextEncoder, TextDecoder, Blob, btoa, atob, crypto: require('node:crypto').webcrypto,
  URL: {createObjectURL(value) { blob = value; return 'blob:teste'; }, revokeObjectURL() {}},
  setTimeout() {},
  document: {createElement: () => ({click() { downloads.push({blob, name: this.download}); }})},
  prompt: () => password
 });
 for (const name of ['backup-crypto', 'backup']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', name + '.js'), 'utf8'), e.ctx);
  e.ctx.BackupCrypto = e.ctx.window.BackupCrypto;
 }
 const service = e.ctx.window.BackupService;
 const health = {
  allergies: ['Alergia fictícia'], gesture: 'Gesto fictício', observations: 'Observação anterior',
  sensoryPreferences: {sound: true, helps: ['Silêncio']}, updatedAt: '2026-11-18T16:00:00Z'
 };
 const data = {...health, guardians: ['Contato fora do backup'], history: ['Mensagem fora do backup']};
 await service.exportHealth(data, password, () => false);
 assert.equal(downloads.length, 0);
 assert.equal(await service.exportHealth(data, password, () => true), true);
 assert.match(downloads[0].name, /^jornada-bia-backup-saude-.*\.json$/);
 const file = downloads[0].blob;
 const text = await file.text();
 assert.equal(JSON.parse(text).encrypted, true);
 assert.doesNotMatch(text, /Gesto fictício|Alergia fictícia|Contato fora do backup/);
 assert.deepEqual(JSON.parse(JSON.stringify(await service.readHealth(file, password))), health);
 await assert.rejects(service.readHealth(file, 'outra-senha'));
 await assert.rejects(service.readHealth(new Blob([JSON.stringify({type: 'health', data: health})]), password));
 await assert.rejects(service.readAndValidate(file), /Tipo de backup inválido/);
 await service.export({symbolsData: [], guardians: [], medicalData: health}, {password});
 await assert.rejects(service.readHealth(downloads[1].blob, password), /Formato de backup de saúde inválido/);
 assert.equal(e.storage.length, 0);
});

test('exclusão dos dados de saúde preserva preferências e relatos de outros módulos', () => {
 const e = env({medicalData: '{}', theme: 'dark', 'jb_word_goals_v2': '{}', 'jornadaBia:myCommunicationData': '{}'});
 assert.equal(e.ctx.window.StorageService.removeItem('medicalData'), true);
 assert.deepEqual([...e.values.keys()], ['theme', 'jb_word_goals_v2', 'jornadaBia:myCommunicationData']);
});
