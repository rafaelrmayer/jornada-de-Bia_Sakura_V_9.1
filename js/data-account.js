/* Interface administrativa: enviar/importar é sempre uma escolha explícita. */
(function(root){
 'use strict';
 const $=id=>document.getElementById(id),api=root.JBDataAPI.createClient();if(!$('dataAccountForm'))return;
 let session=null,job=null,generation=0,expiry=null;
 const allowed=()=>!!root.SecurityService?.isUnlocked?.();
 const status=text=>$('dataAccountStatus').textContent=text;
 function update(){
  const unlocked=allowed();$('dataAccountUnlock').hidden=unlocked;$('dataAccountControls').hidden=!unlocked;
  $('dataAccountForm').hidden=!!session;$('dataAccountConnected').hidden=!session;
  $('dataAuthFields').disabled=!!job;
  for(const id of ['dataAccountUpload','dataAccountImport','dataAccountFamily'])$(id).disabled=!!job;
 }
 function logout(message='Conta desconectada. As frases deste aparelho foram preservadas.'){
  generation++;job?.abort();job=null;session=null;clearTimeout(expiry);expiry=null;
  $('dataAccountPassword').value='';$('dataAccountEmail').value='';$('dataFamilyName').value='';$('dataAccountFamily').replaceChildren();
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
   session={token:auth.access_token,families,expiresAt:Date.now()+Math.min(auth.expires_in,900)*1000};
   $('dataAccountFamily').replaceChildren();for(const f of families){const option=document.createElement('option');option.value=f.id;option.textContent=f.name;$('dataAccountFamily').append(option);}
   clearTimeout(expiry);expiry=setTimeout(()=>logout('Sua sessão online expirou. Entre novamente.'),Math.min(auth.expires_in,900)*1000);
   $('dataAccountPassword').value='';status('Conta conectada. Escolha enviar novas frases ou importar cartões. Nenhuma frase foi transferida automaticamente.');
  }).finally(()=>{$('dataAccountPassword').value='';});
 };
 $('dataAccountUpload').onclick=()=>run(async(signal,guard)=>{
  const family=active(),token=session.token;status('Conferindo categorias e cartões da família…');
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
 $('dataAccountImport').onclick=()=>run(async(signal,guard)=>{
  const family=active(),token=session.token;status('Consultando cartões da família…');
  const catalog=await api.catalog(token,family.id,signal);guard();const cards=await api.cards(token,family.id,signal);guard();
  if(!cards.length){status('Ainda não há cartões nessa família. As frases locais foram preservadas.');return;}
  if(!root.confirm('Importar novos cartões da família “'+family.name+'” para Minha Comunicação? As frases existentes serão preservadas.')){status('Importação cancelada.');return;}
  guard();active();const result=root.JBCommunication.importCloudCards(cards,catalog,family.id);
  status(result.added+' novo(s) cartão(ões) importado(s). '+result.existing+' já presente(s), preservado(s) sem sobrescrita. Você pode usá-los offline em Minha Comunicação.');
 });
 document.addEventListener('bia:admin-access-changed',()=>{if(!allowed())logout('Administração bloqueada. Entre novamente quando desbloquear.');else update();});
 document.addEventListener('jornadaBia:sessionExpired',()=>logout('Administração expirada. Desbloqueie para conectar novamente.'));
 root.addEventListener('pagehide',()=>logout('Conta desconectada.'));
 update();
})(window);
