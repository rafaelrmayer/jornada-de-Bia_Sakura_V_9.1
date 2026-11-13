const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../js/app.js'),'utf8');
function setup(fail=false){
 const calls=[];const ctx=vm.createContext({window:{},speakText:t=>calls.push(['speak',t]),recordPhraseUse:t=>calls.push(['usage',t]),contextBrain:{learn:(t,opts)=>{calls.push(['learn',t,opts.standalone]);if(fail)throw Error('storage');},render:()=>calls.push(['render'])}});
 vm.runInContext(source.slice(source.indexOf('        function communicatePersonalPhrase('),source.indexOf('        function speakNaturalMessage(')),ctx);return {calls,ctx};
}
test('escolher frase personalizada fala e registra uma vez em contexto independente',()=>{
 const {calls,ctx}=setup();ctx.communicatePersonalPhrase(' Quero ler. ');assert.deepEqual(calls,[['speak','Quero ler.'],['usage','Quero ler.'],['learn','Quero ler.',true],['render']]);
});
test('frase vazia não fala nem treina',()=>{const {calls,ctx}=setup();ctx.communicatePersonalPhrase(' ');assert.deepEqual(calls,[]);});
test('falha no aprendizado não impede a fala nem lança erro ao usuário',()=>{const {calls,ctx}=setup(true);assert.doesNotThrow(()=>ctx.communicatePersonalPhrase('Quero descansar.'));assert.equal(calls[0][0],'speak');});
