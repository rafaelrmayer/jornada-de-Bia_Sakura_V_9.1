const {test}=require('node:test');
const assert=require('node:assert/strict');
const model=require('../js/card-model-data.js');
const {scores,order}=require('../js/card-model.js');
const references=require('./fixtures/card-model-reference.json');
test('JS reproduz pontuações e ordenação PyTorch nos 18 contextos válidos',()=>{
  assert.equal(references.length,18);
  for(const row of references){
    const output=scores(model,row.period,row.last);
    output.forEach((value,i)=>assert.ok(Math.abs(value-row.scores[i])<1e-5));
    assert.deepEqual(order(model,row.period,row.last),row.order);
  }
});
test('rejeita contextos fora do contrato',()=>{
  for(const [period,last] of [[3,null],[0,5],[-1,0],[0,-1],[0,'1']])assert.throws(()=>order(model,period,last));
});
