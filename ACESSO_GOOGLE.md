# Conta opcional com Google

Esta versão retira os formulários de cadastro por senha, troca e recuperação.
Não existe senha nova do aplicativo para administrar: a pessoa escolhe sua conta
Google quando quer guardar/trazer frases pela nuvem. O PIN de organização do
aparelho e a senha do backup protegido continuam separados.

## Uso sem conta

Comunicação, organização de frases, lixeira, Jardim, exportação e restauração do
backup por arquivo continuam sem login. Os recursos locais funcionam offline;
as vozes dependem do que está instalado no aparelho. Conectar não envia nem
importa frases automaticamente.

## Uso com conta

1. Em Apoio → Conta e cópia das frases, desbloquear a organização.
2. Escolher **Conectar minha conta**. Somente então o app consulta a configuração
   do servidor e carrega o SDK oficial Google.
3. Usar **Continuar com o Google** e escolher a conta.
4. Guardar/Trazer frases continuam escolhas explícitas. As opções avançadas e as
   permissões familiares permanecem como antes.

Google não é carregado para entrar automaticamente e não há One Tap. Token
Google, desafio e sessão própria não são gravados em armazenamento ou backup.
Sair, bloquear a organização ou recarregar encerra a sessão do app, que dura até
15 minutos. Sair do app não encerra o Google do navegador nem revoga consentimento.

O Google pode usar seus próprios cookies ao ser escolhido. Não pedimos permissões
para ler Gmail, Drive, contatos ou arquivos. O backend valida o ID token e conhece
apenas a identidade necessária à conta, sem receber a senha Google.

## Preparar antes da publicação

O backend precisa da versão de acesso Google e da configuração OAuth. Consulte
[guia do backend](https://github.com/rafaelrmayer/jornada-de-bia-data-api/blob/main/ACESSO_GOOGLE.md).
O responsável ainda precisa criar o cliente Web no Google Cloud. Usar como origem
JavaScript autorizada `https://rafaelrmayer.github.io`, sem o caminho do app.
Nenhum client secret é usado pelo aplicativo ou por esta implementação.

O ID público fica no Render como GOOGLE_CLIENT_ID e é retornado pela API quando
configurada. Não há necessidade de colá-lo no HTML. Configuração ausente mostra
uma mensagem de indisponibilidade da conta, sem bloquear a comunicação local.

A conta existente deve ser vinculada explicitamente no servidor antes de
remover a autorização inicial de migração. Não recriar conta ou apagar dados.
Na primeira versão, entram contas Gmail ou Workspace; Google com e-mail de outro
provedor precisa de prova adicional e ainda não é aceito. Google cuida da
recuperação da conta Google, não do PIN local ou da senha de backup.

## Testes

Testes Node verificam chamadas e mensagens do cliente. O percurso de navegador
em `tests/browser/simpler-phrases.cjs` usa Google e API simulados; não faz login
real. Confere ausência de formulários antigos, entrada Google sem transferência
automática, tokens fora do armazenamento e o fluxo de frases/lixeira/backup.
O teste de popup, escolha de conta e vinculação real aguarda configuração.
