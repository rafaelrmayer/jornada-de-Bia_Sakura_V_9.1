# V9.3.0 — PIN (primeira etapa)
- Base: V9.2.9; visual e comunicação preservados.
- Contador de tentativas agora persistido em localStorage entre recargas e abas (em vez de sessionStorage).
- Bloqueio progressivo após cinco falhas, de 30 segundos até 15 minutos; sucesso zera contador.
- Entradas inválidas também contam como falha; verificação concorrente na mesma aba bloqueada.
- PIN existente e hash PBKDF2 mantidos, sem migração destrutiva.
- Cache da PWA atualizado para V9.3.0.
## Limites importantes
A segurança inteiramente no navegador NÃO resiste a alguém com acesso ao DevTools/armazenamento local. PIN de 4 dígitos tem baixa entropia; dados locais não são criptografados pelo PIN. A autenticação de servidor e proteção dos dados exigem trabalho posterior. Biometria não foi alterada nesta versão.
## Testes manuais
1. Com PIN existente, desbloquear normalmente; comunicação sem PIN.
2. Errar 5 vezes, recarregar, confirmar bloqueio persistente.
3. Após 30 segundos, tentar novamente; acertar e confirmar desbloqueio.
4. Confirmar bloqueio automático da administração após 10 minutos sem atividade.
5. Verificar acessibilidade e temas da V9.2.9.
