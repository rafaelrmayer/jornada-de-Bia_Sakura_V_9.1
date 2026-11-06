# Jornada de Bia V31.10 — Seletor de emojis

## Alterações
- Adicionado um seletor visual de emojis no formulário de criação e edição de símbolos.
- Tocar no campo de emoji ou no botão **Escolher emoji** abre uma grade de emojis comuns, sem depender de encontrar o botão de emoji no teclado do celular.
- Ao selecionar um emoji, ele é preenchido automaticamente e o seletor fecha.
- Incluídos rótulos acessíveis para os emojis, suporte a navegação por foco e grade rolável para telas pequenas.
- Atualizada a chave do cache do service worker para `jornada-bia-v31-10`.

## Testes
- Verificada a presença dos elementos e dos manipuladores do seletor.
- Sintaxe JavaScript verificada com Node.js quando disponível.
- Testes existentes do Random Forest executados separadamente para garantir que a alteração de interface não afete esse módulo.

## Observação
O seletor é local e não requer conexão externa. A versão mantém o campo de emoji somente para seleção visual, reduzindo dificuldades de entrada em celulares.
