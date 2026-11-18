# Saúde e cuidados no aparelho

A antiga aba Médico agora se chama Saúde e cuidados. O formulário contém apenas informações opcionais sobre alergias, nível de suporte informado pelo responsável, sensibilidades, preferências de cuidado e comunicação de dor ou desconforto.

Novos campos: como sinaliza, qual é o gesto, significado segundo o responsável, o que incomoda, o que ajuda e cuidados no atendimento. O significado de um gesto depende do contexto; o nível de suporte não gera recomendações automáticas. A data indica a última gravação pelo responsável, não uma validação clínica. Nenhum exemplo da Bia é preenchido automaticamente. Não há campos de CPF, endereço ou documentos. Plano de saúde e observações genéricas saíram do formulário.

## Armazenamento e acesso

- Dados salvos na chave local existente `medicalData`, sem endpoint ou alteração no backend.
- O formulário e a leitura para relatórios exigem a sessão administrativa local desbloqueada. Login Google e convites não concedem esse desbloqueio.
- Dados de saúde não entram nos backups completos ou de configuração. O importador também descarta `medicalData` de arquivos antigos e preserva as informações atuais do aparelho.
- Limpar os dados do navegador ou perder o aparelho pode eliminar essas informações. Backups exportados anteriormente podem conter saúde; esta atualização não modifica arquivos já baixados.
- O PIN protege o acesso pela interface. Não criptografa o armazenamento do navegador nem impede acesso por alguém com controle do dispositivo. Permissões de convidados protegem a conta compartilhada; não substituem a proteção do aparelho.

## Relatório do Jardim

Na revisão do relatório, o responsável pode marcar individualmente campos de saúde. Todos começam desmarcados em cada nova revisão. A prévia visual e o texto refletem somente os campos escolhidos. A seleção é temporária, não é gravada nas observações nem na conta. Ao bloquear a administração, a revisão é removida.

O PDF ou texto compartilhado é uma cópia fora do controle do aplicativo. A interface avisa isso antes da seleção. Não há envio automático a terapeutas ou convidados.

## Validação

95 testes Node passaram, incluindo exclusão de saúde na exportação e na leitura de backup legado. O fluxo Playwright com serviços simulados passou, verificando gravação local, data de atualização, seleção inicialmente vazia, inclusão apenas do gesto escolhido e remoção da prévia ao bloquear. Os cenários anteriores de compartilhamento, frases e permissões também passaram.

Após publicar: conferir campos no celular, salvar e reabrir, gerar uma prévia com e sem um campo selecionado e bloquear a administração. Não usar dados reais em testes de compartilhamento.
