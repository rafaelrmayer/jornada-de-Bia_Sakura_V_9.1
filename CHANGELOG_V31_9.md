# Jornada de Bia V31.9 — Cartões rápidos e atalho de símbolos

## Alterações
- Adicionado o quarto cartão de acesso rápido **Criar símbolo**, ligado ao formulário já existente de criação.
- Criada a seção **Meus cartões** na tela inicial, que exibe até 15 símbolos clicáveis. Os símbolos personalizados aparecem primeiro para que os novos cartões sejam visíveis mesmo com muitos símbolos padrão.
- Ao tocar em um cartão, o símbolo é incluído na frase em construção. A lista é atualizada após criar, editar ou excluir símbolos.
- Reordenados os banners: o banner **Jornada de Bia** vem antes da saudação/perfil da criança.
- Atualizada a chave de cache do Service Worker para `jornada-bia-v31-9`.

## Preservação
- Mantidos os dados existentes no armazenamento local; não há migração nem limpeza de dados.
- Mantidas as funcionalidades da V31.8, incluindo estatísticas, biometria experimental e módulo Random Forest.

## Validação realizada
- Sintaxe JavaScript verificada com `node --check` para `app.js`, `random-forest.js` e `sw.js`.
- Testes automatizados do Random Forest executados como verificação de regressão.
- A validação visual final deve ser feita no navegador/Android após atualizar o site ou limpar o cache se a versão antiga continuar aparecendo.
