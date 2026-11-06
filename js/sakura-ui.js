/* Sakura V3: teclado PIN acessível. Não armazena PIN; utiliza verificação já existente. */
(() => {
  'use strict';
  window.sakuraPinDialog = (message) => new Promise(resolve => {
    const previous = document.activeElement;
    const overlay = document.createElement('div'); overlay.className='sakura-pin-overlay';
    const dialog = document.createElement('section');dialog.className='sakura-pin-dialog';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','sakura-pin-title');
    const title=document.createElement('h2');title.id='sakura-pin-title';title.textContent=message;
    const hint=document.createElement('p');hint.textContent='Use quatro números. Você também pode digitar pelo teclado.';
    const field=document.createElement('input');field.type='password';field.inputMode='numeric';field.autocomplete='off';field.maxLength=4;field.pattern='[0-9]{4}';field.setAttribute('aria-label','PIN de quatro dígitos');
    const grid=document.createElement('div');grid.className='sakura-pin-grid';
    let finished=false;
    function close(value){if(finished)return;finished=true;document.removeEventListener('keydown',keyTrap);overlay.remove();previous?.focus?.();resolve(value);}
    function keyTrap(e){if(e.key==='Escape'){e.preventDefault();close(null);}if(e.key==='Tab'){const controls=[...dialog.querySelectorAll('button,input')];const a=controls[0],z=controls[controls.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}}
    function btn(label,action){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',action);return b;}
    for(const n of ['1','2','3','4','5','6','7','8','9','Limpar','0','⌫'])grid.append(btn(n,()=>{if(n==='Limpar')field.value='';else if(n==='⌫')field.value=field.value.slice(0,-1);else if(field.value.length<4)field.value+=n;field.focus();}));
    const actions=document.createElement('div');actions.className='sakura-pin-actions';actions.append(btn('Cancelar',()=>close(null)),btn('Confirmar',()=>{if(/^\d{4}$/.test(field.value))close(field.value);else{hint.textContent='Digite exatamente quatro números.';field.focus();}}));
    field.addEventListener('input',()=>{field.value=field.value.replace(/\D/g,'').slice(0,4);});field.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(/^\d{4}$/.test(field.value))close(field.value);}});
    dialog.append(title,hint,field,grid,actions);overlay.append(dialog);document.body.append(overlay);document.addEventListener('keydown',keyTrap);field.focus();
  });
})();
