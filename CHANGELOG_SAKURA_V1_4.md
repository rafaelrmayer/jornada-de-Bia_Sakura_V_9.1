# Jornada de Bia Sakura — V1.4

## Proteção local de sessão
- Integra a expiração após 10 minutos sem atividade com o modo Responsável.
- Revalida o prazo ao retornar à aba e no evento `pageshow`.
- Expõe uma ponte explícita para que o módulo de segurança possa atualizar a interface ao bloquear.
- Mantém a versão anterior preservada; esta é uma nova cópia de trabalho.

## Limites importantes
Esta camada é uma proteção local de conveniência. O PIN e a biometria atuais são mecanismos locais do navegador e não equivalem a autenticação validada no servidor. Não armazene dados altamente sensíveis contando apenas com este bloqueio.
