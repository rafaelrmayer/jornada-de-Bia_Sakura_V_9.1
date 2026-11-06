# Revisão de segurança — Sakura V1.4

- O módulo agora sincroniza o bloqueio por inatividade com a função de interface `setGuardianMode`.
- O relógio é reavaliado ao retornar à aba e em `pageshow`; timers em segundo plano podem ser atrasados pelo navegador, por isso a verificação ao retorno é essencial.
- A contagem depende de `sessionStorage` e JavaScript do cliente; não é uma barreira contra alguém com acesso ao dispositivo e ferramentas de desenvolvedor.
- `SecurityService` permanece local. A biometria/WebAuthn existente não deve ser descrita como autenticação de servidor: falta desafio gerado e validado no backend, validação de origem/RP ID e verificação de assinatura no servidor.
- Próxima etapa para segurança real: implementar endpoints no Cloudflare Worker e armazenamento D1 para cadastro de credenciais e desafios de uso único; só depois conectar o front-end.
