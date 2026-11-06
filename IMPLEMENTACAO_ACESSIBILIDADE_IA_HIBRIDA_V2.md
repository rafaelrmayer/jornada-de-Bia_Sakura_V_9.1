# Jornada de Bia Sakura — Acessibilidade e IA híbrida V2

Base: Rotina e Atividades V1.

- Preferências locais de cartões grandes, contraste reforçado, redução de animações e visibilidade de desenho, jogo e sons; edição exige sessão administrativa desbloqueada.
- Random Forest preservado; rede neural MLP pequena implementada em JavaScript puro, com treino apenas nos registros locais já utilizados pelo ContextBrain.
- A rede neural só altera a sugestão quando concorda com o Random Forest e ambos ultrapassam limiares conservadores. Sem dados suficientes, a previsão anterior permanece.
- Tela Assistente Inteligente exibe situação comparativa; não declara estados emocionais ou necessidades da criança.
- PWA: versão de cache atualizada.

## Limitações e próximos testes
- Testes automáticos de sintaxe e modelos não substituem testes manuais em navegador, especialmente mobile, PIN e biometria.
- Preferências locais não são sincronizadas entre dispositivos nem incluídas automaticamente no backup anterior.
- Não há validação científica ou clínica dos modelos, nem garantia de precisão ou calibração.
- O controle de acesso local não substitui criptografia de dados sensíveis ou autenticação de servidor.
- Preferências de atividades permitem ocultar opções, não adicionam upload de músicas.
