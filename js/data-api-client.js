/* Conexão explícita de cartões; credenciais só em memória, nenhuma chamada automática. */
(function(root){
 'use strict';
 const BASE='https://jornada-de-bia-data-api.onrender.com';
 const uuid=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
 function error(message,status=0){const e=new Error(message);e.status=status;return e;}
 function validateNewPassword(value){
  if(typeof value!=='string'||Array.from(value).length<6||Array.from(value).length>20||!(/\p{L}/u).test(value)||!(/[0-9]/).test(value))throw error('Use de 6 a 20 caracteres, com pelo menos uma letra e um número.',422);
 }
 function validateFamilies(rows){
  if(!Array.isArray(rows)||rows.some(r=>!uuid(r.id)||typeof r.name!=='string'||r.name.length>120||!['owner','member','viewer'].includes(r.role)))throw error('A API retornou famílias incompatíveis.');
  return rows;
 }
 function validateCatalog(rows){
  if(!Array.isArray(rows)||rows.some(r=>!uuid(r.id)||typeof r.name!=='string'))throw error('Catálogo incompatível.');
  return rows;
 }
 function validateCards(rows){
  if(!Array.isArray(rows)||rows.length>5000||rows.some(r=>!uuid(r.id)||!uuid(r.category_id)||typeof r.text!=='string'||!r.text.trim()||r.text.length>500))throw error('Cartões incompatíveis. Os dados locais foram preservados.');
  return rows;
 }
 const categoryKey=name=>String(name||'').normalize('NFC').trim().toLowerCase();
 function missingCategories(names,catalog){
  return [...new Set(names.filter(n=>typeof n==='string'&&n.trim()&&n.trim().length<=120).map(n=>n.normalize('NFC').trim()))]
   .filter((n,i,rows)=>rows.findIndex(x=>categoryKey(x)===categoryKey(n))===i&&!catalog.some(c=>categoryKey(c.name)===categoryKey(n)));
 }
 function validateHistory(page){
  const actions=['card.created','card.updated','card.archived','card.restored'];
  if(!page||!Array.isArray(page.events)||page.events.length>100||page.events.some((e,i,rows)=>
   !Number.isSafeInteger(e.id)||e.id<1||(i>0&&e.id>=rows[i-1].id)||!uuid(e.card_id)||
   (e.actor_id!==null&&!uuid(e.actor_id))||(e.actor_email!==null&&typeof e.actor_email!=='string')||
   !actions.includes(e.action)||typeof e.recorded_at!=='string'||!Number.isFinite(Date.parse(e.recorded_at))||
   (e.card_label!==null&&(typeof e.card_label!=='string'||e.card_label.length>500)))||
   (page.next_before_id!==null&&(!Number.isSafeInteger(page.next_before_id)||page.next_before_id<1||
    !page.events.length||page.next_before_id!==page.events[page.events.length-1].id)))throw error('Histórico incompatível. Consulte novamente.');
  return page;
 }
 function createClient(fetcher=root.fetch.bind(root)){
  async function request(path,{method='GET',body,token,family,signal}={}){
   const controller=new AbortController(),abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
   const timer=setTimeout(abort,15000);
   try{
    const response=await fetcher(BASE+path,{method,credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:controller.signal,
     headers:{Accept:'application/json',...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{}),...(family?{'X-Family-ID':family}:{})},
     ...(body?{body:JSON.stringify(body)}:{})});
    if(!response.ok){const messages={401:'Sessão inválida ou expirada. Entre novamente.',403:'Sua permissão não permite esta ação. Atualize as famílias e permissões para conferir o acesso.',409:'O registro já existe com outros dados. Nenhuma alteração foi sobrescrita.',422:'Confira os campos informados.',404:'A API ainda precisa ser atualizada para conectar o aplicativo.'};throw error(messages[response.status]||'O servidor está indisponível. Seus dados continuam neste aparelho.',response.status);}
    return response.status===204?null:await response.json();
   }catch(e){if(e.status)throw e;if(controller.signal.aborted)throw error('Operação interrompida ou sem resposta. Os dados locais foram preservados.');throw error('Não foi possível conectar. Confira a internet e tente novamente.');}
   finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
  }
  async function compatible(signal){const schema=await request('/openapi.json',{signal});if(!schema.paths?.['/v1/auth/families']||!schema.components?.schemas?.CardCreate?.properties?.client_id)throw error('Aguarde a atualização da Data API antes de conectar esta versão do aplicativo.');}
  return {request,compatible,
   async capabilities(token,signal){const value=await request('/v1/auth/capabilities',{token,signal});if(typeof value?.manage_experiments!=='boolean')throw error('Permissão de laboratório indisponível.');return value;},
   async googleConfig(signal){const data=await request('/v1/auth/google/config',{signal});if(data?.enabled!==true||typeof data.client_id!=='string'||!(/^[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/).test(data.client_id))throw error('O acesso com Google ainda está sendo configurado. Use o app sem conta por enquanto.');return data;},
   async googleChallenge(signal){const data=await request('/v1/auth/google/challenge',{method:'POST',signal});if(typeof data?.challenge!=='string'||typeof data.nonce!=='string'||data.nonce.length!==43||data.expires_in!==300)throw error('Não foi possível preparar o acesso Google.');return data;},
   async googleLogin(credential,challenge,signal){try{const data=await request('/v1/auth/google/login',{method:'POST',body:{credential,challenge},signal});if(typeof data?.access_token!=='string'||typeof data.email!=='string'||!Number.isFinite(data.expires_in)||data.expires_in<=0)throw error('Resposta de conexão incompatível.');return data;}catch(e){if(e.status===409)throw error('Sua conta precisa de vinculação no servidor. Suas frases continuam preservadas.',409);throw e;}},
   async compatibleHistory(signal){const schema=await request('/openapi.json',{signal});if(!schema.paths?.['/v1/card-history'])throw error('Aguarde a atualização da API para consultar o histórico.');},
   async history(token,family,before,signal){if(before!==null&&before!==undefined&&(!Number.isSafeInteger(before)||before<1))throw error('Página de histórico inválida.');const page=validateHistory(await request('/v1/card-history'+(before?'?before_id='+encodeURIComponent(before):''),{token,family,signal}));if(before&&page.events.some(e=>e.id>=before))throw error('Página de histórico incompatível. Consulte novamente.');return page;},
   async compatibleAccess(signal){const schema=await request('/openapi.json',{signal});if(!schema.paths?.['/v1/family-invitations/accept']||!schema.paths?.['/v1/family-members'])throw error('Aguarde a atualização da API para usar convites e permissões.');},
   async members(token,family,signal){const rows=await request('/v1/family-members',{token,family,signal});if(!Array.isArray(rows)||rows.some(r=>!uuid(r.id)||!uuid(r.user_id)||typeof r.email!=='string'||!['owner','member','viewer'].includes(r.role)))throw error('Lista de acessos incompatível.');return rows;},
   async invitations(token,family,signal){const rows=await request('/v1/family-invitations',{token,family,signal});if(!Array.isArray(rows)||rows.some(r=>!uuid(r.id)||typeof r.email!=='string'||!['member','viewer'].includes(r.role)))throw error('Lista de convites incompatível.');return rows;},
   async inviteCreate(email,role,token,family,signal){const row=await request('/v1/family-invitations',{method:'POST',body:{email,role},token,family,signal});if(!uuid(row.id)||typeof row.code!=='string'||!(/^[A-Za-z0-9_-]{43}$/).test(row.code))throw error('Resposta de convite incompatível. Consulte os convites antes de tentar novamente.');return row;},
   async inviteAccept(code,token,signal){try{const row=await request('/v1/family-invitations/accept',{method:'POST',body:{code},token,signal});validateFamilies([row]);return row;}catch(e){if(e.status===400)throw error('Convite inválido, expirado, cancelado ou destinado a outra conta.',400);if(!e.status)throw error('Não foi possível confirmar a aceitação. Use Atualizar famílias e permissões para conferir antes de tentar novamente.');throw e;}},
   inviteRevoke:(id,token,family,signal)=>request('/v1/family-invitations/'+id,{method:'DELETE',token,family,signal}),
   memberRole:(id,role,token,family,signal)=>request('/v1/family-members/'+id,{method:'PATCH',body:{role},token,family,signal}),
   memberRevoke:(id,token,family,signal)=>request('/v1/family-members/'+id,{method:'DELETE',token,family,signal}),
   async recoveryStatus(signal){const result=await request('/v1/auth/password-recovery/status',{signal});return result?.enabled===true;},
   async recoveryRequest(email,signal){
    try{return await request('/v1/auth/password-recovery/request',{method:'POST',body:{email},signal});}
    catch(e){if(e.status===503)throw error('Recuperação por e-mail ainda não disponível.',503);throw e;}
   },
   async recoveryConfirm(email,code,new_password,signal){
    validateNewPassword(new_password);
    try{return await request('/v1/auth/password-recovery/confirm',{method:'POST',body:{email,code,new_password},signal});}
    catch(e){const messages={400:'Código inválido, expirado ou já utilizado. Solicite outro código.',422:'Confira o e-mail e use uma nova senha diferente da anterior, com 6 a 20 caracteres, incluindo letra e número.',503:'Recuperação por e-mail ainda não disponível.'};if(messages[e.status])throw error(messages[e.status],e.status);throw e;}
   },
   async compatiblePassword(signal){const schema=await request('/openapi.json',{signal});if(!schema.paths?.['/v1/auth/change-password'])throw error('Aguarde a atualização da Data API para alterar a senha.');},
   async changePassword(current_password,new_password,token,signal){
    validateNewPassword(new_password);
    try{return await request('/v1/auth/change-password',{method:'POST',body:{current_password,new_password},token,signal});}
    catch(e){if(e.status===400)throw error('A senha atual não confere.',400);if(e.status===422)throw error('Use uma nova senha diferente da atual, com 6 a 20 caracteres, incluindo letra e número.',422);throw e;}
   },
   async compatibleTrash(signal){const schema=await request('/openapi.json',{signal});if(!schema.paths?.['/v1/card-trash']||!schema.paths?.['/v1/cards/{card_id}/archive']||!schema.paths?.['/v1/cards/{card_id}/restore'])throw error('Aguarde a atualização da Data API para usar a lixeira.');},
   async trash(token,family,signal){return validateCards(await request('/v1/card-trash',{token,family,signal}));},
   async changeTrash(card,restore,token,family,signal){
    if(!card.updated_at)throw error('Versão do cartão indisponível. Consulte novamente.');
    const result=await request('/v1/cards/'+card.id+(restore?'/restore':'/archive'),{method:'POST',body:{expected_updated_at:card.updated_at},token,family,signal});
    validateCards([result]);return result;
   },
   async compatibleCategories(signal){const schema=await request('/openapi.json',{signal});if(!schema.paths?.['/v1/family-categories'])throw error('Aguarde a atualização da Data API para enviar categorias.');},
   async createCategory(name,token,family,signal){const row=await request('/v1/family-categories',{method:'POST',body:{name},token,family,signal});validateCatalog([row]);return row;},
   async compatibleEdits(signal){const schema=await request('/openapi.json',{signal});if(!schema.components?.schemas?.CardUpdate?.properties?.expected_updated_at)throw error('Aguarde a atualização da Data API para revisar edições.');},
   async edit(card,body,token,family,signal){if(!card.updated_at)throw error('Versão do cartão indisponível. Consulte novamente.');const result=await request('/v1/cards/'+card.id,{method:'PATCH',body:{...body,expected_updated_at:card.updated_at},token,family,signal});validateCards([result]);return result;},
   async login(email,password,signal){const value=await request('/v1/auth/login',{method:'POST',body:{email,password},signal});if(typeof value.access_token!=='string'||!Number.isFinite(value.expires_in)||value.expires_in<=0)throw error('Resposta de login incompatível.');return value;},
   register:async(email,password,family_name,signal)=>{validateNewPassword(password);return request('/v1/auth/register',{method:'POST',body:{email,password,family_name},signal});},
   async families(token,signal){return validateFamilies(await request('/v1/auth/families',{token,signal}));},
   async catalog(token,family,signal){return validateCatalog(await request('/v1/categories',{token,family,signal}));},
   async cards(token,family,signal){return validateCards(await request('/v1/cards',{token,family,signal}));},
   async upload(body,token,family,signal){const card=await request('/v1/cards',{method:'POST',body,token,family,signal});validateCards([card]);return card;}
  };
 }
 function planUpload(phrases,catalog,remote,family){
  const planned=[],counts={existing:0,changed:0,unsupported:0};
  for(const p of phrases){
   if(typeof p.text!=='string'||!p.text.trim()||p.text.length>500){counts.unsupported++;continue;}
   const category=catalog.find(c=>categoryKey(c.name)===categoryKey(p.category||'Geral'));
   if(!category){counts.unsupported++;continue;}
   const source=(p.cloudSources||[]).find(s=>s.family===family);
   if(source){const saved=remote.find(c=>c.id===source.id);counts[saved&&saved.text===p.text&&saved.category_id===category.id?'existing':'changed']++;continue;}
   const previous=p.cloudIds?.[family],byClient=previous&&remote.find(c=>c.client_id===previous);
   if(byClient){counts[byClient.text===p.text&&byClient.category_id===category.id?'existing':'changed']++;continue;}
   if(remote.some(c=>c.text===p.text&&c.category_id===category.id)){counts.existing++;continue;}
   planned.push({id:p.id,text:p.text,category:p.category||'Geral',category_id:category.id});
  }
  return {planned,counts};
 }
 function planEdits(phrases,catalog,remote,family){
  const differences=[];
  for(const phrase of phrases){
   const source=(phrase.cloudSources||[]).find(s=>s.family===family);
   const card=source?remote.find(c=>c.id===source.id):remote.find(c=>c.client_id&&c.client_id===phrase.cloudIds?.[family]);
   if(!card)continue;
   const category=catalog.find(c=>c.id===card.category_id)?.name;
   const localCategory=catalog.find(c=>categoryKey(c.name)===categoryKey(phrase.category||'Geral'));
   if(category&&(phrase.text!==card.text||categoryKey(phrase.category||'Geral')!==categoryKey(category)))
    differences.push({phrase,card,category,localCategory});
  }
  return differences;
 }
 const canWrite=family=>!!family&&['owner','member'].includes(family.role);
 const api={BASE,validateNewPassword,canWrite,validateHistory,uuid,createClient,validateFamilies,validateCatalog,validateCards,planUpload,planEdits,missingCategories};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.JBDataAPI=api;
})(typeof window==='undefined'?globalThis:window);
