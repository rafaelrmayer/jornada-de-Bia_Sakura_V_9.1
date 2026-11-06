# Jornada de Bia V9.6.7 — diagnóstico e correção de voz

- Timeout de 1,1 s ampliado para 8 s na primeira requisição de áudio.
- Removida suspensão automática de tentativas por 60 s.
- Cache de até 16 frases na memória da aba (sem persistência).
- Identificação de timeout, HTTP, reprodução e falha de rede/permissão no Console.
- Cancelamento de falas anteriores protegido por número de sequência.
- Visual, PIN e navegação não alterados.

**Importante:** a Francisca Neural requer acesso ao serviço remoto. O teste real no Firefox ainda é necessário. Em caso de erro, a voz local é usada para não silenciar a comunicação. O primeiro áudio pode demorar até 8 s se a rede falhar; frases já obtidas são reproduzidas do cache.
