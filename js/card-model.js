/* Inferência 9 → 16 → ReLU → 5, sem bibliotecas nem chamadas de rede. */
(function(root){
  'use strict';
  function scores(model, period, last) {
    if (!Number.isInteger(period) || period < 0 || period > 2 ||
        !(last === null || (Number.isInteger(last) && last >= 0 && last < 5))) throw new Error('Contexto inválido.');
    if (model?.synthetic_data !== true || JSON.stringify(model.architecture) !== '[9,16,5]') throw new Error('Modelo incompatível.');
    const w = model.weights;
    const lastIndex = 3 + (last === null ? 5 : last);
    const hidden = w['0.bias'].map((bias,i) => Math.max(0,bias+w['0.weight'][i][period]+w['0.weight'][i][lastIndex]));
    const output = w['2.bias'].map((bias,i) => hidden.reduce((sum,value,j)=>sum+value*w['2.weight'][i][j],bias));
    if (output.length !== 5 || !output.every(Number.isFinite)) throw new Error('Pontuação inválida.');
    return output;
  }
  function order(model, period, last) {
    const values = scores(model,period,last);
    return [0,1,2,3,4].sort((a,b)=>values[b]-values[a] || a-b);
  }
  const api = {scores,order};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  else root.BiaCardInference=api;
})(typeof window==='undefined'?globalThis:window);
