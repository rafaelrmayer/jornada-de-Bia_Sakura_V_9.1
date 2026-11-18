# Comunicação unificada

## Uma área para criar e usar

A navegação pública passa a ter somente **Comunicação**. O atalho do Início leva
à mesma área. Chamadas antigas a `showPage('cards')` continuam funcionando,
redirecionadas para Comunicação com navegação/foco corretos.

- **Nova frase** cria as frases pessoais no mesmo lugar onde são usadas.
- **Mais usados neste aparelho** mostra até seis atalhos de frases atuais com
  uso registrado. Sem uso real, o painel fica oculto; não inventa sugestões.
- A lista **Minhas frases** mantém a ordem em que o adulto a organizou.
- Categorias, lixeira e restauração continuam acessíveis nessa mesma área.
- **Meus símbolos** é trazido da página antiga, preservando os símbolos
  personalizados e o funcionamento existente. **Criar símbolo** abre o editor
  já utilizado pelo app, respeitando o desbloqueio administrativo local.
- A galeria de organização de favoritos fica recolhida para reduzir o tamanho
  inicial da página. Favoritos existentes não são alterados.

## Origem dos atalhos

Usa somente `phraseUsage` já registrado neste aparelho e frases que ainda estão
em Minhas frases. Ordena os atalhos pela frequência local e mantém a ordem da
lista para desempatar. Não modifica a ordem principal, não infere necessidades,
não cria frases, não faz ranking de desempenho terapêutico e não chama IA/API.

O histórico é por texto falado: escolhas anteriores do mesmo texto no app também
podem contar. Editar o texto não transfere a frequência antiga para o texto novo;
a contagem antiga continua no histórico. Textos iguais geram um único atalho.
Mover para a lixeira retira dos atalhos; restaurar permite reaparecer conforme
sua frequência preservada. Dados inválidos ou sem contagem positiva não geram
atalhos. Símbolos mantêm seu fluxo/estatísticas existentes; este painel novo é de
frases pessoais.

A voz guiada também vale nos atalhos: selecionar, ouvir prévia ou cancelar não
registra uso. Confirmar encaminha uma vez à função original de comunicação.
A comunicação, o aprendizado e os limites do modo de teste RF seguem os caminhos
existentes. Recriar visualmente os atalhos não registra nova escolha.

## Dados e modelos preservados

Não apaga frases, símbolos, categorias, favoritos, lixeira ou aprendizado.
`phraseUsage` passa a integrar explicitamente o backup completo protegido por
arquivo. O importador aceita backups antigos sem esse campo, preservando a
compatibilidade; backups novos verificam estrutura e contagens. Transferência
pela conta continua somente com os dados já suportados, sem enviar histórico de
uso junto às frases. Cada navegador mantém seu próprio uso local.

A demonstração de cinco frases fictícias foi movida para **Laboratório → Testar
a demonstração**, visível só com a autorização administradora preparada no PR
anterior. A configuração experimental permanece bloqueada por padrão. Atualizar
a demonstração exige revalidar a autorização e é sempre manual; abrir Comunicação
não reordena cartões experimentais nem inicia chamadas ao servidor neural.
RF e modelos existentes não foram removidos.

## Teste curto após publicar

1. Abrir Comunicação: não deve haver outro botão Cartões no menu inferior.
2. Criar duas frases fictícias e falar uma mais vezes que a outra. Os atalhos
   devem refletir essas escolhas sem mover a ordem da lista principal.
3. Ativar voz guiada, explorar/cancelar e conferir que apenas confirmar registra uso.
4. Mover uma frase frequente à lixeira: o atalho some. Restaurar: pode reaparecer.
5. Criar um símbolo pelo atalho desta área, desbloqueado, e conferir a galeria.
6. Exportar/restaurar backup protegido em um perfil de teste, preservando frases e uso.

Testes técnicos: seleção pura de atalhos, dados inválidos, limite/deduplicação,
ordem original intacta; navegador com uso real de eventos, voz simulada,
lixeira/restauração, editor de símbolo, rota antiga e backup criptografado com
validação. Não foram alterados dados da conta real. Teste do responsável segue
pendente após publicação.
