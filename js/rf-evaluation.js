/* Avaliação manual local: previsão congelada antes da escolha, sem treino com o teste. */
(function(global){
  'use strict';
  class JornadaRFEvaluation {
    constructor(){this.pending=null;}
    begin(records, context){
      if(this.pending)throw new Error('Finalize ou cancele o teste atual.');
      const prepared=global.JornadaContextRecords.trainingRecords(records);
      const rows=Object.values(prepared);
      const counts=new Map();rows.forEach(row=>counts.set(row.text,(counts.get(row.text)||0)+row.count));
      const baseline=[...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]?.[0]||null;
      const key=[context.environment,context.time,'frase-personalizada','none'].join('|');
      let prediction=null;
      if(rows.length>=8&&counts.size>=2){
        const model=new global.JornadaRandomForest({trees:21,seed:731});
        if(model.train(prepared).ready)prediction=model.predict(key)?.text||null;
      }
      this.pending={configuration:{trees:21,seed:731,task:'personal-phrase'},context:{environment:context.environment,time:context.time,intent:'frase-personalizada',sequence:'none'},rfPrediction:prediction,baselinePrediction:baseline,trainingRows:rows.length};
      return {trainingRows:rows.length,rfAvailable:prediction!==null};
    }
    complete(text){
      if(!this.pending||typeof text!=='string'||!text.trim())return null;
      const result={...this.pending,choice:text.trim(),kind:'manual-test'};
      this.pending=null;return result;
    }
    cancel(){this.pending=null;}
    static metrics(trials){
      const paired=trials.filter(t=>typeof t.rfPrediction==='string'&&typeof t.baselinePrediction==='string');
      return {total:trials.length,paired:paired.length,rfCorrect:paired.filter(t=>t.rfPrediction===t.choice).length,baselineCorrect:paired.filter(t=>t.baselinePrediction===t.choice).length,unavailable:trials.length-paired.length};
    }
  }
  global.JornadaRFEvaluation=JornadaRFEvaluation;
})(window);
