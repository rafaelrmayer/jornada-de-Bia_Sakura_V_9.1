/* Jornada de Bia v31.1 - versioned backup and validation */
(() => {
  const BACKUP_VERSION = 4;
  const MAX_BYTES = 5 * 1024 * 1024;
  const HEALTH_BACKUP_VERSION = 1;
  const MAX_HEALTH_DATA_BYTES = 64 * 1024;
  const MAX_HEALTH_FILE_BYTES = 128 * 1024;
  const HEALTH_TEXT_FIELDS = ['healthPlan','supportLevel','observations','signal','gesture','meaning','sensoryBothers','sensoryHelps','care','updatedAt'];
  const SENSORY_FLAGS = ['sound','light','touch','smells','crowds','fabrics'];
  const CONFIG_KEYS = new Set(['symbolsData','voiceRate','voicePitch','autoSpeak','theme']);

  async function digest(text) {
    const data = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(x=>x.toString(16).padStart(2,'0')).join('');
  }
  function download(text, filename) {
    const blob = new Blob([text], {type:'application/json'});
    const url = URL.createObjectURL(blob); const a=document.createElement('a');
    a.href=url; a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function validateData(d) {
    if (!d || typeof d !== 'object') throw new Error('Dados ausentes');
    if (!Array.isArray(d.symbolsData) || !Array.isArray(d.guardians)) throw new Error('Estrutura principal inválida');
    if (d.symbolsData.length > 2000 || d.guardians.length > 50) throw new Error('Quantidade de registros excedida');
    const textFields = ['childProfile','medicalData'];
    textFields.forEach(k => { if (d[k] && JSON.stringify(d[k]).length > 200000) throw new Error('Dados sensíveis excedem o limite'); });
    if (d.history && !Array.isArray(d.history)) throw new Error('Histórico inválido');
    if (d.favoriteIds && !Array.isArray(d.favoriteIds)) throw new Error('Favoritos inválidos');
    if (d.symbolUsage && typeof d.symbolUsage !== 'object') throw new Error('Uso de símbolos inválido');
    if(d.phraseUsage!==undefined&&(!d.phraseUsage||typeof d.phraseUsage!=='object'||Array.isArray(d.phraseUsage)||Object.values(d.phraseUsage).some(n=>!Number.isSafeInteger(n)||n<0)))throw new Error('Uso de frases inválido');
    if(d.moduleData!==undefined)JornadaModuleData.validate(d.moduleData);
    return true;
  }
  function healthRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function selectHealthFields(source) {
    const invalid = () => new Error('Dados de saúde inválidos');
    if (!healthRecord(source)) throw invalid();
    const result = {};
    for (const key of HEALTH_TEXT_FIELDS) {
      if (!Object.hasOwn(source, key)) continue;
      const value = source[key];
      if (typeof value !== 'string' || (key === 'updatedAt' && value && !Number.isFinite(Date.parse(value)))) throw invalid();
      result[key] = value;
    }
    const textList = value => Array.isArray(value) && value.every(item => typeof item === 'string');
    if (Object.hasOwn(source, 'allergies')) {
      if (typeof source.allergies !== 'string' && !textList(source.allergies)) throw invalid();
      result.allergies = source.allergies;
    }
    if (Object.hasOwn(source, 'sensoryPreferences')) {
      const preferences = source.sensoryPreferences;
      if (!healthRecord(preferences)) throw invalid();
      const sensory = {};
      for (const key of SENSORY_FLAGS) {
        if (!Object.hasOwn(preferences, key)) continue;
        if (typeof preferences[key] !== 'boolean') throw invalid();
        sensory[key] = preferences[key];
      }
      if (Object.hasOwn(preferences, 'helps')) {
        if (!textList(preferences.helps)) throw invalid();
        sensory.helps = preferences.helps;
      }
      result.sensoryPreferences = sensory;
    }
    if (!Object.keys(result).length || new TextEncoder().encode(JSON.stringify(result)).length > MAX_HEALTH_DATA_BYTES) throw invalid();
    return result;
  }

  window.BackupService = {
    async exportHealth(data, password, canDownload) {
      const payload = { app: 'A Jornada de Bia', type: 'health', backupVersion: HEALTH_BACKUP_VERSION, data: selectHealthFields(data) };
      const encrypted = await BackupCrypto.encrypt(payload, password);
      if (canDownload && !canDownload()) return false;
      download(JSON.stringify(encrypted), `jornada-bia-backup-saude-${new Date().toISOString().slice(0,10)}.json`);
      return true;
    },
    async readHealth(file, password) {
      if (!file || !file.size || file.size > MAX_HEALTH_FILE_BYTES) throw new Error('Arquivo de saúde inválido');
      const text = await file.text();
      if (text.length > MAX_HEALTH_FILE_BYTES) throw new Error('Arquivo de saúde inválido');
      const encrypted = JSON.parse(text);
      if (encrypted?.app !== 'A Jornada de Bia' || encrypted.encrypted !== true) throw new Error('O backup de saúde precisa estar criptografado');
      const payload = await BackupCrypto.decrypt(encrypted, password);
      if (payload?.app !== 'A Jornada de Bia' || payload.type !== 'health' || payload.backupVersion !== HEALTH_BACKUP_VERSION) {
        throw new Error('Formato de backup de saúde inválido');
      }
      return selectHealthFields(payload.data);
    },
    async export(data, opts={}) {
      const clean = opts.configurationOnly ? Object.fromEntries(Object.entries(data).filter(([k])=>CONFIG_KEYS.has(k))) : Object.fromEntries(Object.entries(data).filter(([k])=>k!=='medicalData'));
      const payload = { app:'A Jornada de Bia', appVersion:'31.1.0', backupVersion:BACKUP_VERSION, type:opts.configurationOnly?'configuration':'full', exportedAt:new Date().toISOString(), data:clean };
      payload.integrity = await digest(JSON.stringify(payload));
      if (typeof opts.password !== 'string' || opts.password.length < 8) throw new Error('Backup protegido exige uma senha com pelo menos 8 caracteres');
      const text=JSON.stringify(await BackupCrypto.encrypt(payload, opts.password),null,2);
      const suffix=opts.preImport?'pre-import':(opts.configurationOnly?'config':'completo');
      if(opts.canDownload&&!opts.canDownload())return null;
      download(text, `jornada-bia-backup-${suffix}-${new Date().toISOString().slice(0,10)}.json`);
      return payload;
    },
    async readAndValidate(file) {
      if (file.size > MAX_BYTES) throw new Error('Arquivo muito grande');
      const text=await file.text(); if(text.length>MAX_BYTES) throw new Error('Arquivo muito grande');
      let p=JSON.parse(text);
      if(p.encrypted){
        if(!window.BackupCrypto) throw new Error('Módulo de criptografia indisponível');
        const password=prompt('Digite a senha deste backup:');
        if(password===null) throw new Error('Importação cancelada');
        p=await BackupCrypto.decrypt(p,password);
      }
      if (!p || typeof p!=='object' || !p.data) throw new Error('Formato inválido');
      if (!['full','configuration'].includes(p.type || 'full')) throw new Error('Tipo de backup inválido');
      if (p.backupVersion && p.backupVersion > BACKUP_VERSION) throw new Error('Versão de backup não suportada');
      if (p.integrity) {
        const copy={...p}; delete copy.integrity;
        if (await digest(JSON.stringify(copy)) !== p.integrity) throw new Error('Integridade inválida');
      }
      if (p.type === 'configuration') {
        if (!Array.isArray(p.data.symbolsData)) throw new Error('Configuração inválida');
        p.data=Object.fromEntries(Object.entries(p.data).filter(([key])=>CONFIG_KEYS.has(key)));
      } else { validateData(p.data); }
      delete p.data.medicalData; // Saúde não é transportada nem por backups antigos.
      return p;
    },
    validateData
  };
})();
