# Jornada de Bia Sakura — acessibilidade V9.2.7 (experimental)

Base: V9.2.6, preservada separadamente.

## Mudanças incrementais
- Área mínima de 44 × 44 CSS px em controles compactos identificados.
- Tamanho mínimo de texto de 14 px nos botões de apoio, intenção e sugestão de hábitos.
- Reforço do foco visível e da quebra de linha dos rótulos em cartões da tela inicial.
- Sem mudança nos tokens dos dez temas, nos mecanismos de PIN/biometria, no armazenamento ou na IA.

## Limites desta entrega
- Inspeção estática, não equivale a conformidade WCAG 2.2.
- Não foram executados testes com leitores de tela, navegador gráfico, teclado real ou pessoas usuárias.
- Não foi medida a totalidade dos contrastes de todos os componentes e estados.
- Ainda é necessário revisar semântica dos cartões gerados por JS, navegação por teclado, zoom 200%/400%, telas pequenas, mensagens de erro e acessibilidade das atividades.

## Roteiro de validação manual
1. Abrir o aplicativo por servidor HTTPS/localhost (não apenas file://) para testar PWA.
2. Conferir as cinco cores nos modos claro e escuro.
3. Navegar por Tab/Shift+Tab/Enter/Espaço; verificar foco visível e ordem lógica.
4. Ampliar a página para 200% e 400%; confirmar ausência de conteúdo cortado.
5. Simular viewport de 320 CSS px; verificar que rótulos não se sobrepõem.
6. Ativar redução de movimento no sistema; verificar ausência de animações não essenciais.
7. Testar leitura de controles e mensagens com leitor de tela.
8. Confirmar que comunicação, voz e cartões funcionam offline quando o PWA estiver instalado.

Não publicar como versão acessível validada antes de completar esses testes.
