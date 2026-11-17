/* Interface administrativa: enviar/importar é sempre uma escolha explícita. */
(function(root){
 'use strict';
 const $=id=>document.getElementById(id),api=root.JBDataAPI.createClient();if(!$('dataAccountForm'))return;
 let session=null,job=null,generation=0,expiry=null,recoveryOpen=false;
 const allowed=()=>!!root.SecurityService?.isUnlocked?.();
 const status=text=>$('dataAccountStatus').textContent=text;
 function update(){
  const unlocked=allowed(),family=session?.families.find(f=>f.id===$('dataAccountFamily').value);
  const writer=root.JBDataAPI.canWrite(family);
  $('dataAccessOwner').hidden=family?.role!=='owner';
  $('dataAccountIdentity').textContent=session?.email?'Conta: '+session.email:'';
  $('dataAccountRole').textContent=family?('Acesso: '+({owner:'responsável da família',member:'consulta e edição dos cartões da conta',viewer:'somente consulta dos cartões da conta'}[family.role]||'consulte suas permissões')):'';
  for(const id of ['dataInviteFields','dataInviteAcceptFields','dataAccessLoad','dataInviteCopy','dataAccountRefresh'])$(id).disabled=!!job;
  $('dataAccountUnlock').hidden=unlocked;$('dataAccountControls').hidden=!unlocked;
  $('dataAccountForm').hidden=!!session||recoveryOpen;$('dataRecoveryOpen').hidden=!!session||recoveryOpen;$('dataRecoveryForm').hidden=!!session||!recoveryOpen;$('dataAccountConnected').hidden=!session;
  $('dataAuthFields').disabled=!!job;$('dataPasswordFields').disabled=!!job;$('dataRecoveryFields').disabled=!!job;$('dataRecoveryCodeFields').disabled=$('dataRecoveryCodeFields').hidden||!!job;$('dataRecoveryOpen').disabled=!!job;
  for(const id of ['dataAccountImport','dataAccountReview','dataAccountTrash','dataAccountFamily'])$(id).disabled=!!job;
  for(const id of ['dataAccountUpload','dataAccountCategories'])$(id).disabled=!!job||!writer;
 }
 function logout(message='Conta desconectada. As frases deste aparelho foram preservadas.'){
  clearAccess();$('dataInviteAcceptCode').value='';$('dataInviteEmail').value='';$('dataAccountDifferences').replaceChildren();generation++;job?.abort();job=null;session=null;clearTimeout(expiry);expiry=null;
  recoveryOpen=false;$('dataRecoveryEmail').value='';$('dataRecoveryCodeFields').hidden=true;clearPasswords();$('dataAccountPassword').value='';$('dataAccountEmail').value='';$('dataFamilyName').value='';$('dataAccountFamily').replaceChildren();
  update();status(message);
 }
 function active(){
  if(!allowed())throw Error('Desbloqueie a administração para conectar.');
  if(!session||Date.now()>=session.expiresAt){logout('Sua sessão online expirou. Entre novamente.');throw Error('Sua sessão online expirou. Entre novamente.');}
  const family=session.families.find(f=>f.id===$('dataAccountFamily').value);
  if(!family)throw Error('Selecione uma família da sua conta.');
  return family;
 }
 async function run(operation){
  if(job)return;
  if(!allowed()){status('Desbloqueie a administração.');return;}
  const ticket=generation,controller=new AbortController();job=controller;update();
  const guard=()=>{if(ticket!==generation||controller.signal.aborted||!allowed())throw Error('Operação interrompida. As frases locais foram preservadas.');};
  try{await operation(controller.signal,guard);}
  catch(error){if(ticket===generation){if(error.status===401)logout('Sessão inválida ou expirada. Entre novamente.');else status(error.message||'Não foi possível concluir. As frases locais foram preservadas.');}}
  finally{if(job===controller)job=null;update();}
 }
 function changeMode(){
  const register=$('dataAccountMode').value==='register';
  $('dataFamilyNameLabel').hidden=!register;$('dataFamilyName').required=register;
  $('dataAccountPassword').minLength=register?12:1;$('dataAccountPassword').autocomplete=register?'new-password':'current-password';
  $('dataAccountSubmit').textContent=register?'Criar conta e entrar':'Entrar';
 }
 $('dataAccountMode').addEventListener('change',changeMode);changeMode();
 $('dataAccountUnlock').onclick=async()=>{await root.requestGuardianUnlock?.();update();};
 $('dataAccountLogout').onclick=()=>logout();
 $('dataAccountForm').onsubmit=event=>{
  event.preventDefault();
  const email=$('dataAccountEmail').value.trim(),password=$('dataAccountPassword').value,mode=$('dataAccountMode').value,name=$('dataFamilyName').value.trim();
  run(async(signal,guard)=>{
   status('Conectando à conta…');await api.compatible(signal);guard();
   if(mode==='register'){
    if(!name)throw Error('Informe o nome da família.');
    try{await api.register(email,password,name,signal);}catch(error){if(error.status===409)throw Error('Já existe cadastro com este e-mail. Selecione Entrar na minha conta.');throw error;}guard();
   }
   let auth;
   try{auth=await api.login(email,password,signal);}catch(error){if(error.status===401)throw Error('E-mail ou senha não conferem. A senha da conta é diferente do PIN administrativo.');throw error;}guard();
   const families=await api.families(auth.access_token,signal);guard();
   if(!families.length)throw Error('Esta conta ainda não possui uma família disponível.');
   session={email:email.toLowerCase(),token:auth.access_token,families,expiresAt:Date.now()+Math.min(auth.expires_in,900)*1000};
   $('dataAccountFamily').replaceChildren();for(const f of families){const option=document.createElement('option');option.value=f.id;option.textContent=f.name;$('dataAccountFamily').append(option);}
   clearTimeout(expiry);expiry=setTimeout(()=>logout('Sua sessão online expirou. Entre novamente.'),Math.min(auth.expires_in,900)*1000);
   $('dataAccountPassword').value='';status('Conta conectada. Escolha enviar novas frases ou importar cartões. Nenhuma frase foi transferida automaticamente.');
  }).finally(()=>{$('dataAccountPassword').value='';});
 };
 function clearPasswords(){for(const id of ['dataCurrentPassword','dataNewPassword','dataConfirmPassword','dataRecoveryCode','dataRecoveryPassword','dataRecoveryConfirm'])$(id).value='';}
 $('dataRecoveryOpen').onclick=()=>run(async(signal,guard)=>{
  status('Verificando disponibilidade da recuperação…');
  const enabled=await api.recoveryStatus(signal);guard();
  if(!enabled){status('Recuperação por e-mail ainda não disponível. Você pode continuar usando as frases neste aparelho.');return;}
  recoveryOpen=true;$('dataRecoveryCodeFields').hidden=true;clearPasswords();
  $('dataRecoveryEmail').value=$('dataAccountEmail').value.trim();
  status('Informe o e-mail da conta para solicitar um código. O PIN deste aparelho não será alterado.');
 });
 $('dataRecoveryCancel').onclick=()=>logout('Recuperação fechada. Entre na conta quando desejar.');
 $('dataRecoveryEmail').addEventListener('input',()=>{$('dataRecoveryCodeFields').hidden=true;clearPasswords();update();});
 $('dataRecoverySend').onclick=()=>{
  if(!$('dataRecoveryEmail').reportValidity())return;
  const email=$('dataRecoveryEmail').value.trim();clearPasswords();
  run(async(signal,guard)=>{
   status('Solicitando código de recuperação…');
   await api.recoveryRequest(email,signal);guard();clearPasswords();$('dataRecoveryCodeFields').hidden=false;
   status('Se a conta existir e o envio estiver disponível, você receberá um código. Confira o e-mail e o spam. Aguarde ao menos 60 segundos antes de solicitar novamente.');
  });
 };
 $('dataRecoveryForm').onsubmit=event=>{
  event.preventDefault();
  if($('dataRecoveryCodeFields').hidden)return;
  const email=$('dataRecoveryEmail').value.trim(),code=$('dataRecoveryCode').value.trim(),password=$('dataRecoveryPassword').value,confirmation=$('dataRecoveryConfirm').value;
  if(password!==confirmation){status('A confirmação da nova senha não confere.');clearPasswords();return;}
  run(async(signal,guard)=>{
   if(!root.confirm('Redefinir a senha da conta e encerrar as sessões antigas? As frases deste aparelho serão preservadas.'))return;
   status('Redefinindo a senha…');
   try{await api.recoveryConfirm(email,code,password,signal);guard();}
   catch(error){
    if(error.status){throw error;}
    guard();logout('Não foi possível confirmar a redefinição. Tente entrar com a nova senha; se necessário, solicite outro código.');return;
   }
   logout('Senha redefinida. Entre novamente com a nova senha. As frases locais foram preservadas.');
  }).finally(clearPasswords);
 };
 $('dataAccountPasswordForm').onsubmit=event=>{
  event.preventDefault();
  const current=$('dataCurrentPassword').value,next=$('dataNewPassword').value,confirmation=$('dataConfirmPassword').value;
  if(next!==confirmation){status('A confirmação da nova senha não confere.');clearPasswords();return;}
  if(next===current){status('A nova senha precisa ser diferente da atual.');clearPasswords();return;}
  run(async(signal,guard)=>{
   active();clearReview();
   await api.compatiblePassword(signal);guard();
   if(!root.confirm('Alterar a senha e encerrar as sessões online em todos os aparelhos? As frases e os dados serão preservados.'))return;
   status('Alterando a senha da conta…');
   try{await api.changePassword(current,next,session.token,signal);guard();}
   catch(error){
    if(error.status===400||error.status===422)throw error;
    guard();logout('Não foi possível confirmar a alteração. Entre novamente; se a senha anterior não funcionar, use a nova senha informada.');
    return;
   }
   logout('Senha alterada. Entre novamente com a nova senha. As sessões antigas foram encerradas.');
  }).finally(clearPasswords);
 };
 $('dataAccountUpload').onclick=()=>run(async(signal,guard)=>{
  clearReview();const family=active(),token=session.token;status('Conferindo categorias e cartões da família…');
  const catalog=await api.catalog(token,family.id,signal);guard();const remote=await api.cards(token,family.id,signal);guard();
  const plan=root.JBDataAPI.planUpload(root.JBCommunication.snapshot().phrases,catalog,remote,family.id);
  let sent=0;const counts=plan.counts;
  if(plan.planned.length&&!root.confirm('Enviar uma cópia de '+plan.planned.length+' frase(s) deste aparelho para a família “'+family.name+'”? Edições e exclusões existentes não serão propagadas.')){status('Envio cancelado. Nenhuma frase foi enviada.');return;}
  for(const item of plan.planned){
   guard();active();const phrase=root.JBCommunication.prepareCloudUpload(item.id,family.id);
   if(phrase.text!==item.text||(phrase.category||'Geral')!==item.category){counts.changed++;continue;}
   try{
    const card=await api.upload({client_id:phrase.cloudIds[family.id],category_id:item.category_id,text:item.text,display_order:0},token,family.id,signal);guard();
    root.JBCommunication.markCloudUpload(item.id,family.id,card.id);sent++;
   }catch(error){if(error.status===409){counts.changed++;continue;}throw error;}
  }
  status(sent+' frase(s) enviada(s). '+counts.existing+' já presente(s); '+counts.changed+' com alterações preservadas; '+counts.unsupported+' fora do catálogo/limite, mantida(s) neste aparelho. Edições e exclusões não foram sincronizadas.');
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
  status(result.categoriesAdded+' categoria(s) adicionada(s). '+result.added+' novo(s) cartão(ões) importado(s). '+result.existing+' já presente(s), preservado(s) sem sobrescrita. Você pode usá-los offline em Minha Comunicação.');
 });
 $('dataAccountTrash').onclick=()=>run(async(signal,guard)=>{
  clearReview();const family=active(),token=session.token;
  status('Consultando cartões e lixeira da conta…');await api.compatibleTrash(signal);guard();
  const catalog=await api.catalog(token,family.id,signal);guard();
  const cards=await api.cards(token,family.id,signal);guard();
  const trash=await api.trash(token,family.id,signal);guard();
  status(cards.length+' cartão(ões) na conta e '+trash.length+' na lixeira. Estas ações não apagam frases deste aparelho. Para trazer cartões restaurados, use Importar.');
  for(const [rows,restore] of [[cards,false],[trash,true]]){
   const heading=document.createElement('h4');heading.textContent=restore?'Lixeira da conta':'Cartões da conta';$('dataAccountDifferences').append(heading);
   for(const card of rows){
    const panel=document.createElement('section'),description=document.createElement('p'),button=document.createElement('button');
    description.textContent=card.text+' — '+(catalog.find(c=>c.id===card.category_id)?.name||'Categoria');
    button.type='button';button.textContent=restore?'Restaurar cartão na conta':'Mover para lixeira da conta';button.disabled=!root.JBDataAPI.canWrite(family);
    button.onclick=()=>run(async(signal,guard)=>{
     if(active().id!==family.id)throw Error('A família mudou. Consulte novamente.');
     if(!root.confirm((restore?'Restaurar':'Mover para a lixeira')+' o cartão “'+card.text+'” na conta da família “'+family.name+'”? As frases salvas neste aparelho serão preservadas.'))return;
     guard();active();await api.changeTrash(card,restore,token,family.id,signal);guard();
     panel.remove();status(restore?'Cartão restaurado na conta. Use Importar para trazê-lo ao aparelho, se necessário.':'Cartão movido para a lixeira da conta. A cópia deste aparelho foi preservada. Consulte a lixeira novamente para restaurar.');
    });
    panel.append(description,button);$('dataAccountDifferences').append(panel);
   }
  }
 });
 function clearAccess(){$('dataAccessList').replaceChildren();$('dataInviteCode').value='';$('dataInviteCreated').hidden=true;}
 async function refreshFamilies(signal,guard,preferred){
  const token=session.token,previous=preferred||$('dataAccountFamily').value;
  const families=await api.families(token,signal);guard();
  if(!families.length){logout('Esta conta não tem mais famílias disponíveis.');return;}
  session.families=families;$('dataAccountFamily').replaceChildren();
  for(const family of families){const option=document.createElement('option');option.value=family.id;option.textContent=family.name;$('dataAccountFamily').append(option);}
  if(families.some(f=>f.id===previous))$('dataAccountFamily').value=previous;
  clearReview();clearAccess();update();
 }
 $('dataAccountRefresh').onclick=()=>run(async(signal,guard)=>{active();status('Atualizando famílias e permissões…');await refreshFamilies(signal,guard);guard();status('Famílias e permissões atualizadas. Nenhum cartão foi transferido.');});
 $('dataInviteAcceptForm').onsubmit=event=>{
  event.preventDefault();const code=$('dataInviteAcceptCode').value.trim();
  run(async(signal,guard)=>{
   active();await api.compatibleAccess(signal);guard();
   if(!root.confirm('Aceitar o convite na conta conectada? Use a conta com o e-mail para o qual o convite foi criado.'))return;
   status('Aceitando convite…');const family=await api.inviteAccept(code,session.token,signal);guard();
   await refreshFamilies(signal,guard,family.id);guard();
   status('Convite aceito. Família selecionada: '+family.name+'. Os cartões só serão trazidos quando você escolher Importar.');
  }).finally(()=>{$('dataInviteAcceptCode').value='';});
 };
 $('dataInviteForm').onsubmit=event=>{
  event.preventDefault();const email=$('dataInviteEmail').value.trim(),role=$('dataInviteRole').value;
  run(async(signal,guard)=>{
   const family=active();if(family.role!=='owner')throw Error('Somente o responsável pode gerar convites.');
   await api.compatibleAccess(signal);guard();
   if(!root.confirm('Convidar '+email+' para a família “'+family.name+'” com permissão de '+(role==='viewer'?'consulta':'edição dos cartões')+'?'))return;
   status('Gerando convite…');clearAccess();const created=await api.inviteCreate(email,role,session.token,family.id,signal);guard();
   $('dataInviteCode').value=created.code;$('dataInviteCreated').hidden=false;
   status('Convite criado por 48 horas. Copie o código antes de sair ou trocar de família e compartilhe diretamente com a pessoa. Nenhum e-mail foi enviado.');
  });
 };
 $('dataInviteCopy').onclick=async()=>{
  try{if(!allowed()||active().role!=='owner'||!$('dataInviteCode').value)return;await root.navigator.clipboard.writeText($('dataInviteCode').value);status('Código copiado. Compartilhe diretamente com a pessoa convidada.');}
  catch{status('Selecione o código no campo e copie manualmente.');}
 };
 $('dataAccessLoad').onclick=()=>run(async(signal,guard)=>{
  const family=active(),token=session.token;if(family.role!=='owner')throw Error('Somente o responsável pode consultar acessos e convites.');
  status('Consultando acessos e convites…');clearAccess();await api.compatibleAccess(signal);guard();
  const members=await api.members(token,family.id,signal);guard();
  const invites=await api.invitations(token,family.id,signal);guard();
  const addAction=(panel,label,operation)=>{
   const button=document.createElement('button');button.type='button';button.textContent=label;
   button.onclick=()=>run(async(signal,guard)=>{
    if(active().id!==family.id||active().role!=='owner')throw Error('A família ou permissão mudou. Consulte novamente.');
    if(!root.confirm(label+' na família “'+family.name+'”?'))return;
    await operation(signal);guard();clearAccess();status('Acesso ou convite atualizado. Consulte a lista novamente para conferir. As cópias já salvas nos aparelhos permanecem locais.');
   });panel.append(button);
  };
  for(const member of members){
   const panel=document.createElement('section'),description=document.createElement('p');
   description.textContent=member.email+' — '+({owner:'Responsável',member:'Consulta e edição',viewer:'Consulta'}[member.role]);panel.append(description);
   if(member.role!=='owner'){
    const role=member.role==='viewer'?'member':'viewer';
    addAction(panel,(role==='member'?'Permitir edição para ':'Permitir somente consulta para ')+member.email,signal=>api.memberRole(member.id,role,token,family.id,signal));
    addAction(panel,'Revogar acesso de '+member.email,signal=>api.memberRevoke(member.id,token,family.id,signal));
   }
   $('dataAccessList').append(panel);
  }
  for(const invite of invites){
   const panel=document.createElement('section'),description=document.createElement('p');
   const pending=!invite.used_at&&!invite.revoked_at&&Date.parse(invite.expires_at)>Date.now();
   description.textContent=invite.email+' — convite '+(invite.used_at?'aceito':invite.revoked_at?'cancelado':pending?'pendente':'expirado');panel.append(description);
   if(pending)addAction(panel,'Cancelar convite para '+invite.email,signal=>api.inviteRevoke(invite.id,token,family.id,signal));
   $('dataAccessList').append(panel);
  }
  status('Acessos e convites consultados. Códigos anteriores não são exibidos novamente.');
 });
 function clearReview(){$('dataAccountDifferences').replaceChildren();}
 $('dataAccountFamily').addEventListener('change',()=>{clearReview();clearAccess();update();});
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
