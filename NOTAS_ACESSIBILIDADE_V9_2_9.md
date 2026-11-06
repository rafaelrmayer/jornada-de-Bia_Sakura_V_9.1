# V9.2.9 — Acessibilidade ampliada (experimental)

Base: V9.2.8. Adicionados controles locais e opcionais em Configurações: texto ampliado, contraste reforçado, espaçamento para toque, movimento reduzido e confirmação visual de frases. Preferências armazenadas localmente; nenhuma alteração intencional em PIN, biometria, IA ou banco de dados. Cache do service worker atualizado.

## Limites e validação pendente

- Alto contraste é uma opção inicial, **não certificação WCAG**: verificar cada tema e componente, incluindo texto sobre fundos coloridos.
- Ampliar texto não garante ausência de corte a 200%/400%; verificar no celular e desktop.
- Espaçamento maior não cobre todos os componentes dinâmicos e não equivale a teste com dispositivos assistivos.
- Redução de animações não equivale a silenciar todas as atividades sonoras.
- A confirmação de frases é adicional; não substitui escolha da criança nem altera fala.
- Não foram adicionadas ações de desfazer em fluxos existentes, para evitar alterações arriscadas de estado sem testes.
- Testar com TalkBack, teclado, zoom e diferentes perfis; ainda não foi validado por usuários.
