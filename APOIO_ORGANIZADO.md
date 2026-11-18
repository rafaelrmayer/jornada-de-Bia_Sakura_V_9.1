# Apoio organizado

O Apoio passa a mostrar quatro blocos recolhidos, abrindo um por vez:

- **Aparência e acessibilidade:** cores, iluminação, texto, contraste, movimento e personalização adicional.
- **Voz:** escolha e ajustes da voz, com exploração guiada em uma seção própria.
- **Conta e backup:** conexão Google, transferência de frases e cópias locais protegidas.
- **Família e compartilhamento:** responsáveis e PIN, perfil, convites e pessoas com acesso.

“Mais opções” reúne atalhos e recursos avançados. O laboratório continua condicionado à autorização de administrador da conta. “Limpar dados deste aparelho” aparece separadamente no final, mantendo as proteções e confirmações existentes.

Quando existe apenas uma família, aparece seu nome; o seletor é exibido para várias famílias. Sem conexão, a área de compartilhamento oferece um atalho para conectar a conta. Resultados de convites, gerenciamento de acessos e backup local aparecem próximos da ação correspondente.

Todos os IDs dos controles anteriores foram preservados. Esta reorganização não altera autenticação, permissões, formato de dados ou regras de exclusão. O cache do aplicativo inclui a nova folha de estilos.

## Validação

- 93 testes automatizados Node passaram.
- Fluxo Playwright passou com API, Google e vozes simulados: abertura dos blocos, acessibilidade, voz, conexão, uma ou várias famílias, convites, transferência de frases, lixeira e restrição do laboratório.
- Verificação de sintaxe JavaScript e diferenças de espaços passou.
- Comparação do HTML confirmou a preservação dos IDs anteriores e ausência de novos IDs duplicados.
- Inspeção visual em viewport de celular (390 × 900).

## Conferência após publicar

1. Atualizar o aplicativo e abrir Apoio; conferir os quatro blocos.
2. Alterar e restaurar uma preferência de aparência e voz.
3. Conectar com Google e conferir a família e as frases existentes.
4. Conferir convite e acesso com outra conta, conforme a permissão escolhida.
5. Exportar uma cópia local e conferir a mensagem junto dos botões de backup.

Os testes locais usam serviços simulados; a conferência real após a publicação permanece necessária.
