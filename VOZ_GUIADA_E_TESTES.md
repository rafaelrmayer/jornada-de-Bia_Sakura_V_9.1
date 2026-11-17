# Voz guiada — explorar e confirmar

Modo opcional, desativado por padrão, em **Apoio → Voz guiada — explorar e
confirmar**. Preferências acessíveis sem desbloqueio administrativo, assim como
os outros ajustes de acessibilidade.

## Uso

1. Ative Exploração com confirmação.
2. Em Minha Comunicação, Cartões ou nos símbolos/frases da tela inicial,
   escolha um item. A ação original fica aguardando confirmação.
3. Use Ouvir nome para uma prévia local, Confirmar escolha para executar a ação,
   ou Cancelar escolha. Escape também cancela.
4. Desativar voz guiada devolve o uso direto dos cartões.

A exploração e a prévia não acionam a comunicação, o aprendizado ou registros
do Jardim. Confirmar encaminha uma vez o clique à função original. Algumas
escolhas adicionam símbolos ou preparam uma sugestão; outras falam a frase.
Os botões explícitos de Falar e a ajuda urgente mantêm suas ações diretas.

O painel acompanha as telas de comunicação. Trocar de página, ocultar o app
ou iniciar outra fala limpa a escolha e interrompe a prévia. Uma escolha
removida ou cujo rótulo mudou precisa ser selecionada novamente.

## Voz e leitores de tela

A prévia usa SpeechSynthesis apenas com vozes identificadas pelo navegador
como locais (localService=true). Não chama as APIs nem usa a voz online do app.
Velocidade, volume e escolha de voz são próprios da prévia. Se não houver uma
voz local identificada, a confirmação visual continua disponível.

A fala final mantém as configurações atuais da seção Voz, inclusive a opção
online caso escolhida. Para comunicar offline, escolha uma voz do aparelho
também nessa seção. A disponibilidade e qualidade reais dependem do navegador,
do sistema e dos pacotes de voz instalados.

Anunciar ao receber foco é uma opção separada, desligada por padrão. Com
TalkBack/VoiceOver, mantenha essa opção desligada para evitar vozes sobrepostas.
O app não detecta automaticamente esses leitores e não os substitui. Não lê
campos de senha, PIN, e-mail ou campos editáveis automaticamente.

O foco pode anunciar os itens de comunicação e a navegação inferior. Foco
sozinho não escolhe nem comunica. Os anúncios rápidos são substituídos pelo
último foco. Uma comunicação em andamento tem prioridade sobre a prévia.

## Preferências e dados

São salvos somente enabled, focus, rate, volume e identificador da voz no
aparelho. Essas preferências entram no backup protegido do app e na limpeza
geral. Escolha pendente, texto da prévia, áudio e fila de fala não são salvos.
Falha de armazenamento permite usar os ajustes apenas durante a sessão.

## Verificações técnicas

Testes Node verificam normalização, limites, exclusão de vozes remotas,
preferências no backup/limpeza e presença dos arquivos no cache PWA.

O navegador com síntese simulada verifica modo normal, prévia sem aprendizado,
confirmação única, cancelamento, foco com substituição de anúncios rápidos,
prioridade da comunicação, Enter/Espaço, escolha alterada, campos privados,
ausência de voz local e funcionamento do PWA offline. Essas simulações não
comprovam qualidade de áudio ou gestos reais de TalkBack/VoiceOver.

Durante o teste móvel, o botão de ajuda foi encontrado sob a navegação fixa.
Sua posição agora respeita a altura real do menu e do aviso de instalação,
inclusive com o modo desligado.

## Roteiro de uso no celular — pendente

| Nº | Ação | Resultado esperado |
|---|---|---|
| 1 | Conferir o app antes de ativar. | Cartões continuam com seu comportamento normal. |
| 2 | Ativar, tocar uma frase e cancelar. | Não comunica nem registra uso antes de confirmar. |
| 3 | Selecionar e usar Ouvir nome. | Prévia audível com voz local; sem comunicar a frase. |
| 4 | Confirmar a frase. | Ação original executada uma vez. |
| 5 | Ajustar velocidade e volume da voz guiada. | Só os ajustes da prévia mudam; volume zero silencia a prévia. |
| 6 | Ativar anúncio de foco sem leitor de tela e explorar por teclado. | Anuncia itens focados, sem escolhê-los; Enter/Espaço pedem confirmação. |
| 7 | Com TalkBack/VoiceOver, manter anúncio automático desligado. | Navegação nativa preservada; confirmar/cancelar acessíveis e sem segunda voz automática do app. |
| 8 | Instalar uma voz local, carregar o PWA e testar sem internet. | Prévia local e interface disponíveis; fala final depende da voz escolhida. |
| 9 | Trocar de tela com escolha pendente e voltar. | Escolha antiga não é comunicada. |
| 10 | Desativar pelo painel e recarregar. | Uso direto restaurado e preferência preservada. |
| 11 | Verificar ajuda em tela estreita e com texto maior. | Botão acessível acima da navegação, sem confirmação adicional. |
| 12 | Exportar backup protegido. | Preferências incluídas; nenhuma escolha pendente ou áudio incluído. |

Este roteiro complementa os testes de banco; não altera a lista de 29 itens
da entrega do backend.
