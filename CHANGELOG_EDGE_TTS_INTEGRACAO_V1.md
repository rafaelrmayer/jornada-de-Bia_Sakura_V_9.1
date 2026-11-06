# Integração Edge-TTS — V1

- Adicionada a opção **Francisca Neural (online)** no seletor de voz.
- A fala online usa o serviço Edge-TTS hospedado no Render (`/api/tts`).
- Mantida a síntese nativa do navegador como opção e fallback em caso de falha do serviço.
- A opção online requer conexão com a internet e envia o texto da mensagem ao serviço para gerar o áudio.
- Não altera o serviço independente nem publica o aplicativo.

## Teste recomendado
1. Abrir o app localmente.
2. Em Configurações > Voz, selecionar **Francisca Neural (online)**.
3. Usar **Ouvir esta voz** e depois montar uma frase curta.
4. Desconectar a internet e confirmar que a opção do navegador continua disponível.
