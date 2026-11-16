/* Relatório visual sem serviços externos; os valores vêm das observações revisadas. */
(function(root){
 'use strict';
 const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
 function build(range,data,state){
  const lib=root.JBWordPractice,report=el('article',undefined,'wg-report');
  report.setAttribute('aria-label','Relatório visual de comunicação');
  const date=ts=>new Date(ts).toLocaleDateString('pt-BR');
  const header=el('header',undefined,'wr-header');
  header.append(el('p','JARDIM DA BIA · ACOMPANHAMENTO DA COMUNICAÇÃO','wr-eyebrow'),el('h1','Cada forma de comunicar importa'),el('p',date(range.start)+' a '+date(range.end-1),'wr-period'));
  report.append(header);
  const knownFunctions=Object.keys(lib.PURPOSE).filter(k=>k!=='unspecified'&&data.purposes[k]>0);
  const weekLogs=state.goals.flatMap(g=>g.logs).filter(l=>l.ts>=range.start&&l.ts<range.end&&l.ts<=Date.now());
  const days=new Set(weekLogs.map(l=>lib.day(l.ts))).size;
  const metrics=el('section',undefined,'wr-metrics');metrics.setAttribute('aria-label','Resumo em números');
  for(const [count,label] of [[data.total,'observações revisadas'],[data.words.filter(w=>w.total).length,'expressões com registros'],[knownFunctions.length,'funções informadas'],[days,'dias com registros']]){const tile=el('div',undefined,'wr-metric');tile.append(el('strong',String(count)),el('span',label));metrics.append(tile);}report.append(metrics);
  const intro=el('p',data.total?'Registros informados pelo adulto nesta semana. Os acionamentos ainda não revisados não entram nestas contagens.':'Não há observações revisadas nesta semana. Ausência de registro não significa ausência de comunicação.','wr-intro');report.append(intro);
  function bars(title,labels,counts,extra){
   const section=el('section',undefined,'wr-section');section.append(el('h2',title));if(extra)section.append(el('p',extra,'wr-caption'));
   for(const [key,label] of Object.entries(labels)){const count=counts[key]||0,row=el('div',undefined,'wr-chart-row');row.append(el('span',label),el('strong',String(count)));
    const track=el('div',undefined,'wr-track'),fill=el('span',undefined,'wr-fill');track.setAttribute('aria-hidden','true');fill.style.width=(data.total?count/data.total*100:0)+'%';track.append(fill);row.append(track);section.append(row);}
   return section;
  }
  const charts=el('div',undefined,'wr-chart-grid');charts.append(bars('Para que comunicou',lib.PURPOSE,data.purposes,knownFunctions.length?knownFunctions.map(k=>lib.PURPOSE[k]).join(' · '):'Nenhuma função foi informada.'),bars('Onde foi observado',lib.CONTEXT,data.contexts,'Contextos informados pelo adulto.'));report.append(charts);
  const support=bars('Apoio observado',lib.SUPPORT,data.support,'Todos os tipos de apoio têm valor. Não informado permanece separado.');report.append(support);
  const words=el('section',undefined,'wr-words');words.append(el('h2','Um olhar para cada expressão'));
  const legend=el('div',undefined,'wr-legend');Object.entries(lib.SUPPORT).forEach(([key,label])=>{const item=el('span',undefined,'wr-legend-item'),mark=el('i',undefined,'wr-color-'+key);mark.setAttribute('aria-hidden','true');item.append(mark,document.createTextNode(label));legend.append(item);});words.append(legend);
  if(!data.words.length)words.append(el('p','Nenhuma expressão com acompanhamento ou registros nesta semana.'));
  for(const w of data.words){const card=el('section',undefined,'wr-word');card.append(el('h3',w.word),el('p',w.total+' observações · '+w.days+' dias com registros'+(!w.active?' · acompanhamento pausado':''),'wr-caption'));
   const stack=el('div',undefined,'wr-stack');stack.setAttribute('aria-hidden','true');
   for(const key of Object.keys(lib.SUPPORT)){const part=el('span',undefined,'wr-color-'+key);part.style.width=(w.total?w.support[key]/w.total*100:0)+'%';stack.append(part);}card.append(stack);
   const counts=el('div',undefined,'wr-word-counts');for(const [key,label] of Object.entries(lib.SUPPORT))counts.append(el('span',label+': '+w.support[key]));card.append(counts);words.append(card);}
  report.append(words);
  const notes=el('section',undefined,'wr-section wr-notes');notes.append(el('h2','Observações para a fono'),el('p',state.notes[range.key]?.trim()||'Nenhuma observação adicional informada.'));report.append(notes);
  const footer=el('footer',undefined,'wr-footer');footer.append(el('p','Este documento organiza observações; não atribui nota nem conclui evolução terapêutica. Ausência de registro não significa ausência de comunicação.'),el('p','Gerado localmente pela Jornada de Bia. Compartilhe somente com as pessoas escolhidas por você.'));report.append(footer);
  return report;
 }
 root.JBWordReport={build};
})(window);
