# V9.5.0 — redesign minimalista experimental

- Novo layout visual com paleta existente, sem alterar IDs de elementos ou remover páginas.
- Tela inicial mais limpa, cartões de comunicação prioritários, módulos secundários simplificados.
- A voz Francisca depende de serviço remoto; quando falhar, aviso visível indica uso da voz local.
- Timeout da tentativa online reduzido para 3,5s, ainda sujeito a atrasos e sem garantia de Francisca.
- **IMPORTANTE**: abrir via file:// pode causar falhas de CORS/origem para o serviço remoto. Testar via HTTPS em GitHub Pages ou Codespaces com serviço acessível e CORS configurado.
- Não houve testes de navegador, acessibilidade ou regressão automatizados; versão experimental.
- Preservar cópia de segurança e dados locais.
