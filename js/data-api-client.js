/* Conexão explícita de cartões; credenciais só em memória, nenhuma chamada automática. */
(function(root){
 'use strict';
 const BASE='https://jornada-de-bia-data-api.onrender.com';
 const uuid=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
 function error(message,status=0){const e=new Error(message);e.status=status;return e;}
 function validateFamilies(rows){
  if(!Array.isArray(rows)||rows.some(r=>!uuid(r.id)||typeof r.name!=='string'||r.name.length>120))throw error('A API retornou famílias incompatíveis.');
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
 function createClient(fetcher=root.fetch.bind(root)){
  async function request(path,{method='GET',body,token,family,signal}={}){
   const controller=new AbortController(),abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
   const timer=setTimeout(abort,15000);
   try{
    const response=await fetcher(BASE+path,{method,credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:controller.signal,
     headers:{Accept:'application/json',...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{}),...(family?{'X-Family-ID':family}:{})},
     ...(body?{body:JSON.stringify(body)}:{})});
    if(!response.ok){const messages={401:'Sessão inválida ou expirada. Entre novamente.',403:'Esta conta não tem acesso à família selecionada.',409:'O registro já existe com outros dados. Nenhuma alteração foi sobrescrita.',422:'Confira os campos informados.',404:'A API ainda precisa ser atualizada para conectar o aplicativo.'};throw error(messages[response.status]||'O servidor está indisponível. Seus dados continuam neste aparelho.',response.status);}
    return await response.json();
   }catch(e){if(e.status)throw e;if(controller.signal.aborted)throw error('Operação interrompida ou sem resposta. Os dados locais foram preservados.');throw error('Não foi possível conectar. Confira a internet e tente novamente.');}
   finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
  }
  async function compatible(signal){const schema=await request('/openapi.json',{signal});if(!schema.paths?.['/v1/auth/families']||!schema.components?.schemas?.CardCreate?.properties?.client_id)throw error('Aguarde a atualização da Data API antes de conectar esta versão do aplicativo.');}
  return {request,compatible,
   async compatiblePassword(signal){const schema=await request('/openapi.json',{signal});if(!schema.paths?.['/v1/auth/change-password'])throw error('Aguarde a atualização da Data API para alterar a senha.');},
   async changePassword(current_password,new_password,token,signal){
    try{return await request('/v1/auth/change-password',{method:'POST',body:{current_password,new_password},token,signal});}
    catch(e){if(e.status===400)throw error('A senha atual não confere.',400);if(e.status===422)throw error('Use uma nova senha diferente da atual, com 12 a 128 caracteres.',422);throw e;}
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
   register:(email,password,family_name,signal)=>request('/v1/auth/register',{method:'POST',body:{email,password,family_name},signal}),
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
 const api={BASE,uuid,createClient,validateFamilies,validateCatalog,validateCards,planUpload,planEdits,missingCategories};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.JBDataAPI=api;
})(typeof window==='undefined'?globalThis:window);
