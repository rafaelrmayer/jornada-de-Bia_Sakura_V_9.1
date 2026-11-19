# Contraste dos temas

A folha `css/theme-contrast.css`, carregada depois das folhas legadas, mantém pares explícitos de texto e superfície nos modos escuros rosa e azul. Não altera armazenamento, voz, dados ou navegação.

## Ajustes

- Comunicação: painéis e campos escuros com texto claro; botões principais em destaque claro com texto escuro.
- Temas claros: botões principais de Comunicação com texto branco sobre destaque escuro.
- Prancha: rótulos das categorias selecionadas usam a cor correspondente ao destaque. Pictogramas mantêm seus fundos brancos.
- Campos: placeholders legíveis e controles nativos informados do modo escuro.
- Cabeçalho, seta do construtor e botão de contato: cores ajustadas para evitar perda de contraste.
- Relatórios: papel claro e texto escuro, inclusive quando a interface está escura. Estilos antigos de preenchimento de texto não vazam para o relatório.
- Alto contraste tem prioridade sobre as paletas escuras.

## Verificação

102 testes Node passaram. `tests/browser/theme-contrast.cjs` mede pares renderizados de texto/superfície e exige pelo menos 4,5:1 nas amostras: categoria selecionada, painel e ação de Comunicação, seleção de voz, campo de saúde, atividade Agora e relatório na tela/prévia. Exercita rosa/azul claros e escuros, além de alto contraste sobre azul escuro. Serviços externos são bloqueados.

Também foi feita inspeção visual em viewport de celular. As medições são amostrais: não são uma auditoria WCAG completa, nem avaliam todas as imagens, combinações de estado ou dispositivos. Após publicar, conferir os dois modos escuros no aparelho real, especialmente Comunicação, Saúde, Rotina, Apoio e o relatório.
