/* Conta opcional: Google somente por escolha do adulto; sessões em memória. */
(function(root){
 'use strict';
 const $=id=>document.getElementById(id),api=root.JBDataAPI.createClient();if(!$('dataGoogleStart'))return;
 let session=null,job=null,generation=0,expiry=null,googleAttempt=null,historyBefore=null,historyFamily=null,inviteMessage='',statusTarget='dataAccountStatus';
 const allowed=()=>!!root.SecurityService?.isUnlocked?.();
 const status=text=>$(statusTarget).textContent=text;
 function update(){
  const unlocked=allowed(),family=session?.families.find(f=>f.id===$('dataAccountFamily').value);
  const writer=root.JBDataAPI.canWrite(family);
  $('dataAccountFamilyPicker').hidden=!(session?.families.length>1);
  $('dataAccountFamilyName').hidden=!!(session?.families.length>1);
  $('dataAccountFamilyName').textContent=family?'Família: '+family.name:'';
  $('dataAccountPermissionHint').hidden=!family||writer;
  $('dataSharingConnected').hidden=!unlocked||!session;$('dataSharingOffline').hidden=!!(unlocked&&session);
  const laboratory=!!(unlocked&&session?.manageExperiments&&Date.now()<session.expiresAt);
  $('experimentalCardsAdmin').hidden=!laboratory;$('experimentConfigFields').disabled=!laboratory||!!job;
  $('dataAccessOwner').hidden=family?.role!=='owner';
  $('dataAccountIdentity').textContent=session?.email?'Conta: '+session.email:'';
  $('dataAccountRole').textContent=family?('Acesso: '+({owner:'responsável da família',member:'consulta e edição dos cartões da conta',viewer:'somente consulta dos cartões da conta'}[family.role]||'consulte suas permissões')):'';
  for(const id of ['dataInviteFields','dataInviteAcceptFields','dataAccessLoad','dataInviteCopy','dataAccountRefresh','dataHistoryLoad'])$(id).disabled=!!job;
  $('dataHistoryMore').disabled=!!job||historyBefore===null;
  $('dataAccountUnlock').hidden=unlocked;$('dataAccountControls').hidden=!unlocked;
  $('dataAccountSignIn').hidden=!!session;$('dataAccountConnected').hidden=!session;
  $('dataGoogleStart').disabled=!!job;
  for(const id of ['dataAccountImport','dataAccountReview','dataAccountTrash','dataAccountFamily'])$(id).disabled=!!job;
  for(const id of ['dataAccountUpload','dataAccountCategories','dataAccountSave'])$(id).disabled=!!job||!writer;
 }
 function logout(message='Conta desconectada. As frases deste aparelho foram preservadas.'){
  for(const id of ['dataAccountStatus','dataSharingStatus','dataInviteStatus','dataAccessStatus','dataInviteAcceptStatus'])$(id).textContent='';statusTarget=$('support-family').open?'dataSharingStatus':'dataAccountStatus';
  clearHistory();clearAccess();$('dataInviteAcceptCode').value='';$('dataInviteEmail').value='';$('dataAccountDifferences').replaceChildren();generation++;job?.abort();job=null;session=null;googleAttempt=null;clearTimeout(expiry);expiry=null;
  $('dataGoogleButton').replaceChildren();$('dataAccountFamily').replaceChildren();root.JBGoogleAccess?.cancel();
  update();status(message);
 }
 function active(){
  if(!allowed())throw Error('Desbloqueie a administração para conectar.');
  if(!session||Date.now()>=session.expiresAt){logout('Sua sessão online expirou. Conecte novamente com o Google.');throw Error('Sua sessão online expirou. Conecte novamente com o Google.');}
  const family=session.families.find(f=>f.id===$('dataAccountFamily').value);
  if(!family)throw Error('Selecione uma família da sua conta.');
  return family;
 }
 async function run(operation){
  if(job)return;
  statusTarget=document.activeElement?.closest('#dataInviteForm,#dataInviteCreated')?'dataInviteStatus':document.activeElement?.closest('#dataInviteAcceptForm')?'dataInviteAcceptStatus':document.activeElement?.closest('#dataAccessPeople')?'dataAccessStatus':document.activeElement?.closest('#support-family')?'dataSharingStatus':'dataAccountStatus';
  if(!allowed()){status('Desbloqueie a administração.');return;}
  const ticket=generation,controller=new AbortController();job=controller;update();
  const guard=()=>{if(ticket!==generation||controller.signal.aborted||!allowed())throw Error('Operação interrompida. As frases locais foram preservadas.');};
  try{await operation(controller.signal,guard);}
  catch(error){if(ticket===generation){if(error.status===401)logout('Conexão inválida ou expirada. Conecte novamente com o Google.');else status(error.message||'Não foi possível concluir. As frases locais foram preservadas.');}}
  finally{if(job===controller)job=null;update();}
 }
 root.JBExperimentAccess={async authorize(){
  if(!allowed()||!session||!session.manageExperiments||Date.now()>=session.expiresAt){update();return false;}
  const ticket=generation,token=session.token;
  try{
   const capabilities=await api.capabilities(token);
   if(ticket!==generation||!session||session.token!==token||!allowed()||Date.now()>=session.expiresAt)return false;
   session.manageExperiments=capabilities.manage_experiments;update();return session.manageExperiments;
  }catch(error){
   if(ticket===generation){if(error.status===401)logout();else{session.manageExperiments=false;update();}}
   return false;
  }
 }};
 $('dataSharingConnect').onclick=()=>{$('support-account').open=true;$('support-account').scrollIntoView({block:'start'});$(allowed()?'dataGoogleStart':'dataAccountUnlock').focus({preventScroll:true});};
 $('dataAccountUnlock').onclick=async()=>{await root.requestGuardianUnlock?.();update();};
 $('dataAccountLogout').onclick=()=>logout();
 $('dataGoogleStart').onclick=()=>run(async(signal,guard)=>{
  googleAttempt=null;$('dataGoogleButton').replaceChildren();status('Preparando acesso com o Google…');
  const config=await api.googleConfig(signal);guard();
  const challenge=await api.googleChallenge(signal);guard();
  const attempt={...challenge,ticket:generation,expiresAt:Date.now()+300000};googleAttempt=attempt;
  await root.JBGoogleAccess.render($('dataGoogleButton'),config.client_id,challenge.nonce,async credential=>{
   if(googleAttempt!==attempt||attempt.ticket!==generation||session||!allowed())return;
   if(Date.now()>=attempt.expiresAt){googleAttempt=null;status('O acesso expirou. Toque em Conectar minha conta novamente.');return;}
   googleAttempt=null;
   await run(async(signal,guard)=>{
    status('Conectando sua conta…');
    const auth=await api.googleLogin(credential,attempt.challenge,signal);guard();
    const families=await api.families(auth.access_token,signal);guard();
    if(!families.length)throw Error('Esta conta ainda não possui uma família disponível.');
    let manageExperiments=false;try{manageExperiments=(await api.capabilities(auth.access_token,signal)).manage_experiments;}catch{}guard();
    session={email:auth.email,token:auth.access_token,families,manageExperiments,expiresAt:Date.now()+Math.min(auth.expires_in,900)*1000};
    $('dataAccountFamily').replaceChildren();for(const f of families){const option=document.createElement('option');option.value=f.id;option.textContent=f.name;$('dataAccountFamily').append(option);}
    expiry=setTimeout(()=>logout('Sua sessão online expirou. Conecte novamente com o Google.'),Math.min(auth.expires_in,900)*1000);
    $('dataGoogleButton').replaceChildren();
    status('Conta conectada. Escolha Guardar ou Trazer frases. Nenhuma frase foi transferida ao entrar.');
   });
  },()=>googleAttempt===attempt&&allowed());guard();
  status('Use o botão do Google abaixo para escolher sua conta.');
 });
 async function sendNewPhrases(signal,guard,confirmed=false){
  clearReview();const family=active(),token=session.token;status('Conferindo categorias e cartões da família…');
  const catalog=await api.catalog(token,family.id,signal);guard();const remote=await api.cards(token,family.id,signal);guard();
  const plan=root.JBDataAPI.planUpload(root.JBCommunication.snapshot().phrases,catalog,remote,family.id);
  let sent=0;const counts=plan.counts;
  if(!confirmed&&plan.planned.length&&!root.confirm('Enviar uma cópia de '+plan.planned.length+' frase(s) deste aparelho para a família “'+family.name+'”? Edições e exclusões existentes não serão propagadas.')){status('Envio cancelado. Nenhuma frase foi enviada.');return;}
  for(const item of plan.planned){
   guard();active();const phrase=root.JBCommunication.prepareCloudUpload(item.id,family.id);
   if(phrase.text!==item.text||(phrase.category||'Geral')!==item.category){counts.changed++;continue;}
   try{
    const card=await api.upload({client_id:phrase.cloudIds[family.id],category_id:item.category_id,text:item.text,display_order:0},token,family.id,signal);guard();
    root.JBCommunication.markCloudUpload(item.id,family.id,card.id);sent++;
   }catch(error){if(error.status===409){counts.changed++;continue;}throw error;}
  }
  status((sent?sent+' frase(s) nova(s) guardada(s) na conta. ':'Suas frases novas já estão guardadas na conta. ')+(counts.changed?'Há '+counts.changed+' alteração(ões) para revisar em Opções avançadas. ':'')+(counts.unsupported?'Algumas frases precisam de revisão e continuam neste aparelho. ':'')+'Nenhuma frase foi apagada.');
 }
 $('dataAccountUpload').onclick=()=>run((signal,guard)=>sendNewPhrases(signal,guard));
 $('dataAccountSave').onclick=()=>run(async(signal,guard)=>{
  clearReview();const family=active(),token=session.token,snapshot=root.JBCommunication.snapshot();
  if(!root.confirm('Guardar uma cópia das frases e categorias na conta da família “'+family.name+'”? As frases existentes não serão substituídas sem revisão.'))return;
  status('Guardando suas frases…');
  let catalog=await api.catalog(token,family.id,signal);guard();
  const missing=root.JBDataAPI.missingCategories([...snapshot.categories,...snapshot.phrases.map(p=>p.category||'Geral')],catalog);
  if(missing.length){await api.compatibleCategories(signal);guard();}
  for(const name of missing){guard();active();await api.createCategory(name,token,family.id,signal);guard();}
  await sendNewPhrases(signal,guard,true);
 });
 $('dataAccountCategories').onclick=()=>run(async(signal,guard)=>{
  clearReview();const family=active(),token=session.token;
  status('Conferindo categorias da família…');await api.compatibleCategories(signal);guard();
  const catalog=await api.catalog(token,family.id,signal);guard();
  const snapshot=root.JBCommunication.snapshot();
  const names=[...snapshot.categories,...snapshot.phrases.map(p=>p.category||'Geral')];
  const missing=root.JBDataAPI.missingCategories(names,catalog);
  if(!missing.length){status('Todas as categorias válidas deste aparelho já estão disponíveis na conta.');return;}
  if(!root.confirm('Enviar '+missing.length+' categoria(s) para a família “'+family.name+'”?\n'+missing.join(', ')+'\nNenhuma frase será enviada por este botão.')){status('Envio de categorias cancelado.');return;}
  let sent=0;
  for(const name of missing){guard();active();await api.createCategory(name,token,family.id,signal);guard();sent++;}
  status(sent+' categoria(s) disponível(is) na conta. Agora você pode enviar as frases dessas categorias. Categorias locais e de outras famílias foram preservadas.');
 });
 $('dataAccountImport').onclick=()=>run(async(signal,guard)=>{
  clearReview();const family=active(),token=session.token;status('Consultando cartões da família…');
  const catalog=await api.catalog(token,family.id,signal);guard();const cards=await api.cards(token,family.id,signal);guard();
  if(!root.confirm('Importar categorias e novos cartões da família “'+family.name+'” para Minha Comunicação? As frases existentes serão preservadas.')){status('Importação cancelada.');return;}
  guard();active();const result=root.JBCommunication.importCloudCards(cards,catalog,family.id);
  status(result.added?result.added+' frase(s) adicionada(s) a Minhas frases. Já pode usá-las sem internet.':'As frases da conta já estão neste aparelho ou na lixeira local. Nada foi duplicado. Abra Minha Comunicação para usar ou restaurar.');
 });
 async function showAccountRecovery(signal,guard){
  clearReview();const family=active(),token=session.token;
  status('Consultando frases guardadas na conta…');await api.compatibleTrash(signal);guard();
  const catalog=await api.catalog(token,family.id,signal);guard();
  const cards=await api.cards(token,family.id,signal);guard();
  const trash=await api.trash(token,family.id,signal);guard();
  for(const [rows,archived] of [[cards,false],[trash,true]]){
   const heading=document.createElement('h4');heading.textContent=archived?'Arquivadas na conta':'Frases guardadas na conta';$('dataAccountDifferences').append(heading);
   if(!rows.length){const empty=document.createElement('p');empty.textContent='Nenhuma frase aqui.';$('dataAccountDifferences').append(empty);}
   for(const card of rows){
    const panel=document.createElement('section'),description=document.createElement('p'),button=document.createElement('button');
    description.textContent=card.text+' — '+(catalog.find(c=>c.id===card.category_id)?.name||'Categoria');
    button.type='button';button.textContent='Restaurar em Minhas frases';button.disabled=archived&&!root.JBDataAPI.canWrite(family);
    button.onclick=()=>run(async(signal,guard)=>{
     if(active().id!==family.id)throw Error('A família mudou. Consulte novamente.');
     if(!root.confirm('Trazer “'+card.text+'” para Minhas frases neste aparelho? As frases atuais serão preservadas.'))return;
     let restored=card;
     if(archived){restored=await api.changeTrash(card,true,token,family.id,signal);guard();}
     try{
      guard();active();root.JBCommunication.importCloudCards([restored],catalog,family.id,{restoreTrashed:true});
     }catch(error){
      if(archived){await showAccountRecovery(signal,guard);status('A frase foi restaurada na conta, mas não pôde ser salva neste aparelho. Ela continua segura na conta. Tente Restaurar em Minhas frases novamente.');return;}
      throw error;
     }
     await showAccountRecovery(signal,guard);
     status('Frase disponível em Minhas frases neste aparelho. Você pode usá-la sem internet.');
    });
    panel.append(description,button);
    if(!archived&&root.JBDataAPI.canWrite(family)){
     const details=document.createElement('details'),summary=document.createElement('summary'),archive=document.createElement('button');
     summary.textContent='Opções da cópia na conta';archive.type='button';archive.textContent='Arquivar somente na conta';
     archive.onclick=()=>run(async(signal,guard)=>{
      if(active().id!==family.id)throw Error('A família mudou. Consulte novamente.');
      if(!root.confirm('Arquivar “'+card.text+'” somente na conta? A frase deste aparelho permanece em Minhas frases.'))return;
      guard();active();await api.changeTrash(card,false,token,family.id,signal);guard();
      await showAccountRecovery(signal,guard);status('Cópia arquivada na conta. Minhas frases neste aparelho não foi alterada.');
     });
     details.append(summary,archive);panel.append(details);
    }
    $('dataAccountDifferences').append(panel);
   }
  }
  status('Escolha Restaurar em Minhas frases para trazer uma frase a este aparelho.');
 }
 $('dataAccountTrash').onclick=()=>run(showAccountRecovery);
 function clearHistory(){
  historyBefore=null;historyFamily=null;$('dataHistoryList').replaceChildren();$('dataHistoryStatus').textContent='';$('dataHistoryMore').hidden=true;
 }
 async function loadHistory(signal,guard,append){
  const family=active();if(family.role!=='owner')throw Error('Somente o responsável pode consultar este histórico.');
  if(append&&historyFamily!==family.id)throw Error('A família mudou. Consulte o histórico novamente.');
  status(append?'Carregando registros anteriores…':'Consultando histórico dos cartões…');
  if(!append){clearHistory();await api.compatibleHistory(signal);guard();}
  const page=await api.history(session.token,family.id,append?historyBefore:null,signal);guard();active();
  const labels={'card.created':'Cartão criado','card.updated':'Cartão editado','card.archived':'Cartão movido para a lixeira','card.restored':'Cartão restaurado'};
  for(const event of page.events){
   const panel=document.createElement('section'),heading=document.createElement('p'),actor=document.createElement('p'),card=document.createElement('p'),time=document.createElement('time');
   panel.dataset.eventId=String(event.id);time.dateTime=event.recorded_at;time.textContent=new Date(event.recorded_at).toLocaleString('pt-BR');
   const title=document.createElement('strong');title.textContent=labels[event.action];heading.append(title,document.createTextNode(' — '),time);
   actor.textContent='Por: '+(event.actor_email||'Conta não disponível');
   card.textContent=event.card_label?'Identificação atual: '+event.card_label:'O cartão já não está disponível.';
   panel.append(heading,actor,card);$('dataHistoryList').append(panel);
  }
  historyFamily=family.id;historyBefore=page.next_before_id;$('dataHistoryMore').hidden=historyBefore===null;
  const count=$('dataHistoryList').children.length;
  $('dataHistoryStatus').textContent=count?(count+' registro(s) exibido(s). Horários do navegador.'):'Ainda não há alterações registradas desde a ativação do histórico.';
  status('Histórico consultado. Nenhum cartão foi alterado.');
 }
 $('dataHistoryLoad').onclick=()=>run((signal,guard)=>loadHistory(signal,guard,false));
 $('dataHistoryMore').onclick=()=>run((signal,guard)=>loadHistory(signal,guard,true));
 function updateInviteRoleHelp(){
  $('dataInviteRoleHelp').textContent=$('dataInviteRole').value==='member'?'Pode ver, trazer, editar e arquivar frases da conta, além de criar categorias. Não pode convidar pessoas nem gerenciar acessos.':'Pode ver as frases da conta e trazer uma cópia para seu aparelho. Não pode alterar a conta.';
 }
 $('dataInviteRole').addEventListener('change',updateInviteRoleHelp);updateInviteRoleHelp();
 function clearAccess(clearInvite=true){$('dataAccessList').replaceChildren();if(clearInvite){inviteMessage='';$('dataInviteCode').value='';$('dataInviteCreated').hidden=true;}}
 async function refreshFamilies(signal,guard,preferred){
  const token=session.token,previous=preferred||$('dataAccountFamily').value;
  const families=await api.families(token,signal);guard();
  if(!families.length){logout('Esta conta não tem mais famílias disponíveis.');return;}
  session.families=families;$('dataAccountFamily').replaceChildren();
  for(const family of families){const option=document.createElement('option');option.value=family.id;option.textContent=family.name;$('dataAccountFamily').append(option);}
  if(families.some(f=>f.id===previous))$('dataAccountFamily').value=previous;
  clearReview();clearAccess();clearHistory();update();
 }
 $('dataAccountRefresh').onclick=()=>run(async(signal,guard)=>{active();status('Atualizando famílias e permissões…');await refreshFamilies(signal,guard);guard();status('Famílias e permissões atualizadas. Nenhum cartão foi transferido.');});
 $('dataInviteAcceptForm').onsubmit=event=>{
  event.preventDefault();const code=$('dataInviteAcceptCode').value.trim();
  run(async(signal,guard)=>{
   active();await api.compatibleAccess(signal);guard();
   if(!root.confirm('Aceitar o convite na conta conectada? Use a conta com o e-mail para o qual o convite foi criado.'))return;
   status('Aceitando convite…');const family=await api.inviteAccept(code,session.token,signal);guard();
   await refreshFamilies(signal,guard,family.id);guard();
   status('Convite aceito. Família selecionada: '+family.name+'. Para trazer as frases, escolha Trazer frases da conta.');
  }).finally(()=>{$('dataInviteAcceptCode').value='';});
 };
 $('dataInviteForm').onsubmit=event=>{
  event.preventDefault();const email=$('dataInviteEmail').value.trim(),role=$('dataInviteRole').value;
  run(async(signal,guard)=>{
   const family=active();if(family.role!=='owner')throw Error('Somente o responsável pode gerar convites.');
   await api.compatibleAccess(signal);guard();
   if(!root.confirm('Convidar '+email+' para a família “'+family.name+'” com permissão de '+(role==='viewer'?'consulta':'edição dos cartões')+'?'))return;
   status('Gerando convite…');clearAccess();const created=await api.inviteCreate(email,role,session.token,family.id,signal);guard();
   inviteMessage='Você recebeu um convite para a família “'+family.name+'” na Jornada de Bia.\nEntre com o Google '+email+' em https://rafaelrmayer.github.io/jornada-de-Bia_Sakura_V_9.1/\nEm Apoio, abra Família e compartilhamento → Recebi um convite e cole este código:\n'+created.code+'\nVálido por 48 horas. Permissão: '+(role==='viewer'?'visualizar e trazer frases':'editar e organizar frases')+'.';
   $('dataInviteCode').value=created.code;$('dataInviteCreated').hidden=false;$('dataInviteCreated').scrollIntoView({block:'center'});
   status('Convite pronto. Toque em Copiar convite e envie à pessoa. Válido por 48 horas.');
  });
 };
 $('dataInviteCopy').onclick=async()=>{
  statusTarget='dataInviteStatus';
  try{if(!allowed()||active().role!=='owner'||!$('dataInviteCode').value)return;await root.navigator.clipboard.writeText(inviteMessage||$('dataInviteCode').value);status('Convite copiado. Agora cole na conversa com a pessoa convidada.');}
  catch{$('dataInviteCode').focus();$('dataInviteCode').select();status('O código está selecionado. Use Copiar no navegador e envie à pessoa convidada.');}
 };
 async function loadAccess(signal,guard){
  const family=active(),token=session.token;if(family.role!=='owner')throw Error('Somente o responsável pode consultar acessos e convites.');
  status('Consultando pessoas…');clearAccess(false);await api.compatibleAccess(signal);guard();
  const members=await api.members(token,family.id,signal);guard();
  const invites=await api.invitations(token,family.id,signal);guard();
  const addAction=(panel,label,operation,email)=>{
   const button=document.createElement('button');button.type='button';button.textContent=label;
   button.onclick=()=>run(async(signal,guard)=>{
    if(active().id!==family.id||active().role!=='owner')throw Error('A família ou permissão mudou. Consulte novamente.');
    if(!root.confirm(label+' para '+email+' na família “'+family.name+'”?'))return;
    await operation(signal);guard();if(label==='Cancelar convite')clearAccess();await loadAccess(signal,guard);status('Acesso atualizado. As cópias já trazidas para outros aparelhos permanecem neles.');
   });panel.append(button);
  };
  const peopleHeading=document.createElement('h5');peopleHeading.textContent='Pessoas nesta família';$('dataAccessList').append(peopleHeading);
  for(const member of members){
   const panel=document.createElement('section'),description=document.createElement('p');
   description.textContent=member.email+' — '+({owner:'Responsável',member:'Pode editar e organizar',viewer:'Pode visualizar e trazer frases'}[member.role]);panel.append(description);
   if(member.role!=='owner'){
    const role=member.role==='viewer'?'member':'viewer';
    addAction(panel,role==='member'?'Permitir alterações':'Permitir apenas visualização',signal=>api.memberRole(member.id,role,token,family.id,signal),member.email);
    addAction(panel,'Remover acesso',signal=>api.memberRevoke(member.id,token,family.id,signal),member.email);
   }
   $('dataAccessList').append(panel);
  }
  const invitesHeading=document.createElement('h5');invitesHeading.textContent='Convites';$('dataAccessList').append(invitesHeading);
  if(!invites.length){const empty=document.createElement('p');empty.textContent='Nenhum convite enviado.';$('dataAccessList').append(empty);}
  for(const invite of invites){
   const panel=document.createElement('section'),description=document.createElement('p');
   const pending=!invite.used_at&&!invite.revoked_at&&Date.parse(invite.expires_at)>Date.now();
   description.textContent=invite.email+' — convite '+(invite.used_at?'aceito':invite.revoked_at?'cancelado':pending?'pendente':'expirado');panel.append(description);
   if(pending)addAction(panel,'Cancelar convite',signal=>api.inviteRevoke(invite.id,token,family.id,signal),invite.email);
   $('dataAccessList').append(panel);
  }
  status('Lista de pessoas e convites atualizada.');
 }
 $('dataAccessLoad').onclick=()=>run(loadAccess);
 $('dataAccessPeople').addEventListener('toggle',()=>{if($('dataAccessPeople').open&&session&&allowed())run(loadAccess);});
 function clearReview(){$('dataAccountDifferences').replaceChildren();}
 $('dataAccountFamily').addEventListener('change',()=>{for(const id of ['dataSharingStatus','dataInviteStatus','dataAccessStatus','dataInviteAcceptStatus'])$(id).textContent='';clearReview();clearAccess();clearHistory();update();});
 $('dataAccountReview').onclick=()=>run(async(signal,guard)=>{
  clearReview();const family=active(),token=session.token;
  status('Comparando frases vinculadas à família…');
  await api.compatibleEdits(signal);guard();
  const catalog=await api.catalog(token,family.id,signal);guard();
  const remote=await api.cards(token,family.id,signal);guard();
  const differences=root.JBDataAPI.planEdits(root.JBCommunication.snapshot().phrases,catalog,remote,family.id);
  status(differences.length+' diferença(s) encontrada(s). Escolha uma versão por frase ou deixe para depois. Nenhuma exclusão será propagada.');
  for(const item of differences){
   const panel=document.createElement('section'),local=document.createElement('p'),online=document.createElement('p');
   local.textContent='Neste aparelho: '+item.phrase.text+' — '+(item.phrase.category||'Geral');
   online.textContent='Na conta: '+item.card.text+' — '+item.category;
   panel.append(local,online);
   const choose=(label,useLocal)=>{
    const button=document.createElement('button');button.type='button';button.textContent=label;
    button.onclick=()=>run(async(signal,guard)=>{
     if(active().id!==family.id)throw Error('A família mudou. Compare novamente.');
     const current=root.JBCommunication.snapshot().phrases.find(p=>p.id===item.phrase.id);
     if(JSON.stringify(current)!==JSON.stringify(item.phrase))throw Error('A frase local mudou. Compare novamente.');
     if(!root.confirm('Usar a versão '+(useLocal?'deste aparelho na conta':'da conta neste aparelho')+'? A versão escolhida substituirá o texto e a categoria da outra.'))return;
     guard();active();
     if(useLocal){
      if(!item.localCategory)throw Error('A categoria local ainda não está disponível na conta.');
      await api.edit(item.card,{text:item.phrase.text,category_id:item.localCategory.id},token,family.id,signal);guard();
      root.JBCommunication.markCloudUpload(item.phrase.id,family.id,item.card.id);
     }else{
      const latest=await api.cards(token,family.id,signal);guard();
      const card=latest.find(c=>c.id===item.card.id);
      if(!card||card.updated_at!==item.card.updated_at||card.text!==item.card.text||card.category_id!==item.card.category_id)throw Error('A frase na conta mudou. Compare novamente.');
      root.JBCommunication.applyCloudEdit(item.phrase,card,item.category,family.id);
     }
     panel.remove();status('Edição aplicada. As frases continuam disponíveis offline. Compare novamente para conferir as demais diferenças.');
    });
    if(useLocal&&(!item.localCategory||!root.JBDataAPI.canWrite(family)))button.disabled=true;
    panel.append(button);
   };
   choose('Usar versão deste aparelho',true);choose('Usar versão da conta',false);
   $('dataAccountDifferences').append(panel);
  }
 });
 document.addEventListener('bia:admin-access-changed',()=>{if(!allowed())logout('Administração bloqueada. Entre novamente quando desbloquear.');else update();});
 document.addEventListener('jornadaBia:sessionExpired',()=>logout('Administração expirada. Desbloqueie para conectar novamente.'));
 root.addEventListener('pagehide',()=>logout('Conta desconectada.'));
 update();
})(window);
