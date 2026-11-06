# Sakura — Rotina e Atividades V1

- Rotina por manhã/tarde/noite, tarefas opcionais iniciais, marcar/desmarcar e adiar. Reinício diário do estado de conclusão, conforme data local.
- Cadastro, exclusão e reordenação exigem sessão administrativa desbloqueada em Configurações. Proteção local da PWA, não autenticação de servidor.
- Desenho por mouse/toque, cores, espessura, apagar e exportar PNG. O desenho não é salvo automaticamente.
- Jogo de memória de quatro pares, sem cronômetro.
- Chuva e brisa sintetizadas, melodia original por Web Audio, volume limitado e parada manual ou ao ocultar a aba. Não utiliza streaming nem músicas comerciais.
- Dados da rotina em localStorage neste navegador. Não são incluídos automaticamente no backup antigo; não armazenar dados clínicos na rotina.
- Os demais módulos, Random Forest e navegação integrada foram preservados.

## Testes realizados

- Sintaxe JavaScript dos módulos verificada com Node.
- Teste Random Forest existente aprovado.
- Conferência estática de IDs HTML, arquivos e cache.

## Testes manuais necessários

- Navegação e layout em Android, tablet e computador.
- Bloquear/desbloquear PIN e verificar cadastro de atividades.
- Reinício diário, persistência, desenho com toque e exportação.
- Volume, parada do áudio e acessibilidade com leitor de tela.
- Atualização do PWA em instalações existentes; pode ser necessário recarregar a página.
