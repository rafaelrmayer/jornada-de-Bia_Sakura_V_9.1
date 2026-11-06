# Jornada de Bia V9.6.8 — Sanitarização conservadora

## Alterações efetivamente realizadas
- Consolidados 12 arquivos CSS carregados pela página em `css/app-v9-6-8.css`, preservando integralmente a ordem e o conteúdo das regras.
- Removidos do pacote os 12 arquivos CSS originais já incorporados ao arquivo consolidado.
- Atualizados os links CSS do `index.html` e o pré-cache do `sw.js`; versão de cache alterada para V9.6.8.
- **Nenhum JavaScript alterado**, especialmente o mecanismo da Francisca Neural, segurança, armazenamento, IA e acessibilidade.
- Nenhum dado de usuário ou chave de armazenamento alterados.

## Verificações estáticas
- Arquivos CSS antes: 12 carregados; depois: 1.
- Scripts mantidos na mesma ordem: 16.
- IDs HTML duplicados (contagem): {}.
- Referências ausentes no pré-cache: [].

## Pendências deliberadamente não automatizadas
- Não removemos funções JS com nomes ou trechos semelhantes sem testes de equivalência funcional.
- Não eliminamos regras CSS sobrepostas: o bundle preserva cascata, mas ainda contém histórico de estilos.
- Não removemos os módulos `accessibility-v9-2-8.js` e `accessibility-v9-2-9.js` porque precisam de auditoria funcional de listeners e efeitos colaterais.
- Não alteramos menus, APIs de IA, PostgreSQL ou lógica de sincronização.

## Validação manual necessária
1. Firefox: Francisca Neural na prévia e nos cartões (primeira e segunda reprodução).
2. Temas rosa/verde, claro/escuro; telas internas e pétalas Sakura.
3. Menus, PIN, cartões personalizados e persistência após recarregar.
4. Leitor de tela, teclado e redução de movimento.
5. PWA offline após atualização e instalação limpa.

**Esta versão é uma candidata de testes, não uma versão funcional homologada.**
