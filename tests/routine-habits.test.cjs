const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../js/routine-activities.js'), 'utf8');
const methods = source.slice(source.indexOf('const dayKey'), source.indexOf('const defaults'));
const {recurringSuggestion} = vm.runInNewContext(methods + '\n({recurringSuggestion})');
const coffee = {id: 'coffee', name: 'Tomar café', done: false};
const now = new Date(2026, 10, 18, 9, 0);
const completions = [
    {id: 'coffee', date: '2026-11-15', minute: 532},
    {id: 'coffee', date: '2026-11-16', minute: 540},
    {id: 'coffee', date: '2026-11-17', minute: 548}
];

test('sugere após três dias distintos próximos do horário, sem alterar a atividade', () => {
    const result = recurringSuggestion([coffee], completions, now, new Set());
    assert.equal(result.item, coffee);
    assert.equal(result.minute, 540);
    assert.equal(result.days, 3);
    assert.equal(coffee.done, false);
    assert.equal(recurringSuggestion([coffee], completions, new Date(2026, 10, 18, 11), new Set()), undefined);
});

test('ignora repetições no mesmo dia, atividade concluída ou dispensada e histórico antigo', () => {
    const duplicates = completions.map(entry => ({...entry, date: '2026-11-17'}));
    assert.equal(recurringSuggestion([coffee], duplicates, now, new Set()), undefined);
    assert.equal(recurringSuggestion([coffee], [...completions.slice(0, 2), {...completions[2], date: '2026-11-18'}], now, new Set()), undefined);
    assert.equal(recurringSuggestion([coffee], [...completions.slice(0, 2), {...completions[2], date: '2026-09-17'}], now, new Set()), undefined);
    assert.equal(recurringSuggestion([{...coffee, done: true}], completions, now, new Set()), undefined);
    assert.equal(recurringSuggestion([coffee], completions, now, new Set(['coffee'])), undefined);
});

test('sugestões vêm ligadas nos dados novos e antigos e respeitam a opção desligada', () => {
    const setup = source.slice(source.indexOf('const defaults'), source.indexOf('let period'));
    for (const [saved, expected] of [[null, true], [{items: []}, true], [{items: [], learnTimes: false}, false]]) {
        const setting = vm.runInNewContext(setup + '\nstate.learnTimes', {
            Date, KEY: 'bia-routine-sakura-v1', dayKey: () => '2026-11-18', localStorage: {getItem: () => JSON.stringify(saved)}
        });
        assert.equal(setting, expected);
    }
});
