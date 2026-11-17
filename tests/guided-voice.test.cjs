const {test}=require('node:test'),assert=require('node:assert/strict');
const m=require('../js/guided-voice.js');
test('voz guiada é opcional e configurações inválidas não habilitam anúncios',()=>{
 assert.deepEqual(m.normalize(null),{enabled:false,focus:false,rate:0.9,volume:0.8,voice:''});
 assert.equal(m.normalize({enabled:'true',focus:1}).enabled,false);
 assert.equal(m.normalize({rate:Infinity,volume:NaN,voice:'a'.repeat(201)}).voice,'');
 const settings=m.normalize({enabled:true,focus:true,rate:10,volume:-1,phrase:'não persistir'});
 assert.deepEqual(settings,{enabled:true,focus:true,rate:1.5,volume:0,voice:''});
});
test('prévia aceita somente vozes identificadas como locais pelo navegador',()=>{
 const remote={voiceURI:'remote',lang:'pt-BR',localService:false},unknown={voiceURI:'unknown',lang:'pt-BR'};
 const english={voiceURI:'local-en',lang:'en-US',localService:true},portuguese={voiceURI:'local-br',lang:'pt-BR',localService:true};
 assert.deepEqual(m.localVoices([remote,unknown,english,portuguese]),[english,portuguese]);
 assert.equal(m.chooseVoice([remote,english,portuguese],'remote'),portuguese);
 assert.equal(m.chooseVoice([remote],''),null);
 assert.equal(m.chooseVoice([english,portuguese],'local-en'),english);
});
