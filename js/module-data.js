/* Dados adicionais de módulos. Lista explícita, sem PIN ou sessão administrativa. */
(function(global){
  'use strict';
  const keys=Object.freeze([
    'bia-routine-sakura-v1','jornadaBiaEmotionHistoryV1','bia-experience-v1',
    'bia_sakura_activity_habits_v92','bia_sakura_activity_preferences_v92',
    'bia-a11y-v929-Large','bia-a11y-v929-Contrast','bia-a11y-v929-Touch','bia-a11y-v929-Calm','bia-a11y-v929-Confirm',
    'bia-card-api-url','bia-card-suggestion-mode','jornadaBia:rfEvaluationData','selectedVoice'
  ]);
  function validate(data){
    if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Dados adicionais inválidos');
    for(const [key,value] of Object.entries(data)){
      if(!keys.includes(key)||typeof value!=='string'||value.length>200000)throw new Error('Campo adicional inválido');
    }
    return true;
  }
  function snapshot(storage){
    const data={};for(const key of keys){const value=storage.getItem(key);if(value!==null)data[key]=value;}
    validate(data);return data;
  }
  function restore(storage,data){validate(data);for(const [key,value] of Object.entries(data))storage.setItem(key,value);}
  global.JornadaModuleData={keys,snapshot,validate,restore};
})(window);
