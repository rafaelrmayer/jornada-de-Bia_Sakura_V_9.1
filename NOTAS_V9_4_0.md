# Jornada de Bia Sakura V9.4.0 — refinamento experimental

Base: V9.3.1 (PIN corrigido).

- Comunicação principal passa a abrir o conteúdo da tela inicial, com quatro escolhas em destaque.
- Criar símbolo fica visualmente separado, sem remover a ação.
- Módulos secundários vêm depois das intenções principais; apoios em linha discreta.
- Camada CSS isolada para tipografia, espaçamento, cartões, navegação e responsividade.
- Mantidas as cinco cores, modo escuro, recursos de acessibilidade e IDs originais.
- Francisca Neural permanece selecionada; timeout da voz online passa de 4 para 10 segundos para reduzir fallback prematuro, com indicação explícita quando a voz local for usada.

## Atenção
A voz Francisca depende do serviço online externo; 10 segundos é o máximo de espera antes de fallback e pode ser longo demais para comunicação imediata. É necessário validar no aparelho real e considerar cache seguro de áudios frequentes ou um mecanismo mais responsivo. O status exibido nas Configurações não é uma notificação global.

## Testes
1. Testar PIN e bloqueio de 30s; 2. voz Francisca com internet e fallback sem internet; 3. navegar em todos os módulos; 4. testar temas claro/escuro e alto contraste; 5. verificar tela pequena, zoom 200%, TalkBack e comunicação offline.
