/* Atalhos pessoais baseados apenas no uso registrado neste aparelho. */
(function(root){
 'use strict';
 function mostUsed(phrases,usage,limit=6){
  if(!Array.isArray(phrases)||!usage||typeof usage!=='object'||Array.isArray(usage))return [];
  const seen=new Set(),ranked=[];
  phrases.forEach((phrase,index)=>{
   if(!phrase||typeof phrase.id!=='string'||typeof phrase.text!=='string'||phrase.deletedAt)return;
   const text=phrase.text.trim(),count=usage[text];
   if(!text||seen.has(text)||!Number.isSafeInteger(count)||count<=0)return;
   seen.add(text);ranked.push({phrase,index,count});
  });
  return ranked.sort((a,b)=>b.count-a.count||a.index-b.index).slice(0,Number.isInteger(limit)?Math.max(0,Math.min(limit,6)):6).map(row=>row.phrase);
 }
 const api={mostUsed};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.JBCommunicationUsage=api;
})(typeof window==='undefined'?globalThis:window);
