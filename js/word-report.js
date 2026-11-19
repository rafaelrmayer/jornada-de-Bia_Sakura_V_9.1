/* Relatório visual local, com contagens e legendas independentes das cores. */
(function(root){
 'use strict';
 const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
 function build(range,data,state){
  const lib=root.JBWordPractice,report=el('article',undefined,'wg-report');
  report.setAttribute('aria-label','Relatório visual de comunicação');
  const date=ts=>new Date(ts).toLocaleDateString('pt-BR');
  const header=el('header',undefined,'wr-header');
  header.append(el('p','JARDIM DA BIA','wr-eyebrow'),el('h1','Resumo da semana'));
  const identification=el('div',undefined,'wr-identification');
  for(const [label,cls] of [['Nome:','wr-identification-name'],['Idade:','wr-identification-age']]){
   const row=el('p',label,cls),line=el('span',undefined,'wr-write-line');
   line.setAttribute('aria-hidden','true');row.append(line);identification.append(row);
  }
  const supportLevel=el('p',undefined,'wr-support-level');
  supportLevel.hidden=true;identification.append(supportLevel);
  header.append(identification,el('p',date(range.start)+' a '+date(range.end-1),'wr-period'));
  report.append(header);
  const knownFunctions=Object.keys(lib.PURPOSE).filter(k=>k!=='unspecified'&&data.purposes[k]>0);
  const weekLogs=state.goals.flatMap(g=>g.logs).filter(l=>l.ts>=range.start&&l.ts<range.end&&l.ts<=Date.now());
  const days=new Set(weekLogs.map(l=>lib.day(l.ts))).size;
  const metrics=el('section',undefined,'wr-metrics');metrics.setAttribute('aria-label','Resumo em números');
  for(const [count,label] of [[data.total,'observações no total'],[data.support.independent,'sem incentivo observado'],[data.support.supported,'com apoio']]){
   const tile=el('div',undefined,'wr-metric');tile.append(el('strong',String(count)),el('span',label));metrics.append(tile);
  }report.append(metrics);
  const extra=el('div',undefined,'wr-meta');
  extra.append(el('span','Após incentivo: '+data.support.prompted),el('span','Apoio não informado: '+data.support.unspecified),el('span',knownFunctions.length+' funções informadas · '+days+(days===1?' dia com registros':' dias com registros')));
  report.append(extra);
  if(!data.total)report.append(el('p','Sem observações revisadas nesta semana. Ausência de registro não significa ausência de comunicação.','wr-intro'));
  const words=el('section',undefined,'wr-words');words.append(el('h2','Por palavra'));
  const legend=el('div',undefined,'wr-legend');
  Object.entries(lib.SUPPORT).forEach(([key,label])=>{const item=el('span',undefined,'wr-legend-item'),mark=el('i',undefined,'wr-color-'+key);mark.setAttribute('aria-hidden','true');item.append(mark,document.createTextNode(label));legend.append(item);});words.append(legend);
  if(!data.words.length)words.append(el('p','Nenhuma expressão em acompanhamento ou com registros nesta semana.'));
  for(const w of data.words){
   const card=el('section',undefined,'wr-word'),heading=el('div',undefined,'wr-word-heading');heading.append(el('h3',w.word),el('span',w.total+' registros'));card.append(heading);
   const stack=el('div',undefined,'wr-stack');stack.setAttribute('aria-hidden','true');
   for(const key of Object.keys(lib.SUPPORT)){const part=el('span',undefined,'wr-color-'+key);part.style.width=(w.total?w.support[key]/w.total*100:0)+'%';stack.append(part);}card.append(stack);
   const counts=el('div',undefined,'wr-word-counts');for(const [key,label] of Object.entries(lib.SUPPORT))counts.append(el('span',label+': '+w.support[key]));card.append(counts);
   card.append(el('p',w.days+(w.days===1?' dia com registros':' dias com registros')+(!w.active?' · acompanhamento pausado':''),'wr-caption'));words.append(card);
  }report.append(words);
  const contexts=el('section',undefined,'wr-section');contexts.append(el('h2','Onde foi observado'));
  const tags=el('div',undefined,'wr-contexts');
  for(const [key,label] of Object.entries(lib.CONTEXT)){if(data.contexts[key]||!data.total)tags.append(el('span',label+' · '+data.contexts[key],'wr-context-tag'));}
  contexts.append(tags);report.append(contexts);
  const purposes=el('section',undefined,'wr-section wr-purposes');purposes.append(el('h2','Para que comunicou'));
  const max=Math.max(1,...Object.values(data.purposes));
  for(const [key,label] of Object.entries(lib.PURPOSE)){
   const count=data.purposes[key]||0,row=el('div',undefined,'wr-chart-row');row.append(el('span',label));
   const track=el('div',undefined,'wr-track'),fill=el('span',undefined,'wr-fill');track.setAttribute('aria-hidden','true');fill.style.width=(count/max*100)+'%';track.append(fill);row.append(track,el('strong',String(count)));purposes.append(row);
  }report.append(purposes);
  const notes=el('section',undefined,'wr-section wr-notes');notes.append(el('h2','Observações para a fono'),el('p',state.notes[range.key]?.trim()||'Nenhuma observação adicional informada.'));report.append(notes);
  const footer=el('footer',undefined,'wr-footer');footer.append(el('p','Observações revisadas pelo adulto; acionamentos pendentes não entram nas contagens. Ausência de registro não significa ausência de comunicação.'),el('p','Todos os tipos de apoio têm valor. Este resumo não atribui nota nem conclui evolução terapêutica.'),el('p','Gerado neste aparelho pela Jornada de Bia. Compartilhe com as pessoas escolhidas por você.'));report.append(footer);
  return report;
 }
 root.JBWordReport={build};
})(window);
