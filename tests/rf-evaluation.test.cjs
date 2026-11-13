const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
function setup(){const ctx=vm.createContext({window:{}});for(const file of ['context-records','random-forest','rf-evaluation'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/'+file+'.js'),'utf8'),ctx);return ctx.window;}
function records(lib){const rows={};for(let i=0;i<16;i++)lib.JornadaContextRecords.record(rows,i%2?'casa|tarde|frase-personalizada':'escola|manhã|frase-personalizada','s'+i,i%2?'Quero ler.':'Quero desenhar.',123);return rows;}
test('previsões são congeladas antes do resultado e nenhum dado de treino é alterado',()=>{
 const lib=setup();const rows=records(lib);const before=JSON.stringify(rows);const model=new lib.JornadaRFEvaluation();model.begin(rows,{environment:'casa',time:'tarde'});const rf=model.pending.rfPrediction;const base=model.pending.baselinePrediction;assert.equal(JSON.stringify(rows),before);
 Object.values(rows).forEach(r=>r.text='Resposta posterior.');const result=model.complete('Quero dormir.');assert.equal(result.rfPrediction,rf);assert.equal(result.baselinePrediction,base);assert.equal(result.choice,'Quero dormir.');assert.equal(model.complete('segunda escolha'),null);
});
test('testes sem modelo suficiente são contados à parte e não entram nos percentuais pareados',()=>{
 const lib=setup();const engine=new lib.JornadaRFEvaluation();engine.begin({}, {environment:'auto',time:'noite'});const unavailable=engine.complete('Quero dormir.');assert.equal(unavailable.rfPrediction,null);
 const paired={rfPrediction:'A',baselinePrediction:'B',choice:'A'};const m=lib.JornadaRFEvaluation.metrics([unavailable,paired]);assert.equal(m.total,2);assert.equal(m.paired,1);assert.equal(m.rfCorrect,1);assert.equal(m.baselineCorrect,0);assert.equal(m.unavailable,1);
});
test('não sobrescreve teste pendente e cancelar não produz resultado',()=>{
 const lib=setup();const engine=new lib.JornadaRFEvaluation();engine.begin({}, {environment:'casa',time:'tarde'});assert.throws(()=>engine.begin({},{}));engine.cancel();assert.equal(engine.complete('A'),null);
});
test('regra simples usa contagens anteriores ao teste e preserva o legado',()=>{
 const lib=setup();const rows={'casa|tarde|quero|1':{text:'Antiga',count:90}};for(let i=0;i<3;i++)lib.JornadaContextRecords.record(rows,'casa|tarde|frase-personalizada','none','Atual',123);
 const engine=new lib.JornadaRFEvaluation();engine.begin(rows,{environment:'casa',time:'tarde'});assert.equal(engine.pending.baselinePrediction,'Atual');assert.equal(rows['casa|tarde|quero|1'].count,90);
});
test('escolha de teste é falada sem entrar no aprendizado ou contador geral',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../js/app.js'),'utf8');const calls=[];const ctx=vm.createContext({window:{JornadaRFEvaluationUI:{consume:()=>true}},speakText:t=>calls.push(t),recordPhraseUse:()=>{throw Error('não deve registrar');},contextBrain:{learn:()=>{throw Error('não deve treinar');}}});vm.runInContext(source.slice(source.indexOf('        function communicatePersonalPhrase('),source.indexOf('        function speakNaturalMessage(')),ctx);ctx.communicatePersonalPhrase('Quero ler.');assert.deepEqual(calls,['Quero ler.']);
});
