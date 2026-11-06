# Sakura Visual V4 — correções

- Corrigido o título central: removido `pointer-events:none` e vinculado ao roteador interno.
- Vinculados os botões de apoio ao roteador (antes não tinham listener).
- Contraste dos botões de apoio corrigido, inclusive em tema escuro.
- Aplicado creme ao fundo nos temas claros, e amarelo ao cartão Música e Atividades.
- Ícones originais SVG com contornos desenhados, substituindo emoji nos módulos principais e nas quatro ações rápidas.
- Melhorada legibilidade da marca.
- Cache da PWA atualizado para V4.

## Testes manuais recomendados
1. Alternar seis temas, inclusive os três escuros, e verificar textos.
2. Clicar no título para retornar ao início.
3. Clicar Médico, Categorias, Modo Calmo e Configurações; ações protegidas devem solicitar desbloqueio.
4. Testar comunicação, rotina, atividades, assistente, PIN e biometria.
5. Se a versão anterior continuar aparecendo em instalação PWA, fechar e reabrir e limpar o cache antigo da instalação.

Esta revisão não altera algoritmos de RF ou rede neural.
