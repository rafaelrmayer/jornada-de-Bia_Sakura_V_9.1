/* Google é carregado somente por ação explícita, sem One Tap ou login automático. */
(function(root){
 'use strict';
 let loading=null;
 function load(){
  if(root.google?.accounts?.id)return Promise.resolve();
  if(loading)return loading;
  loading=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.referrerPolicy='strict-origin-when-cross-origin';
   const timer=setTimeout(()=>fail(),15000);
   function fail(){clearTimeout(timer);script.remove();loading=null;reject(Error('Não foi possível carregar o Google. Confira a internet e tente novamente.'));}
   script.onerror=fail;script.onload=()=>{clearTimeout(timer);if(root.google?.accounts?.id)resolve();else fail();};document.head.append(script);
  });return loading;
 }
 root.JBGoogleAccess={
  async render(container,clientId,nonce,callback,isCurrent=()=>true){
   await load();if(!container.isConnected||!isCurrent())return;
   root.google.accounts.id.initialize({client_id:clientId,nonce,auto_select:false,button_auto_select:false,ux_mode:'popup',callback:response=>{if(typeof response?.credential==='string'&&response.credential.length<=8192)callback(response.credential);}});
   root.google.accounts.id.renderButton(container,{type:'standard',theme:'outline',size:'large',text:'continue_with',locale:'pt-BR',width:Math.min(container.clientWidth||280,320)});
  },
  cancel(){root.google?.accounts?.id?.cancel();root.google?.accounts?.id?.disableAutoSelect();}
 };
})(window);
