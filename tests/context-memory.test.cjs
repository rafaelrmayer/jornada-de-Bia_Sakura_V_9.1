const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
function load(){const ctx=vm.createContext({window:{}});for(const file of ['context-records','random-forest','neural-assistant'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/'+file+'.js'),'utf8'),ctx);return ctx.window;}
test('preserva alternativas no mesmo contexto e conta somente a frase escolhida',()=>{
 const {JornadaContextRecords:m}=load();const records={};
 for(const phrase of ['Quero comer.','Quero descansar.','Quero comer.'])m.record(records,'casa|tarde|quero','1,2',phrase,123);
 assert.equal(Object.keys(records).length,2);
 const byPhrase=Object.fromEntries(Object.values(records).map(r=>[r.text,r.count]));
 assert.deepEqual(byPhrase,{'Quero comer.':2,'Quero descansar.':1});
 const restored=JSON.parse(JSON.stringify(records));assert.equal(m.summary(restored).verifiedChoices,3);
});
test('dados antigos são preservados, mas o contador ambíguo vale só uma observação no treino',()=>{
 const {JornadaContextRecords:m}=load();const records={'casa|tarde|quero|1':{text:'Quero comer.',count:70,seq:'1'}};
 const original=JSON.stringify(records);const prepared=m.trainingRecords(records);
 assert.equal(Object.values(prepared)[0].count,1);assert.equal(JSON.stringify(records),original);
 m.record(records,'casa|tarde|quero','1','Quero descansar.',123);
 assert.equal(records['casa|tarde|quero|1'].count,70);assert.equal(m.summary(records).legacyRows,1);assert.equal(m.summary(records).verifiedChoices,1);
});
test('frase da chave não vaza para entradas do RF ou da rede neural',()=>{
 const {JornadaContextRecords:m,JornadaRandomForest:RF,JornadaNeuralAssistant:NN}=load();const records={};
 for(const phrase of ['comer|agora','descansar, depois'])m.record(records,'escola|manhã|quero','4,5',phrase,123);
 const [a,b]=Object.entries(m.trainingRecords(records));
 assert.deepEqual(new RF().features(...a),new RF().features(...b));
 assert.deepEqual(new NN().features(...a),new NN().features(...b));
});
test('assinatura detecta alteração de frase mesmo quando chaves e total de contagens são iguais',()=>{
 const {JornadaContextRecords:m}=load();const records={'casa|tarde|quero|1':{text:'A',count:4}};const before=m.signature(records);records['casa|tarde|quero|1'].text='B';assert.notEqual(m.signature(records),before);
});
test('RF funciona com valores que coincidem com propriedades de objetos',()=>{
 const {JornadaRandomForest:RF}=load();const records={};
 for(let i=0;i<20;i++)records['k'+i]={contextKey:(i%2?'constructor':'__proto__')+'|tarde|quero|'+i,text:i%2?'constructor':'__proto__',count:1};
 const model=new RF({trees:21,seed:731});assert.equal(model.train(records).ready,true);assert.ok(model.predict('__proto__|tarde|quero|none').text);
 const first=JSON.stringify(model.predict('constructor|tarde|quero|none'));model.train(records);assert.equal(JSON.stringify(model.predict('constructor|tarde|quero|none')),first);
});
test('RF permanece indisponível sem dados suficientes ou com uma única frase',()=>{
 const {JornadaRandomForest:RF}=load();const model=new RF();assert.equal(model.train({}).ready,false);assert.equal(model.predict('casa|tarde|quero|none'),null);
 const rows=Object.fromEntries(Array.from({length:12},(_,i)=>['casa|tarde|quero|'+i,{text:'Uma frase',count:1}]));assert.equal(model.train(rows).ready,false);
});
test('ContextBrain aprende alternativas, reutiliza modelos e mantém a frase do motor contextual',()=>{
 const services=load();const nodes={biaAiStats:{},biaAssistantSummary:{}};const storage={};
 const ctx=vm.createContext({window:services,StorageService:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},selectedSymbols:[],selectedIntent:'quero',contextAnalyzer:{analyzeContext:()=>({context:'casa'})},predictiveEngine:{suggestContextual:()=>[{text:'Frase do motor contextual.',score:3}]},getContextualPhrases:()=>['Frase padrão.'],document:{getElementById:id=>nodes[id]||null}});
 const source=fs.readFileSync(path.join(__dirname,'../js/app.js'),'utf8');
 vm.runInContext(source.slice(source.indexOf('        class ContextBrain'),source.indexOf('        const predictor ='))+'\nglobalThis.brain = new ContextBrain();',ctx);
 for(let i=0;i<8;i++){
  ctx.selectedSymbols=[{id:i}];ctx.brain.learn(i%2?'Quero descansar.':'Quero comer.');
 }
 ctx.selectedSymbols=[{id:0}];ctx.brain.learn('Quero descansar.');ctx.brain.learn('Quero comer.');
 assert.equal(Object.keys(JSON.parse(storage.contextBrainData)).length,9);
 assert.equal(ctx.brain.infer().prediction,'Frase do motor contextual.');
 assert.ok(ctx.brain.randomForestModel);assert.ok(ctx.brain.neuralModel);
 const model=ctx.brain.randomForestModel;ctx.brain.infer();assert.equal(ctx.brain.randomForestModel,model);
 assert.ok(nodes.biaAiStats.textContent.includes('10'));
});
test('comparação sintética usa contextos separados de treino/teste e regra de referência',()=>{
 const {report}=require('../scripts/evaluate-random-forest.cjs');assert.equal(report.synthetic,true);assert.equal(report.trainingContexts,32);assert.equal(report.testContexts,16);assert.equal(report.mostFrequentBaselineAccuracy,.5);assert.ok(report.randomForestAccuracy>=report.mostFrequentBaselineAccuracy);
});
