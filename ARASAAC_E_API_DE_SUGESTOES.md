# Pictogramas ARASAAC e API de sugestões

## Criar um símbolo com imagem

1. Em **Comunicação → Meus símbolos → Criar símbolo**, desbloquear a administração.
2. Na seção **Imagem ARASAAC**, digitar um termo em português e tocar em **Buscar imagens**.
3. Escolher uma das até 12 imagens. O app prepara uma cópia PNG de até 180 KB.
4. Preencher o nome e a categoria e salvar. Sem emoji, o pictograma pode ser usado com um marcador de reserva.
5. Abrir a categoria em Meus símbolos e tocar no cartão para adicioná-lo à composição da frase. A imagem acompanha o símbolo nos cartões e na prévia do construtor.

A busca não acontece automaticamente ao abrir o app, nem usa o perfil, saúde ou histórico como consulta. O termo digitado é enviado à API pública `api.arasaac.org/v1/pictograms/pt/search/`; as prévias vêm de `static.arasaac.org`. São pedidos sem credenciais e sem referrer. A tela orienta a não digitar dados pessoais.

Buscar e escolher uma imagem exigem internet. Depois de salvar, a cópia fica nos dados locais do símbolo, disponível offline e no backup geral protegido por arquivo. Não é enviada à conta Google nem incluída automaticamente nos cartões de texto da conta. Se o armazenamento falhar, os dados antigos ficam preservados e o formulário permanece aberto para repetir a gravação.

Somente PNG com assinatura e tamanho permitidos é aceito. A renderização usa uma URL de dados validada; não aceita HTML/SVG, scripts ou URLs arbitrárias. Busca e seleção possuem timeout e cancelamento. Fechar o modal ou bloquear impede que uma resposta tardia seja usada.

O formulário fica acima das telas e possui rolagem para caber em celular; a navegação por Tab permanece dentro dele enquanto aberto. O modo emoji continua disponível e **Usar somente emoji** remove a seleção da imagem antes de salvar.

## Créditos e licença

Pictogramas de **Sergio Palao / ARASAAC**, propriedade do **Governo de Aragão**, sob **CC BY-NC-SA 4.0**. Os créditos, origem, ID e licença acompanham a imagem salva. A tela mantém links para as condições de uso e a licença. O uso comercial exige autorização dos titulares; adaptações devem respeitar a atribuição e o compartilhamento pela mesma licença. Os pictogramas pré-instalados continuam documentados em `assets/arasaac/README.md`.

## Random Forest como API opcional

O laboratório agora permite selecionar **Random Forest — API externa experimental**, além da rede neural externa e da ordenação local existente. É preciso a autorização específica do laboratório; ser responsável da família não concede essa autorização.

O novo endpoint é `/v1/cards/random-forest/suggestions`, no serviço `neural-api`, separado da Data API da família. A requisição do app contém apenas período do dia e ID do último cartão da demonstração na sessão, sem cookies ou token Google. A resposta exige modelo `cards-rf-demo`, versão `1.0.0`, sinalização experimental/sintética, cinco IDs conhecidos e escores válidos.

A API usa 31 árvores e 18 contextos sintéticos, com regra de geração explícita. Não aprende preferências reais, não utiliza os símbolos ARASAAC criados pelo responsável e não recebe histórico para treinamento. É um primeiro contrato de integração reutilizável, limitado ao catálogo de demonstração; não é uma API genérica já treinada para qualquer catálogo.

A atualização é manual. Erro, timeout, falta de rede ou incompatibilidade levam à ordenação local existente. A fala depende sempre da escolha da pessoa; não há fala automática por resposta da API. Bloquear a administração cancela uma atualização pendente.

O endpoint é público como a demonstração neural existente. A restrição do laboratório protege a configuração no aplicativo, não é autenticação da API. Detalhes e limites estão em `RANDOM_FOREST_API.md` no repositório `neural-api` ([PR #4](https://github.com/rafaelrmayer/neural-api/pull/4)).

## Publicação e testes

Publicar primeiro o novo endpoint no serviço neural-api, aguardar o deploy e depois integrar o app. Não há variável, chave ou alteração de banco nova. ARASAAC não exige cadastro ou chave nesta integração.

- 109 testes Node passaram: normalização do catálogo, origem fixa, PNG inválido/grande, envio mínimo, contrato RF e alternativa local.
- Playwright passou no fluxo de busca/seleção, falha de gravação, persistência, recarga, uso da imagem offline, composição e bloqueio.
- O fluxo geral passou também na configuração restrita de RF, ausência de consulta ao salvar, atualização explícita e queda para local após falha simulada.
- 41 testes do serviço neural-api passaram, incluindo os endpoints existentes e o novo contrato.
- Consulta real de leitura ao catálogo e resposta PNG/CORS verificadas; o teste do aplicativo usa respostas simuladas e não envolve dados pessoais.

Após publicar: criar um símbolo de teste no aparelho, atualizar o app, confirmar a imagem sem internet e testar o novo modo no laboratório. Perda/limpeza do armazenamento local continua podendo remover símbolos; manter o backup por arquivo. Não interpretar os testes como validação clínica ou garantia de disponibilidade dos serviços externos.
