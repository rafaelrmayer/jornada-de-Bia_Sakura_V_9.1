# V9.5.1 — refinamento minimalista + preferência Francisca

- Recuperado timeout de 25s da V9.2.9 para Francisca Neural; o limite de 3,5s da V9.5.0 forçava fallback prematuro.
- O fallback continua em caso de erro, inclusive timeout; mensagem indica o motivo quando disponível.
- CSS de refinamento adicional separado, sem alterar IDs, fluxo de PIN, cartões ou dados.
- Cache PWA versionado e CSS incluído na lista de precache.

**Atenção:** isso NÃO garante Francisca. O serviço remoto, CORS e disponibilidade devem ser testados em HTTPS. Um cold start pode levar até 25 segundos e é inadequado para comunicação imediata; prioridade posterior: backend confiável ou cache de frases autorizadas com consentimento, fallback acessível e indicação clara.

Teste: selecione Francisca, toque em Testar voz; observe se status confirma online. Repita com frase curta. Se falhar, abra console/rede e registre HTTP/status/CORS. Não apague armazenamento local.
