const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const app = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
const playback = app.slice(app.indexOf('        function stopCurrentSpeech()'), app.indexOf('        function clearMessage()'));
const deferred = () => { let resolve; const promise = new Promise(r => {resolve = r;}); return {promise, resolve}; };

function setup({webAudio = true, decodeGate = null} = {}) {
  let gesture = true;
  const response = deferred();
  const calls = {resume:0, sources:[], spoken:[], timers:[], htmlPlay:0, fetch:0};
  const synthesis = {
    cancel() {}, resume() {calls.resume++;}, getVoices: () => [],
    speak(utterance) {assert.equal(gesture, true, 'voz local iniciada no gesto'); calls.spoken.push(utterance);}
  };
  class MockContext {
    constructor() {this.state = 'suspended'; this.destination = {};}
    resume() {assert.equal(gesture, true, 'contexto ativado antes da rede'); calls.resume++; this.state = 'running'; return Promise.resolve();}
    async decodeAudioData() {if (decodeGate) await decodeGate.promise; return {};}
    createBufferSource() {
      const source = {connect() {}, disconnect() {}, start() {source.started = true;}, stop() {source.stopped = true;}};
      calls.sources.push(source); return source;
    }
  }
  const notice = {};
  const context = vm.createContext({
    window: {AudioContext: webAudio ? MockContext : undefined, speechSynthesis:synthesis,
      setTimeout(fn, ms) {calls.timers.push(ms); return setTimeout(fn, ms);}, clearTimeout},
    document: {getElementById: () => notice}, voiceQualityText: {},
    voiceSelect: {value: 'edge-francisca'},
    getSelectedVoice: () => null, getBestVoice: () => null,
    SpeechSynthesisUtterance: class {constructor(text) {this.text = text;}},
    Audio: class {addEventListener() {} play() {calls.htmlPlay++; return Promise.resolve();}},
    URL: {createObjectURL: () => 'blob:test', revokeObjectURL() {}},
    AbortController, console: {warn() {}}, alert() {},
    fetch() {calls.fetch++; return response.promise;}
  });
  vm.runInContext(`let speechSequence=0, activeEdgeAudio=null, activeEdgeObjectUrl=null,
    edgeSpeechRequest=null, speechAudioContext=null, activeEdgeSource=null,
    activeBrowserUtterance=null, speechSynthesisEnabled=true, voiceRate=.92, voicePitch=1;
    const edgeAudioCache=new Map(), EDGE_AUDIO_CACHE_LIMIT=16, EDGE_TTS_URL='https://example.test/tts';
    ${playback}
    globalThis.api={speakWithEdgeTTS,speakWithBrowser,stopCurrentSpeech,speakText};`, context);
  return {
    api:context.api, calls, notice,
    endGesture() {gesture = false;},
    respond(ok = true) {response.resolve({ok,status:503,blob:async () => ({size:4,arrayBuffer:async () => new ArrayBuffer(4)})});}
  };
}

test('Francisca ativa o contexto no primeiro toque e toca após a rede', async () => {
  const app = setup();
  const pending = app.api.speakWithEdgeTTS('Eu estou aqui');
  assert.equal(app.calls.resume, 1);
  app.endGesture(); app.respond(); await pending;
  assert.equal(app.calls.sources.length, 1);
  assert.equal(app.calls.sources[0].started, true);
  assert.equal(app.calls.htmlPlay, 0);
  assert.equal(app.calls.spoken.length, 0);
});
test('voz do aparelho é chamada imediatamente mesmo com lista vazia', () => {
  const app = setup(); app.api.speakWithBrowser('Quero água');
  assert.equal(app.calls.spoken[0].text, 'Quero água');
  assert.equal(app.calls.spoken[0].lang, 'pt-BR');
  assert.equal(app.calls.resume, 1);
  assert.deepEqual(app.calls.timers, []);
});
test('cancelar durante a resposta impede reprodução atrasada', async () => {
  const app = setup();
  const pending = app.api.speakWithEdgeTTS('Antiga');
  app.api.stopCurrentSpeech(); app.respond(); await pending;
  assert.equal(app.calls.sources.length, 0);
  assert.equal(app.calls.spoken.length, 0);
});
test('cancelar durante decodificação também impede reprodução atrasada', async () => {
  const gate = deferred(); const app = setup({decodeGate:gate});
  const pending = app.api.speakWithEdgeTTS('Antiga'); app.respond();
  await new Promise(resolve => setImmediate(resolve));
  app.api.stopCurrentSpeech(); gate.resolve(); await pending;
  assert.equal(app.calls.sources.length, 0);
});
test('novo pedido interrompe o áudio anterior e reutiliza a frase em cache', async () => {
  const app = setup();
  const first = app.api.speakWithEdgeTTS('Quero'); app.respond(); await first;
  await app.api.speakWithEdgeTTS('Quero');
  assert.equal(app.calls.fetch, 1);
  assert.equal(app.calls.sources[0].stopped, true);
  assert.equal(app.calls.sources[1].started, true);
});
test('falha do serviço encaminha a frase à voz do aparelho', async () => {
  const app = setup(); const pending = app.api.speakWithEdgeTTS('Ajuda');
  app.respond(false); await pending;
  assert.equal(app.calls.spoken[0].text, 'Ajuda');
  assert.equal(app.notice.hidden, false);
});
test('mantém reprodução compatível quando Web Audio não existe', async () => {
  const app = setup({webAudio:false}); const pending = app.api.speakWithEdgeTTS('Olá');
  app.respond(); await pending;
  assert.equal(app.calls.htmlPlay, 1);
});
