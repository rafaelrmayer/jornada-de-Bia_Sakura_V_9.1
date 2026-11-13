const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../js/app.js'),'utf8');
function setup(saved){
  const attrs={};const writes=[];
  const ctx=vm.createContext({StorageService:{getItem:()=>saved,setItem:(...args)=>writes.push(args)},document:{getElementById:()=>null,documentElement:{setAttribute:(k,v)=>attrs[k]=v,removeAttribute:k=>delete attrs[k]}},updateThemeMeta(){},updateToggleStates(){}});
  vm.runInContext(source.slice(source.indexOf("        const themeColors ="),source.indexOf('        function updateThemeMeta()')),ctx);
  return {ctx,attrs,writes};
}
for(const [saved,expected] of [['green','blue'],['dark-green','dark-blue']]){
  test('migra '+saved+' preservando modo claro/escuro',()=>{const s=setup(saved);s.ctx.loadTheme();assert.equal(s.attrs['data-theme'],expected);assert.deepEqual(s.writes,[['theme',expected]]);});
}
test('restaura azul e alterna escuro sem perder paleta',()=>{const s=setup('blue');s.ctx.loadTheme();assert.equal(s.attrs['data-theme'],'blue');s.ctx.toggleTheme();assert.equal(s.attrs['data-theme'],'dark-blue');s.ctx.toggleTheme();assert.equal(s.attrs['data-theme'],'blue');});
test('rosa continua sendo a paleta padrão',()=>{const s=setup('light');s.ctx.loadTheme();assert.equal(s.attrs['data-theme'],undefined);s.ctx.toggleTheme();assert.equal(s.attrs['data-theme'],'dark');});
