# Gravação segura da Rotina

A rotina continua local, na chave `bia-routine-sakura-v1`. Este ajuste não adiciona transferência pela conta Google.

## O que foi corrigido

- As alterações são feitas em uma cópia e só aparecem como salvas depois de `localStorage.setItem` concluir.
- Erros de leitura ou gravação impedem sobrescrita e mostram um aviso persistente junto dos controles da rotina.
- Nome e horário digitados são limpos apenas após gravação bem-sucedida. Uma falha permite tentar novamente.
- Antes de gravar, o módulo compara a versão persistida com a que havia lido. Se outra aba ou uma restauração alterou os dados, a ação é interrompida e a versão atual é carregada, com aviso para conferir e repetir a ação. O texto digitado é preservado.
- Web Locks serializa as gravações entre abas compatíveis. Em navegadores sem essa API, permanece a verificação de versão, mas ela não oferece a mesma garantia para gravações exatamente simultâneas. Não há sincronização entre dispositivos.
- Inclusão, exclusão, ordem, conclusão, pausa, sugestão, preferência e virada do dia usam a mesma gravação protegida. A permissão administrativa das ações de organização é conferida também no momento da gravação.
- Dados antigos sem a preferência de sugestões continuam com o comportamento existente. Conteúdo inválido não é substituído automaticamente.

## Validação

102 testes Node e o fluxo geral Playwright passaram. Novo teste `tests/browser/routine-safe-save.cjs` verifica:

1. Inclusões em duas abas, interrupção da aba antiga e nova tentativa preservando ambas.
2. Inclusões simultâneas com Web Locks: uma é salva e a outra pede revisão.
3. Falha de armazenamento na inclusão, conclusão e preferência, sem alterar dados persistidos ou exibir uma inclusão não salva.
4. Preservação do texto, nova tentativa, recarga e virada do dia.

O teste usa servidor local, bloqueia serviços externos e não altera dados de produção.

## Conferência após publicar

Atualizar o aplicativo, criar uma atividade de teste e recarregar. Em duas abas do mesmo navegador, criar uma atividade em cada uma: a aba antiga deve pedir revisão antes de salvar. A rotina do celular não deve ser apagada para testar.
