const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const app = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
const start = app.indexOf('        class PhraseGenerator {');
const end = app.indexOf('        // ============================================', start);
const generator = vm.runInNewContext(app.slice(start, end) + '\nnew PhraseGenerator()');
const compose = (...labels) => generator.generatePhrase(labels.map(label => ({label, emoji: '🔹'})))?.text;

test('a frase preserva quantidade, recusa e urgência nos símbolos escolhidos', () => {
    assert.equal(compose('Beber água', 'Mais'), 'Quero mais água.');
    assert.equal(compose('Mais', 'Beber água'), 'Quero mais água.');
    assert.equal(compose('Não', 'Suco'), 'Não quero suco.');
    assert.equal(compose('Brincar', 'Agora'), 'Quero brincar agora.');
    assert.equal(compose('Ajuda', 'Agora'), 'Preciso de ajuda agora.');
    assert.equal(compose('Não', 'Beber água', 'Mais', 'Agora'), 'Não quero mais água agora.');
});

test('pranchas antigas e rótulos pessoais continuam utilizáveis no construtor', () => {
    assert.equal(compose('Beber água'), 'Eu quero água.');
    assert.equal(compose('Comer', 'Pizza'), 'Eu quero comer Pizza.');
    assert.equal(compose('Dor', 'Cabeça'), 'Estou com dor em Cabeça.');
    assert.equal(compose('Tails', 'Meu brinquedo'), 'Tails Meu brinquedo');
    assert.equal(compose('Trabalho não terminado'), 'Trabalho não terminado');
    assert.equal(compose('Água', 'Tails', 'Agora'), 'Água Tails Agora.');
    assert.equal(compose(), undefined);
});

test('sequência explícita Eu, Quero e água mantém os três cartões e a frase',()=>{
 assert.equal(compose('Eu','Quero','Beber água'),'Eu quero água.');
 assert.equal(compose('Eu','Não','Quero','Beber água'),'Eu não quero água.');
 assert.equal(compose('Eu','Quero','Mais','Beber água'),'Eu quero mais água.');
 assert.equal(compose('Eu'),'Eu');
});
