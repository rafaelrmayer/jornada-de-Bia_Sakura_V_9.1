# Minha Comunicação — V2 (ajustes de categorias e visual)

- Substituídos os ícones de pasta por cartões acolhedores com ilustrações emoji, cores suaves e contagem de frases.
- Cada cartão de categoria agora abre a lista correspondente e informa quantas frases contém.
- Adicionado controle para visualizar todas as frases novamente.
- O seletor de categoria do formulário agora é preenchido dinamicamente com as categorias cadastradas.
- Ao criar uma frase com uma categoria selecionada, a tela passa a mostrar essa categoria automaticamente.
- Categorias já associadas a frases existentes são recuperadas na inicialização, evitando que frases antigas fiquem invisíveis.
- Ao excluir uma categoria personalizada, suas frases são preservadas e movidas para “Geral”.
- Mantidos armazenamento local, favoritos, fala das frases e integração com backup.

## Verificações realizadas
- Verificação sintática de `js/app.js` com Node.js (`node --check`).
- Revisão estática do fluxo de criação, edição, seleção e filtragem por categoria.
- Teste real no navegador/celular ainda depende da validação do usuário.
