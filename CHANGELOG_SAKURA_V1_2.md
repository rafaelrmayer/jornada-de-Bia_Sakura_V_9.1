# Jornada de Bia Sakura V1.2 — correções de contraste

## Ajustes
- Corrigido o contraste dos textos da área de desbloqueio biométrico nas configurações, usando as cores legíveis do tema ativo.
- O aviso de teste da biometria agora tem superfície, texto e borda adaptados ao tema ativo.
- O banner de instalação do aplicativo agora adapta o fundo e o texto aos temas escuros e claros, evitando o retângulo branco com texto ilegível.
- Atualizada a chave de cache do Service Worker para `jornada-bia-sakura-v1-2`.

## Testes recomendados
1. Abrir Configurações no modo claro e verificar o texto “Desbloqueio biométrico”, o status e os botões.
2. Alternar para os temas escuros rosa, azul e verde e verificar o aviso de teste da biometria.
3. Se o banner de instalação aparecer, verificar contraste de texto e botão em cada tema.
4. Confirmar no Chrome do Xiaomi após publicar a versão. A correção foi verificada no código; a validação visual final depende do teste no aparelho.

## Segurança
A biometria continua sendo uma prova de conceito local via WebAuthn; esta versão não implementa validação por servidor.
