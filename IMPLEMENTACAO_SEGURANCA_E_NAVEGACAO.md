# Jornada de Bia Sakura — revisão integrada (experimental)

Base: ZIP fornecido pelo usuário. Arquivos originais preservados fora deste pacote.

## Implementado
- Removidos os cartões de seleção Modo Bia / Modo Responsável e o seletor de modo da tela inicial.
- Quatro entradas de navegação integradas, com layout responsivo. Minha Comunicação reutiliza o módulo existente. Rotina, Música e Atividades e Assistente Inteligente são **telas preparatórias**, não funcionalidades concluídas.
- Área de apoio em Configurações para Médico, Categorias, Modo Calmo e Responsáveis.
- Configurações acessíveis sem desbloqueio, mas seções de perfil, backups e biometria ocultas até autenticação.
- Acesso a Médico e edição de símbolos redirecionado a Configurações quando bloqueado.
- Guardas em ações de alteração de dados, backups e exclusões.
- Botão de desbloqueio/bloqueio administrativo em Configurações, reutilizando PIN/biometria.
- Bloqueio por inatividade preservado, com fechamento dos modais administrativos.
- Cache PWA versionado para evitar servir a interface antiga.

## Limitações e próximos testes
- A autenticação é **local** e não protege contra manipulação do navegador, leitura direta do armazenamento ou acesso ao dispositivo. Dados médicos não devem ser considerados criptografados em repouso. Para proteção robusta é necessário armazenamento criptografado/autenticação em servidor.
- Os módulos de Rotina, Atividades e Assistente ainda não foram implementados; são apenas pontos de entrada.
- Testes automatizados executados: verificação de sintaxe JS e teste existente de Random Forest. Não foi executado teste visual de navegador ou teste ponta a ponta de PIN/biometria/backup.
- Validar manualmente em Chrome Android, tablet e computador; conferir PWA instalada, acesso por PIN, biometria, bloqueio após inatividade, edição de símbolos, restauração de backup e contraste dos temas.
- A função de histórico e ações administrativas agora exigem desbloqueio, incluindo limpeza de histórico.
- Não publicar como sistema seguro para dados sensíveis antes de revisão de segurança mais ampla.
