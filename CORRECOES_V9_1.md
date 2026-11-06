# Sakura V9.1 — correção de inicialização e voz

- Corrigida exceção JavaScript causada por um seletor de tema removido do HTML (`colorThemeSelect`). O erro interrompia a configuração dos botões e a renderização de partes do aplicativo.
- Francisca Neural selecionada como preferência ao iniciar. Se o serviço remoto falhar, o navegador é utilizado como alternativa naquela reprodução.
- A disponibilidade real da voz online depende do serviço Edge-TTS configurado e de conectividade/CORS.
- PIN, biometria e modelos de IA não foram alterados.
- Não apague os dados do navegador. Extraia o ZIP inteiro antes de abrir index.html.
