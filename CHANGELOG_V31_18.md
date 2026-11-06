# V31.18 — Preparação para testes de biometria no Xiaomi

- Mantido o visual aprovado da V31.17 e as funcionalidades existentes.
- Atualizado o nome do cache offline para evitar reutilizar recursos de versões anteriores.
- Melhoradas as mensagens da seção de biometria, com instruções para HTTPS e criação prévia do PIN.
- Deixado explícito na interface que esta etapa é uma prova de conceito WebAuthn local, sem validação por servidor.

## Limitações importantes

Esta versão serve para verificar compatibilidade do navegador/autenticador no aparelho. A verificação de assinatura e o desafio são gerados no cliente, portanto não equivalem a autenticação WebAuthn confiável de servidor. Não utilizar como proteção única de dados médicos ou outros dados sensíveis. A próxima etapa de segurança deve integrar um backend que gere desafios, valide registro/autenticação e mantenha as credenciais no servidor.

## Teste no Xiaomi

1. Publique em um endereço HTTPS (GitHub Pages serve para o teste de frontend).
2. Abra o site no Chrome do Xiaomi.
3. Crie um PIN no Modo Responsável, se ainda não houver um.
4. Em Configurações > Segurança e biometria, configure a biometria.
5. Bloqueie e desbloqueie o Modo Responsável para testar a solicitação do autenticador.
6. Teste também o PIN alternativo e confirme que os cartões de comunicação continuam funcionando.
7. Não inclua dados pessoais reais da Bia no repositório de teste.
