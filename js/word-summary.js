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
 function review(text){
  if(!goals.allowed())return;
  if(dialog)dialog.remove();dialog=el('dialog',undefined,'wg-review');
  dialog.append(el('h2','Revise antes de compartilhar'),el('p','O texto pode conter informações pessoais. Escolha com quem compartilhar.'));
  const preview=el('textarea');preview.readOnly=true;preview.value=text;preview.rows=18;preview.setAttribute('aria-label','Prévia do resumo');dialog.append(preview);
  dialog.append(button('Salvar PDF / Imprimir',()=>{if(!goals.allowed())return;dialog.close();const paper=el('pre',text);paper.id='wgPrintReport';document.body.append(paper);document.body.classList.add('wg-printing');const clean=()=>{paper.remove();document.body.classList.remove('wg-printing');window.removeEventListener('afterprint',clean);};window.addEventListener('afterprint',clean);try{window.print();}catch{clean();}}),
   button('Abrir WhatsApp',()=>{if(goals.allowed())window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank','noopener,noreferrer');}),
   button('Voltar',()=>dialog.close()));document.body.append(dialog);dialog.showModal();
 }
 function render(){
  host.replaceChildren();if(!goals.allowed()){host.hidden=true;toggle.setAttribute('aria-expanded','false');dialog?.close();dialog?.remove();document.getElementById('wgPrintReport')?.remove();document.body.classList.remove('wg-printing');return;}
  const range=lib.week(chosen),state=goals.getState(),data=lib.aggregate(state,range);
  host.append(el('h3','Resumo semanal de comunicação'));
  const label=el('label','Escolha uma data da semana','ws-noprint'),date=el('input');date.type='date';date.value=chosen;date.onchange=()=>{try{lib.week(date.value);chosen=date.value;render();}catch{date.value=chosen;}};label.append(date);host.append(label);
  host.append(el('p',new Date(range.start).toLocaleDateString('pt-BR')+' a '+new Date(range.end-1).toLocaleDateString('pt-BR')));
  host.append(el('p',data.total+' observações registradas manualmente. Ausência de registro não significa ausência de comunicação.','wg-hint'));
  const nums=el('div',undefined,'ws-nums');for(const [k,l] of Object.entries(lib.SUPPORT)){const box=el('div',undefined,'ws-num');box.append(el('strong',String(data.support[k])),el('span',l));nums.append(box);}host.append(nums);
  host.append(el('h4','Por expressão'));for(const w of data.words){const row=el('div',undefined,'ws-row');row.append(el('strong',w.word+(!w.active?' (pausada)':'')),el('p',w.total+' observações · '+w.days+' dias com registros'),el('p',Object.entries(lib.SUPPORT).map(([k,l])=>l+': '+w.support[k]).join(' · ')));host.append(row);}
  for(const [title,labels,counts] of [['Onde foi observado',lib.CONTEXT,data.contexts],['Funções comunicativas informadas',lib.PURPOSE,data.purposes]]){host.append(el('h4',title));const tags=el('div',undefined,'wg-tags');for(const [k,l] of Object.entries(labels))tags.append(el('span',l+' · '+counts[k],'wg-tag'));host.append(tags);}
  const note=el('label','Observações para a fono'),ta=el('textarea');ta.maxLength=1000;ta.rows=4;ta.value=state.notes[range.key]||'';note.append(ta);host.append(note,button('Salvar observações da semana',()=>{if(goals.saveNotes(range.key,ta.value))document.getElementById('wgStatus').textContent='Observações da semana salvas neste aparelho.';}));
  host.append(el('p','Salve as observações antes de gerar o resumo. Os dados permanecem neste navegador até você escolher compartilhar.','wg-hint'),
   button('Revisar resumo para PDF ou WhatsApp',()=>review(report(range,lib.aggregate(goals.getState(),range),goals.getState()))));
 }
 toggle.onclick=()=>{if(!goals.allowed())return;host.hidden=!host.hidden;toggle.setAttribute('aria-expanded',String(!host.hidden));if(!host.hidden)render();};
 goals.onChange(()=>{if(!host.hidden)render();});document.addEventListener('jornadaBia:sessionExpired',render);
})();
