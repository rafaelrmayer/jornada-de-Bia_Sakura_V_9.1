# Jornada de Bia V31.12 — Cartões recolhidos

- As categorias de “Meus cartões” começam recolhidas ao abrir a tela inicial.
- Tocar no cabeçalho de uma categoria expande ou recolhe somente aquela categoria.
- Adicionado estado acessível `aria-expanded` e controle por botão, compatível com toque, teclado e leitor de tela.
- Os cartões e limites por categoria foram mantidos; o conteúdo de cada categoria continua disponível ao expandir.
- Cache do service worker atualizado para `jornada-bia-v31-12`.

## Testes recomendados
- Abrir a tela inicial e confirmar que todas as categorias estão recolhidas.
- Tocar em uma categoria e confirmar que só ela se expande.
- Tocar novamente para recolher.
- Abrir outra categoria e testar cartões, voz e construtor de frase.
