# Jornada de Bia Sakura V9.2.8 — acessibilidade experimental

## Alterações
- Foco programático na nova seção após navegação pelo aplicativo.
- Estado `aria-current=page` sincronizado com os menus de navegação.
- Anúncio discreto de mudanças no texto de prévia de frases.
- Estilos de foco e quebra de linha reforçados.
- Preferência por redução de movimento respeitada.
- Atualização da versão de cache do Service Worker.
- PIN, biometria, modelos de IA e armazenamento não alterados.

## Limites e testes necessários
Esta atualização **não comprova conformidade WCAG 2.2 AA**. Testar manualmente TalkBack, VoiceOver, NVDA/Orca, zoom 200%/400%, teclado, formulários, diálogos e atividades. Auditar todos os botões com `data-a11y-review=missing-name`. Testar o foco ao navegar e retorno de modais. Testar síntese de voz simultânea com leitores de tela. Não tratar atividades puramente visuais como plenamente acessíveis sem alternativas equivalentes.

## Regressão
Comparar com a V9.2.7 antes de promover esta versão a estável.
