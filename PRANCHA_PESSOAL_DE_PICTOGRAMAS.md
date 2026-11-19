# Prancha pessoal de pictogramas

Em **Comunicação**, a seção **Montar uma mensagem** permite compor e ouvir sem voltar ao Início. O botão **Usar uma frase pronta** leva à lista existente, que continua permitindo comunicação com um toque (ou confirmação, se a voz guiada estiver ativada).

## Uso

- **Meus favoritos:** cartões marcados em “Organizar símbolos favoritos”, na ordem em que foram escolhidos. “Escolher favoritos” abre essa organização.
- **Palavras para combinar:** Eu, Quero, Mais, Não e Agora.
- **Assuntos:** mostram os símbolos já existentes, na ordem de cadastro. Não há reordenação por uso, horário, rede neural ou Random Forest. Novos símbolos entram ao final. A prancha não trunca categorias legadas com mais de 15 itens; o limite existente para criar novos símbolos permanece.
- **Faixa da mensagem:** mostra as imagens e palavras na sequência escolhida. A mensagem é lida somente em **Ouvir mensagem** neste fluxo; a preferência de fala das outras telas não foi modificada.
- **Tirar último / Limpar:** permitem corrigir sem registrar uma fala. Limpar cancela a reprodução e a exploração pendente.
- **Guardar como frase pronta:** guarda o texto em “Minhas frases”, categoria Geral, sem duplicar texto idêntico. Não copia os bitmaps para cada frase e não envia nada à conta. A frase pronta é textual; os pictogramas continuam nos símbolos do aparelho. A transferência pela conta continua sendo uma ação separada.

Escolher cartões ou explorar com voz guiada não registra aprendizado neste novo fluxo. A fala confirmada mantém a configuração de voz, o aprendizado existente e os eventos de comunicação usados pelo acompanhamento opcional do Jardim. Acionamento não prova intenção, espontaneidade ou que o áudio foi ouvido.

## Imagens e estabilidade

Os símbolos personalizados usam as cópias PNG ARASAAC já salvas. Alguns símbolos padrão usam pictogramas locais distribuídos no app, somente se ID e rótulo ainda corresponderem ao padrão; um símbolo renomeado não recebe uma imagem por suposição. Nos demais casos, permanece o emoji. Imagem e texto são exibidos juntos.

Os créditos Sergio Palao / ARASAAC / Governo de Aragão e a licença CC BY-NC-SA 4.0 aparecem na prancha. Não há busca de imagens ou consulta de sugestões ao tocar nesses cartões. A busca ARASAAC permanece no cadastro do símbolo, por escolha do responsável.

As posições mudam apenas quando o conteúdo ou a seleção de favoritos é alterada explicitamente. Tocar, falar, desfazer e salvar uma frase não reordena a grade. Alterações de favoritos são confirmadas após gravação; falha de armazenamento ou conflito com outra aba não confirma uma seleção não salva. Falha ao guardar uma frase mantém a composição para tentar novamente.

## Dados e compatibilidade

Usa `symbolsData` e `myCommunicationData.favoriteSymbols` existentes, sem migração ou nova API. A composição fica apenas na memória enquanto o app está aberto. Os backups e as transferências mantêm os formatos atuais. Não acessa saúde, perfil clínico ou registros familiares. Não inclui o rascunho de RAG, que continua fora desta entrega.

## Validação

- 113 testes Node passaram, incluindo ordem estável, favoritos, preservação de categorias legadas e composição “Eu → Quero → Beber água”.
- Fluxo novo de navegador passou: imagens, favoritos, ordem após uso, composição sem fala/aprendizado, fala explícita, desfazer, limpar, frase pronta sem duplicação, falhas de gravação, atalhos para frases e voz guiada.
- Fluxos existentes de ARASAAC, conta/frases e contraste passaram; as amostras de contraste incluem os novos cartões e a faixa da mensagem nos quatro temas.
- Serviços externos simulados nos testes. Inspeção visual em celular de 390 × 900.

Após publicar, conferir com o responsável e a fono quais imagens, frases e favoritos fazem sentido para a pessoa. O app não determina o significado de gestos nem substitui a organização individual de CAA. Confirmar também voz, toque, teclado e leitor de tela no aparelho de uso.
