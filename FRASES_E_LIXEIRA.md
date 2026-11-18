# Minhas frases e lixeira — fluxo simplificado

## Para usar

- Em **Minha Comunicação**, a lista principal mostra as frases deste aparelho.
- A lixeira pequena de uma frase a move para **Lixeira**, sem exclusão definitiva.
- O botão **Lixeira**, ao lado de Nova frase, abre as frases removidas. **Restaurar**
  devolve a frase à lista principal e mostra todas as categorias, sem importação.
- Mover e restaurar exigem desbloqueio da organização. O atalho está na lixeira.
- **Organizar todas as frases** fica recolhido: move todas para a lixeira, exige
  desbloqueio e confirmação e preserva aprendizado, categorias e favoritos.
- Quando uma categoria filtra a lista, o filtro aparece junto ao título e há
  um botão **Mostrar todas as frases** no mesmo lugar.

Frases e referências existentes são preservadas. A lixeira usa `trash` dentro
do mesmo registro local `myCommunicationData`; dados antigos recebem lista vazia,
sem migração destrutiva. A exclusão individual passa a ser recuperável a partir
desta versão. Frases apagadas por versões anteriores não surgem automaticamente.
Não há limpeza automática da lixeira nem exclusão definitiva nova nesta entrega.

## Conta e cópia das frases

Em Apoio, depois de entrar na conta, as ações principais são:

1. **Guardar minhas frases na conta:** um único comando envia categorias
   necessárias e frases novas. Não substitui edições divergentes silenciosamente.
2. **Trazer frases da conta:** adiciona frases ausentes e preserva as atuais.
   Não ressuscita frases movidas para a lixeira local; elas são restauradas pelo
   botão próprio. A mensagem indica isso quando não há frases novas.

**Opções avançadas das frases** reúne revisão de versões, recuperação de frases
da conta e envios separados. A recuperação mostra frases ativas e arquivadas,
sempre com **Restaurar em Minhas frases**. Para uma arquivada, o comando restaura
no servidor e grava a cópia no aparelho. Para uma ativa, traz a cópia diretamente.
Não duplica frases já existentes nem substitui texto local editado.

Se a frase estiver na lixeira local, uma restauração explícita preserva seu texto
local e devolve a cópia à lista principal. A importação comum não faz essa ação.
Arquivar somente na conta fica dentro de um controle adicional recolhido; essa
ação preserva as frases do aparelho. Excluir localmente não altera a conta.

Se a restauração do servidor funcionar e a gravação local falhar, o app não diz
que a frase voltou: explica que ela continua na conta e oferece repetir a
recuperação a partir da lista atualizada. Não existe transação atômica entre
PostgreSQL e armazenamento do navegador.

O backup protegido completo do app já inclui todo o registro myCommunicationData,
portanto inclui a lixeira. Backup do banco continua contendo só dados do servidor.
Não há transferência automática, nem mudança em permissões, conta ou senha.
Cada navegador mantém sua própria cópia e lixeira. Falha de gravação mantém o
estado local anterior. Outra aba alterada interrompe a movimentação para evitar
sobrescrita. As outras funções do aplicativo não receberam revisão geral de
concorrência entre abas nesta etapa.

## Teste curto após publicar

Use uma frase fictícia, com backup do app guardado antes:

1. Criar **Teste — mochila**; mover pela lixeira pequena. A frase sai da lista.
2. Abrir **Lixeira**, tocar Restaurar. A frase volta imediatamente a Minhas frases.
3. Recarregar e conferir que continua presente. Usar sem internet com voz instalada.
4. Em Apoio, Guardar minhas frases na conta. Repetir: não duplica e não exige
   enviar categorias em outro botão.
5. Em outro navegador, entrar na mesma família e Trazer frases da conta. Repetir:
   preserva frases anteriores e não duplica.
6. Em Opções avançadas → Recuperar frases da conta, testar **Restaurar em Minhas
   frases** para uma frase de teste ausente deste aparelho. Ela deve ficar disponível.

O sumiço relatado na versão anterior não foi reproduzido no desenvolvimento.
Esta entrega resolve a ambiguidade da interface e torna exclusões locais novas
recuperáveis; não atribui uma causa comprovada ao relato anterior. O novo teste
do responsável permanece pendente após publicação.

## Verificação técnica

- `node --test tests/*.test.cjs`: testes Node, incluindo movimentação em massa,
  confirmação, bloqueio e falha de armazenamento.
- Teste de navegador com Playwright e Chromium: `tests/browser/simpler-phrases.cjs`.
  Ele intercepta a API com dados fictícios e bloqueia outras origens. Não envia
  nada à conta real. Requer Playwright instalado no ambiente de desenvolvimento.

Sirva a raiz do app com `python -m http.server 8129 --bind 127.0.0.1` e execute
`node tests/browser/simpler-phrases.cjs`. `BIA_CHROMIUM_PATH` permite indicar um
Chromium instalado e `BIA_TEST_SITE` mudar a URL local. `BIA_TEST_SCREENSHOT` é
opcional para salvar uma captura.

O teste percorre cancelar, mover/restaurar localmente, falha de gravação,
recarregamento, preservação de aprendizado, Guardar com categorias, repetição,
arquivamento na conta sem exclusão local, recuperação em um passo, importação
respeitando lixeira local, backup criptografado incluindo a lixeira, bloqueio,
restauração offline e largura móvel. Áudio real e aceitação pelo responsável
continuam dependendo dos testes em aparelhos reais.
