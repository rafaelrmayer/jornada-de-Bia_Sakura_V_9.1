/* Resumo de observações manuais: revisão explícita antes de compartilhar. */
(function(){
 'use strict';
 const lib=window.JBWordPractice,goals=window.JBWordGoals,host=document.getElementById('wgSummary'),toggle=document.getElementById('wgSummaryToggle');
 if(!host||!goals)return;
 let chosen=lib.day(Date.now()),dialog;
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 function button(text,fn){const b=el('button',text,'wg-btn');b.type='button';b.onclick=fn;return b;}
 function report(range,data,state){
  const lines=['Resumo de comunicação — '+new Date(range.start).toLocaleDateString('pt-BR')+' a '+new Date(range.end-1).toLocaleDateString('pt-BR'),
   'Observações registradas manualmente: '+data.total,
   'Ausência de registro não significa ausência de comunicação. Este resumo não avalia evolução terapêutica.'];
  for(const [key,label] of Object.entries(lib.SUPPORT))lines.push(label+': '+data.support[key]);
  data.words.forEach(w=>lines.push(w.word+': '+w.total+' observações em '+w.days+' dias'+(!w.active?' (acompanhamento pausado)':'')+'; '+Object.entries(lib.SUPPORT).map(([k,l])=>l+': '+w.support[k]).join(', ')));
  for(const [title,labels,counts] of [['Contextos',lib.CONTEXT,data.contexts],['Funções comunicativas',lib.PURPOSE,data.purposes]])lines.push(title+': '+Object.entries(labels).map(([k,l])=>l+': '+counts[k]).join(', '));
  lines.push('Observações do adulto: '+(state.notes[range.key]||'Não informadas.'));
  return lines.join('\n');
 }
 function review(text,range,data,state){
  if(!goals.allowed())return;
  if(dialog)dialog.remove();dialog=el('dialog',undefined,'wg-review');
  dialog.append(el('h2','Revise antes de compartilhar'),el('p','O texto pode conter informações pessoais. Escolha com quem compartilhar.'));
  const visual=window.JBWordReport.build(range,data,state);dialog.append(visual);
  const selection=el('fieldset'),legend=el('legend','Adicionar informações de saúde (opcional)');selection.append(legend,el('p','Selecione apenas o necessário. A cópia exportada ficará fora do controle do aplicativo.'));
  const healthPreview=el('section',undefined,'wr-section');healthPreview.hidden=true;
  const baseText=text,checks=[];
  const updateHealth=()=>{
   healthPreview.replaceChildren();const fields=window.JBHealthCare?.getFields()||[],chosen=fields.filter(f=>checks.some(c=>c.key===f.key&&c.input.checked));
   healthPreview.hidden=!chosen.length;
   if(chosen.length){healthPreview.append(el('h2','Saúde e cuidados — relato do responsável'));for(const f of chosen)healthPreview.append(el('h3',f.label),el('p',f.value));}
   text=baseText+(chosen.length?'\n\nSaúde e cuidados — relato do responsável\n'+chosen.map(f=>f.label+': '+f.value).join('\n'):'');preview.value=text;
  };
  for(const field of window.JBHealthCare?.getFields()||[]){const label=el('label'),input=el('input');input.type='checkbox';input.onchange=updateHealth;checks.push({key:field.key,input});label.append(input,document.createTextNode(' '+field.label));selection.append(label);}
  if(checks.length)dialog.append(selection);visual.append(healthPreview);
  const textDetails=el('details');textDetails.append(el('summary','Ver texto para WhatsApp'));
  const preview=el('textarea');preview.readOnly=true;preview.value=text;preview.rows=18;preview.setAttribute('aria-label','Prévia do resumo');textDetails.append(preview);dialog.append(textDetails);
  dialog.append(button('Salvar PDF / Imprimir',()=>{if(!goals.allowed())return;dialog.close();const paper=visual.cloneNode(true);paper.id='wgPrintReport';document.body.append(paper);document.body.classList.add('wg-printing');const clean=()=>{paper.remove();document.body.classList.remove('wg-printing');window.removeEventListener('afterprint',clean);};window.addEventListener('afterprint',clean);try{window.print();}catch{clean();}}),
   button('Abrir WhatsApp',()=>{if(goals.allowed())window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank','noopener,noreferrer');}),
   button('Voltar',()=>dialog.close()));document.body.append(dialog);dialog.showModal();
 }
 function render(){
  host.replaceChildren();if(!goals.allowed()){host.hidden=true;toggle.setAttribute('aria-expanded','false');dialog?.close();dialog?.remove();document.getElementById('wgPrintReport')?.remove();document.body.classList.remove('wg-printing');return;}
  const range=lib.week(chosen),state=goals.getState(),data=lib.aggregate(state,range);
  host.append(el('h3','Resumo semanal de comunicação'));
  const label=el('label','Escolha uma data da semana','ws-noprint'),date=el('input');date.type='date';date.value=chosen;date.onchange=()=>{try{lib.week(date.value);chosen=date.value;render();}catch{date.value=chosen;}};label.append(date);host.append(label);
  const visual=window.JBWordReport.build(range,data,state);visual.classList.add('wr-inline-preview');host.append(visual);
  const note=el('label','Observações para a fono'),ta=el('textarea');ta.maxLength=1000;ta.rows=4;ta.value=state.notes[range.key]||'';note.append(ta);host.append(note,button('Salvar observações da semana',()=>{if(goals.saveNotes(range.key,ta.value))document.getElementById('wgStatus').textContent='Observações da semana salvas neste aparelho.';}));
  host.append(el('p','Salve as observações antes de gerar o resumo. Os dados permanecem neste navegador até você escolher compartilhar.','wg-hint'),
   button('Revisar resumo para PDF ou WhatsApp',()=>{const snapshot=goals.getState(),counts=lib.aggregate(snapshot,range);review(report(range,counts,snapshot),range,counts,snapshot);}));
 }
 toggle.onclick=()=>{if(!goals.allowed())return;host.hidden=!host.hidden;toggle.setAttribute('aria-expanded',String(!host.hidden));if(!host.hidden)render();};
 document.addEventListener('bia:admin-access-changed',()=>{if(!goals.allowed())render();});
 goals.onChange(()=>{if(!host.hidden)render();});document.addEventListener('jornadaBia:sessionExpired',render);
})();
