# V9.3.1 — correção experimental

- Corrigida expressão regular de PIN de quatro dígitos que impedia PINs válidos na V9.3.0.
- Contador de erros é reiniciado após a expiração do bloqueio de 30 segundos; novo ciclo de cinco tentativas.
- Voz online agora tem timeout de 4 segundos, com fallback para síntese do navegador inclusive em caso de timeout.
- Mantida prevenção contra fala antiga quando uma nova solicitação substitui a anterior.
- Cache PWA atualizado.

**Limitações:** teste de sintaxe não substitui teste funcional em navegador/Android. A síntese local pode depender de vozes instaladas e políticas do navegador. Não há garantia de fala offline em todo dispositivo. Não alteramos dados pessoais, PIN existente ou biometria.

**Teste:** (1) PIN correto; (2) cinco erros, recarregar e esperar 30 segundos; (3) PIN correto; (4) testar fala com rede ativa e modo avião, inclusive frases seguidas; (5) testar voz novamente após trocar de aba e voltar.
