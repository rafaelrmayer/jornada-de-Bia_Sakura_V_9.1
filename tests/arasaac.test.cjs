const {test}=require('node:test'),assert=require('node:assert/strict');
const {imageUrl,normalize,validPicture,search,download}=require('../js/arasaac.js');
test('catálogo limitado, IDs únicos e URLs de origem fixa',()=>{
 assert.equal(normalize([{_id:2276,keywords:[{keyword:'água'}]},{_id:2276},{_id:'123'},...Array.from({length:20},(_,i)=>({_id:5000+i}))]).length,12);
 assert.equal(imageUrl(2276),'https://static.arasaac.org/pictograms/2276/2276_300.png');
 for(const id of [0,-1,'2276',Infinity,10000000])assert.throws(()=>imageUrl(id));
 assert.equal(validPicture({id:2276,image:'javascript:alert(1)'}),null);
});
test('busca explícita envia só o termo, sem credenciais e respeita erros',async()=>{
 let captured;await search('água',undefined,async(url,options)=>{captured={url,options};return {ok:true,json:async()=>[]}});
 assert.ok(captured.url.endsWith('%C3%A1gua'));assert.equal(captured.options.credentials,'omit');assert.equal(captured.options.referrerPolicy,'no-referrer');
 assert.deepEqual(await search('água',undefined,async()=>({status:404})),[]);
 await assert.rejects(search('a',undefined));await assert.rejects(search('água',undefined,async()=>({ok:false})));
});
test('imagem exige PNG, tamanho limitado e assinatura, com cópia local validada',async()=>{
 const png=Uint8Array.from([137,80,78,71,13,10,26,10,0,0,0]);
 const response=(type,bytes)=>({ok:true,headers:new Headers({'content-type':type}),arrayBuffer:async()=>bytes.buffer});
 const value=await download(2276,undefined,async()=>response('image/png',png));assert.ok(validPicture(value));assert.match(value.image,/^data:image\/png;base64,/);assert.equal(validPicture(value).author,'Sergio Palao');
 await assert.rejects(download(2276,undefined,async()=>response('image/svg+xml',png)));
 await assert.rejects(download(2276,undefined,async()=>response('image/png',new Uint8Array(200000))));
 await assert.rejects(download(2276,undefined,async()=>response('image/png',new Uint8Array(10))));
});
