# 🌸 Jornada de Bia — Sakura

**Comunicação, autonomia e tecnologia assistiva.**

A Jornada de Bia é um projeto independente de Comunicação Aumentativa e Alternativa (CAA), criado por **Rafael Ricardo Mayer** a partir de uma necessidade pessoal: apoiar sua filha Bia a expressar desejos, necessidades, sentimentos e escolhas.

O aplicativo respeita diferentes formas de comunicação, incluindo símbolos, frases e gestos. Está publicado e em evolução, com testes técnicos e validação prática contínua. Não substitui acompanhamento profissional nem realiza avaliação clínica.

**[Abrir a Jornada de Bia](https://rafaelrmayer.github.io/jornada-de-Bia_Sakura_V_9.1/)**

## Começar a usar

1. Abra o aplicativo e explore **Comunicação**. As funções locais não exigem conta Google.
2. Personalize frases, categorias, símbolos e preferências conforme as necessidades da pessoa.
3. Em **Apoio**, ajuste aparência, acessibilidade e voz. A administração utiliza um PIN local.
4. Se desejar guardar e trazer frases entre aparelhos, conecte sua conta Google em **Apoio → Conta e backup**.

A aplicação é uma PWA: pode ser instalada em navegadores compatíveis. Após o carregamento e cache dos recursos, as funções locais podem ser usadas offline. A disponibilidade da voz offline depende das vozes instaladas no dispositivo. Conta online e serviços externos exigem conexão.

## O que o aplicativo oferece

| Área | Recursos |
|---|---|
| **Comunicação** | Frases e símbolos, categorias, reprodução por voz, criação de conteúdo, atalhos das frases mais usadas e lixeira local recuperável. |
| **Rotina** | Atividades por período, horários opcionais e organização pelo responsável. |
| **Música e atividades** | Desenho, sons, jogos visuais e atividades de exploração. |
| **Jardim da Bia** | Até cinco expressões em acompanhamento, flores, registros do adulto, contextos, apoio observado e variedade de funções comunicativas. |
| **Relatório para a fono** | Resumo semanal visual, contagens por expressão, contexto e função, observações e revisão antes de imprimir em PDF ou compartilhar texto. |
| **Saúde e cuidados** | Alergias, nível de suporte informado, sensibilidades, gestos de dor ou desconforto e preferências de atendimento, apenas no aparelho. |
| **Modo Calmo** | Ambiente e recursos voltados ao conforto sensorial. |
| **Apoio** | Quatro blocos: Aparência e acessibilidade, Voz, Conta e backup e Família e compartilhamento. |

A navegação principal mantém Saúde e cuidados e Modo Calmo como destinos separados. Cartões, símbolos e frases estão reunidos em Comunicação.

### Jardim e relatórios

O adulto registra se houve apoio, o contexto e a função comunicativa: pedir, recusar, comentar ou chamar atenção, entre as opções disponíveis. A captura opcional de um acionamento no aplicativo **não identifica espontaneidade**; o adulto revisa antes de a observação entrar no resumo.

As flores representam o acompanhamento, sem ranking ou notas. A consolidação de uma expressão é uma decisão manual com o responsável e a fono, não uma conclusão automática baseada em frequência.

Na revisão do relatório, informações de Saúde e cuidados só são incluídas se o responsável selecionar os campos. Todos começam desmarcados. A prévia permite conferir o conteúdo antes de gerar uma cópia.

## Conta Google e compartilhamento

O Google é usado para **entrada opcional na conta**, substituindo os formulários de senha e recuperação do aplicativo. Isso não move o banco para o Google Cloud: a API está no Render e o PostgreSQL no Neon.

- **Guardar minhas frases na conta** e **Trazer frases da conta** são ações explícitas.
- Não há sincronização automática em segundo plano. Edições conflitantes são revisadas por frase; exclusões não são propagadas automaticamente.
- Convites permitem **Só visualizar** ou **Pode editar** os cartões e categorias da família. O código é compartilhado manualmente e vale por 48 horas.
- Somente o responsável da família gerencia pessoas e consulta o histórico dos cartões da conta.
- Saúde, Jardim e relatórios não são disponibilizados aos convidados por esses convites.
- Revogar acesso à conta não apaga cópias que alguém já tenha importado ou recebido.

O login Google e o PIN administrativo local são mecanismos diferentes. O token da API fica apenas na memória da sessão, não no backup ou no armazenamento persistente do navegador.

## APIs e arquitetura

| Componente | Papel e limites |
|---|---|
| **Aplicativo web / GitHub Pages** | HTML, CSS e JavaScript; interface, dados locais e cache PWA. |
| **Data API / Render** | Backend Python com FastAPI: autenticação Google, famílias, categorias, cartões, revisão de edições, lixeira, convites, permissões e histórico. |
| **PostgreSQL / Neon** | Persistência dos dados da conta. A conexão do banco existe somente no backend. |
| **Google Identity Services** | Login com Google; a API valida a credencial antes de emitir a sessão própria do aplicativo. |
| **Web Speech API** | Vozes disponíveis no navegador/dispositivo. |
| **Serviço Edge TTS** | Opção de voz online; o texto solicitado é enviado ao serviço de voz. |
| **Neural API** | Demonstração opcional de ordenação de cartões, separada do uso cotidiano e restrita ao laboratório administrativo na interface. |

**Data API:** https://jornada-de-bia-data-api.onrender.com

**Repositório do backend:** [jornada-de-bia-data-api](https://github.com/rafaelrmayer/jornada-de-bia-data-api) — acesso conforme as permissões do repositório.

O navegador não recebe credenciais PostgreSQL, segredo JWT ou chaves privadas de serviços. CORS restringe as origens permitidas; autenticação e permissões são verificadas pela API. Hospedagens gratuitas podem apresentar espera ao reativar serviços após inatividade.

### Aprendizado e laboratório

O projeto contém aprendizado local, sugestões contextuais e experimentos com Random Forest e rede neural. A demonstração neural usa pesos sintéticos e pode executar no navegador; a consulta externa é opcional e explícita. Não é um modelo clinicamente validado nem determina a intenção da pessoa.

O laboratório fica oculto para contas comuns e depende da autorização específica do backend, além do desbloqueio local. Essa restrição da interface não torna o JavaScript público privado nem substitui controles próprios da API externa.

## Privacidade, saúde e backups

- Não há campos de CPF, endereço ou documentos no formulário de Saúde e cuidados.
- Saúde permanece no aparelho e exige desbloqueio administrativo para acesso pela interface. Não é enviada à conta nem incluída nos novos backups gerais.
- O importador descarta saúde de backups antigos. Arquivos já exportados anteriormente não são alterados por uma atualização do app.
- O backup local por arquivo é protegido com senha e criptografia. Essa senha não é o PIN e não é recuperada pelo Google.
- O banco da conta possui rotina de backup criptografado, separada do backup local. A restauração foi exercitada em ambiente separado; a primeira execução diária agendada foi conferida.
- O PIN protege a interface, mas não criptografa os dados locais do navegador. Limpar o navegador ou perder o aparelho pode eliminar informações locais, inclusive saúde, que não entra no backup geral.
- Um PDF ou texto exportado fica fora do controle do aplicativo. Compartilhe apenas o necessário com pessoas escolhidas pelo responsável.

Esses mecanismos não constituem, por si só, certificação de conformidade com a LGPD. O tratamento real dos dados e a proteção do dispositivo também precisam ser considerados.

## Acessibilidade e voz

Opções de texto ampliado, contraste, redução de movimento, alvos de toque e aparência ajudam a adaptar a experiência. A voz guiada opcional permite explorar e confirmar separadamente: a prévia não registra comunicação nem aprendizado.

O anúncio por foco vem desligado e deve ser avaliado junto com TalkBack ou VoiceOver para evitar falas sobrepostas. Compatibilidade com leitores de tela e uso em celulares continuam sujeitos a testes práticos; não há declaração de conformidade integral com WCAG.

## Executar localmente

O frontend não exige instalação de dependências ou compilação. Com Python 3 instalado, na pasta do repositório:

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Abra **http://localhost:8000**. Evite abrir `index.html` diretamente por `file://`, pois recursos de segurança e PWA dependem de um contexto apropriado.

Os recursos locais não precisam do backend. O acesso Google em desenvolvimento exige configuração da origem e do cliente OAuth correspondente; não habilite origens indiscriminadamente na API de produção.

### Verificação técnica

Com Node.js instalado:

```bash
node --test tests/*.test.cjs
```

O fluxo de navegador em `tests/browser/simpler-phrases.cjs` exige Playwright, Chromium e o site servido localmente:

```bash
BIA_TEST_SITE=http://127.0.0.1:8000 node tests/browser/simpler-phrases.cjs
```

Se necessário, informe o executável em `BIA_CHROMIUM_PATH`. O teste usa API, Google e vozes simulados, sem validar entrega de serviços reais. A suíte Node atual possui 95 testes; validação automatizada não substitui os testes de uso.

## Documentação por assunto

| Assunto | Guia |
|---|---|
| Comunicação unificada e frases mais usadas | [COMUNICACAO_UNIFICADA.md](COMUNICACAO_UNIFICADA.md) |
| Lixeira local e recuperação | [FRASES_E_LIXEIRA.md](FRASES_E_LIXEIRA.md) |
| Entrada com Google | [ACESSO_GOOGLE.md](ACESSO_GOOGLE.md) |
| Convites e permissões | [COMPARTILHAR_FAMILIA.md](COMPARTILHAR_FAMILIA.md) |
| Organização do Apoio | [APOIO_ORGANIZADO.md](APOIO_ORGANIZADO.md) |
| Saúde local e inclusão no relatório | [SAUDE_E_CUIDADOS.md](SAUDE_E_CUIDADOS.md) |
| Voz guiada e testes | [VOZ_GUIADA_E_TESTES.md](VOZ_GUIADA_E_TESTES.md) |
| Laboratório administrativo | [LABORATORIO_ADMIN.md](LABORATORIO_ADMIN.md) |
| Texto de apresentação para redes sociais | [DIVULGACAO_REDES_SOCIAIS.md](DIVULGACAO_REDES_SOCIAIS.md) |

Arquivos `CHANGELOG_*`, `NOTAS_*` e documentos de versões anteriores registram a evolução do projeto. Algumas instruções históricas, como login por senha, foram substituídas pelos fluxos descritos neste README.

## Próximas validações

- Conferir permissões de consulta e edição com uma segunda conta real.
- Repetir o teste de lixeira e restauração na interface simplificada.
- Conferir Saúde e cuidados e a seleção no relatório após publicar.
- Continuar os testes de voz, navegação e acessibilidade em dispositivos reais.

## Autor

**Rafael Ricardo Mayer** — desenvolvedor e pesquisador independente, com interesse em inteligência artificial, acessibilidade, educação e tecnologia assistiva.

[GitHub](https://github.com/rafaelrmayer) · [LinkedIn](https://www.linkedin.com/in/rafael-ricardo-mayer-478647a4/) · [Portfólio](https://rafaelrmayer.github.io/)

**Comunicação é um direito. A tecnologia deve ajudar a torná-lo acessível.**
