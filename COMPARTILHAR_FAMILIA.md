# Compartilhar com alguém — interface simplificada

Apoio → Conta e cópia das frases, após conectar com Google, apresenta as opções
recolhidas. Frases/categorias da conta podem ser compartilhadas; Jardim e
relatórios continuam locais.

## Convidar alguém (responsável)

Informar o e-mail Google da pessoa, escolher **Só visualizar** ou **Pode editar**
e tocar **Criar convite**. A descrição ao lado explica os poderes exatos:
consulta pode ler/trazer cópias; edição pode também alterar/arquivar frases e
criar categorias, sem gerir pessoas ou convites. Nenhum papel foi alterado no
backend por esta entrega.

**Copiar convite** copia uma mensagem pronta com link do app, e-mail esperado,
código e validade de 48 horas. O responsável cola na conversa que escolher.
Não há envio automático por WhatsApp ou e-mail. Se a cópia automática falhar,
o campo fica selecionado para copiar manualmente.

O código continua em memória durante esta sessão e é limpo ao sair, trocar de
família ou criar outro convite. Consultar a lista não apaga o convite recém-criado.
Cancelar convite limpa também o código exibido, para evitar compartilhá-lo depois
de cancelado. O app não guarda mensagem/código em armazenamento ou backup.

## Pessoas com acesso (responsável)

Abrir a opção já consulta as pessoas e os convites, sem necessidade de outro
botão. **Atualizar lista** permite conferir novamente. A lista separa participantes
de convites e oferece alterar permissão, remover acesso e cancelar convite,
com confirmação identificando a pessoa e a família. Depois da ação a lista
é atualizada automaticamente.

Remover acesso impede novas consultas/alterações no servidor. Não apaga cópias
já trazidas para outros aparelhos. O texto explicativo fica disponível na seção.

## Recebi um convite (qualquer conta conectada)

Entrar com o mesmo Google indicado pelo responsável, abrir esta opção e colar
o código. **Participar desta família** aceita o convite e seleciona a família;
trazer frases continua sendo uma escolha explícita. O app não aceita automaticamente
um código só porque foi colado.

Histórico das alterações fica recolhido em uma opção própria, só do responsável.
As opções usam details/summary nativos, abrindo uma ação por vez em navegadores
com suporte ao agrupamento name. Sem dependência de animação ou mouse.

## Verificação

A suíte Node existente continua passando. O teste de navegador em
`tests/browser/simpler-phrases.cjs` usa API e Google simulados e também verifica:
formulários recolhidos, ajuda de permissões, convite copiável sem persistência,
consulta ao abrir, mudança de papel/remover acesso/cancelar com atualização,
aceitação de outro convite e controles de gestão ocultos para consulta.
Não foram enviados convites reais durante o desenvolvimento. O teste de uso
com outra conta Google permanece pendente após publicação.
