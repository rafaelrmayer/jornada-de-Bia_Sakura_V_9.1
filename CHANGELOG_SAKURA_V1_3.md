# Jornada de Bia Sakura V1.3 — Correção da notificação de biometria

## Correção
- Ajustado o componente `.toast-message` para usar `--primary-dark` no fundo, `--text` no texto e `--accent` na borda.
- O aviso deve acompanhar a paleta ativa nos temas claros e escuros, evitando texto branco sobre fundo branco.
- Ajustada a largura e quebra de texto para telas pequenas, incluindo Chrome no Android.
- Atualizado o nome do cache do service worker para forçar a instalação dos novos arquivos.

## Teste recomendado
1. Publicar os arquivos desta versão no repositório Sakura.
2. No Chrome do Xiaomi, abrir a aplicação e, se necessário, fechar e reabrir para atualizar o cache.
3. Testar a mensagem de ativação biométrica nos temas escuros rosa, azul e verde e no modo claro.

## Limitação
Esta alteração corrige o estilo da notificação da aplicação. A autenticação biométrica continua sendo uma prova de conceito local e ainda não tem validação por servidor.
