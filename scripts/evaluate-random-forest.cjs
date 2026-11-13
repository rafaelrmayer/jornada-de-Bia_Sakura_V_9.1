/* Avaliação sintética controlada. Não usa dados locais de usuários. */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const context=vm.createContext({window:{}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/random-forest.js'),'utf8'),context);
const RF=context.window.JornadaRandomForest;
const train={},test=[];
for(const [environment,phrase] of [['casa','Quero ouvir uma história.'],['escola','Quero desenhar.']]){
 for(let i=0;i<24;i++){
  const key=environment+'|tarde|quero|symbol-'+i;
  const row={contextKey:key,text:phrase,count:1,seq:'symbol-'+i};
  if(i<16)train[key]=row;else test.push({key,text:phrase});
 }
}
const model=new RF({trees:41,seed:731});const metrics=model.train(train);
const counts={};Object.values(train).forEach(r=>counts[r.text]=(counts[r.text]||0)+1);
const baseline=Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0];
const rfAccuracy=test.filter(r=>model.predict(r.key)?.text===r.text).length/test.length;
const baselineAccuracy=test.filter(r=>baseline===r.text).length/test.length;
const report={synthetic:true,trainingContexts:Object.keys(train).length,testContexts:test.length,randomForestAccuracy:rfAccuracy,mostFrequentBaselineAccuracy:baselineAccuracy,oobAccuracy:metrics.oobAccuracy,warning:'Exercício artificial: não mede utilidade real, preferências ou desempenho com dados da Bia.'};
if(require.main===module)console.log(JSON.stringify(report,null,2));
module.exports={report};
