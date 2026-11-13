/* O teste usa exclusivamente o clique em falar de uma frase personalizada. */
(function(root){
  'use strict';
  const el=id=>document.getElementById(id);
  if(!el('rfTestStart'))return;
  const engine=new root.JornadaRFEvaluation();
  const KEY='rfEvaluationData';
  let trials=[];
  try{
    const saved=JSON.parse(StorageService.getItem(KEY)||'[]');
    if(Array.isArray(saved))trials=saved.filter(t=>t?.kind==='manual-test'&&typeof t.choice==='string').slice(-200);
  }catch{}
  const status=text=>el('rfTestStatus').textContent=text;
  function unlocked(){return !!root.SecurityService?.isUnlocked?.();}
  function render(){
    el('rfTestPendingNotice').hidden=!engine.pending;
    el('biaAssistantSummary').hidden=!!engine.pending;
    const m=root.JornadaRFEvaluation.metrics(trials);
    const result=m.paired?`${m.rfCorrect}/${m.paired} (${Math.round(100*m.rfCorrect/m.paired)}%)`:'Sem comparação disponível';
    const baseline=m.paired?`${m.baselineCorrect}/${m.paired} (${Math.round(100*m.baselineCorrect/m.paired)}%)`:'Sem comparação disponível';
    el('rfTestMetrics').textContent=`Testes concluídos: ${m.total} · Comparações com ambos disponíveis: ${m.paired} · Random Forest: ${result} · Frase mais frequente: ${baseline} · Sem comparação: ${m.unavailable}.`;
    el('rfTestStart').disabled=!!engine.pending;
    el('rfTestCancel').disabled=!engine.pending;
    el('rfTestEnvironment').disabled=!!engine.pending;el('rfTestTime').disabled=!!engine.pending;
    el('rfTestExport').disabled=!trials.length;el('rfTestClear').disabled=!trials.length;
  }
  el('rfTestStart').addEventListener('click',()=>{
    if(!unlocked()){status('Desbloqueie a administração em Apoio para iniciar um teste.');return;}
    try{
      const context={environment:el('rfTestEnvironment').value,time:el('rfTestTime').value};
      const info=engine.begin(contextBrain.stats,context);
      el('rfTestLast').textContent='As previsões ficam ocultas até a escolha, para não influenciar o teste.';
      status(`Teste iniciado: ambiente ${el('rfTestEnvironment').selectedOptions[0].textContent}, período ${el('rfTestTime').selectedOptions[0].textContent}. ${info.rfAvailable?'Previsões guardadas.':'RF sem dados suficientes para comparação.'} Abra Minha Comunicação e toque no botão de falar de uma frase. Esse clique não será usado no aprendizado normal.`);
      render();
    }catch{status('Não foi possível iniciar o teste. O uso normal das frases continua disponível.');}
  });
  el('rfTestOpen').addEventListener('click',()=>root.showPage('my-communication'));
  el('rfTestCancel').addEventListener('click',()=>{engine.cancel();status('Teste cancelado. As próximas escolhas voltam ao uso normal.');render();});
  el('rfTestCancelFromCommunication').addEventListener('click',()=>{engine.cancel();status('Teste cancelado. As próximas escolhas voltam ao uso normal.');render();});
  el('rfTestClear').addEventListener('click',()=>{
    if(!unlocked()){status('Desbloqueie a administração para apagar os resultados de teste.');return;}
    if(!confirm('Apagar somente os resultados desta avaliação manual? O aprendizado e as frases serão preservados.'))return;
    if(StorageService.setItem(KEY,'[]')===false){status('Não foi possível apagar os resultados.');return;}
    trials=[];engine.cancel();el('rfTestLast').textContent='';status('Resultados de teste apagados. Aprendizado e frases preservados.');render();
  });
  el('rfTestExport').addEventListener('click',()=>{
    if(!unlocked()){status('Desbloqueie a administração para exportar os resultados.');return;}
    const blob=new Blob([JSON.stringify({version:1,kind:'manual-test',trials,metrics:root.JornadaRFEvaluation.metrics(trials)},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='avaliacao-random-forest-testes.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  root.JornadaRFEvaluationUI={consume(phrase){
    if(!engine.pending)return false;
    if(!unlocked()){engine.cancel();status('Teste cancelado porque a administração foi bloqueada. Essa escolha não foi usada no aprendizado.');render();return true;}
    const trial=engine.complete(phrase);if(!trial)return false;
    trials=[...trials,trial].slice(-200);
    const saved=StorageService.setItem(KEY,JSON.stringify(trials));
    el('rfTestLast').textContent=`Último teste — escolha: ${trial.choice} · RF: ${trial.rfPrediction||'indisponível'} · Regra simples: ${trial.baselinePrediction||'indisponível'}.`;
    status(saved===false?'Teste comparado nesta sessão, mas não foi possível salvar o resultado. A escolha não entrou no aprendizado.':'Teste concluído e salvo neste aparelho. A escolha não entrou no aprendizado. As próximas escolhas voltam ao uso normal.');
    render();return true;
  }};
  render();
})(window);
