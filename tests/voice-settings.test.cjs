const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../js/app.js'), 'utf8');

function setup(saved, available) {
  let voices = available;
  const select = {
    value: 'default', options: [],
    set innerHTML(value) { this.options = [{value: 'default'}, {value: 'edge-francisca'}]; this.value = 'default'; },
    appendChild(option) { this.options.push(option); }
  };
  const writes = [];
  const context = vm.createContext({
    voiceSelect: select, currentVoice: null,
    StorageService: {getItem: () => saved, setItem: (...args) => writes.push(args)},
    window: {speechSynthesis: {getVoices: () => voices}},
    document: {createElement: () => ({})},
    updateVoiceQuality() {}
  });
  vm.runInContext(source.slice(source.indexOf('        function voiceScore('), source.indexOf('        function getSelectedVoice(')), context);
  return {select, writes, load: () => context.loadVoices(), setVoices: value => {voices = value;}};
}
const localVoice = {name: 'Português do aparelho', lang: 'pt-BR'};

test('restaura a voz local na primeira carga e nas atualizações', () => {
  const app = setup(localVoice.name, [localVoice]);
  app.load(); assert.equal(app.select.value, localVoice.name);
  app.load(); assert.equal(app.select.value, localVoice.name);
  assert.deepEqual(app.writes, []);
});
test('preserva a preferência enquanto as vozes ainda estão carregando', () => {
  const app = setup(localVoice.name, []);
  app.load(); assert.equal(app.select.value, 'default');
  app.setVoices([localVoice]); app.load();
  assert.equal(app.select.value, localVoice.name);
  assert.deepEqual(app.writes, []);
});
test('respeita a seleção automática do navegador', () => {
  const app = setup('default', [localVoice]);
  app.load(); assert.equal(app.select.value, 'default');
});
test('mantém Francisca como preferência inicial e quando escolhida', () => {
  for (const saved of [null, 'edge-francisca']) {
    const app = setup(saved, [localVoice]);
    app.load(); assert.equal(app.select.value, 'edge-francisca');
  }
});
