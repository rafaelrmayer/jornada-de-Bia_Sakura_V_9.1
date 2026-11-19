const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function setup(){const ctx=vm.createContext({window:{},crypto:require('node:crypto').webcrypto,TextEncoder,TextDecoder,btoa,atob});vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/backup-crypto.js'),'utf8'),ctx);return ctx.window.BackupCrypto;}
test('backup grande com Unicode faz ida e volta sem exceder limite de argumentos',async()=>{
 const service=setup(),payload={text:'Comunicação 🌸 '.repeat(35000)},encrypted=await service.encrypt(payload,'senha-teste-grande');
 assert.ok(encrypted.ciphertext.length>500000);
 const restored=await service.decrypt(encrypted,'senha-teste-grande');assert.equal(restored.text,payload.text);
 await assert.rejects(service.decrypt(encrypted,'outra-senha'));
});
