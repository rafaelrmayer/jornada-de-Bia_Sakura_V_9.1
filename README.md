# 🌸 Jornada de Bia | Sakura V9.1

### Comunicação, autonomia e tecnologia assistiva

**“Não é sobre ensinar alguém a falar. É sobre garantir que sua voz possa ser ouvida.”**

A **Jornada de Bia** é um projeto independente de tecnologia assistiva, desenvolvido para apoiar a comunicação de pessoas autistas com necessidades complexas de comunicação.

O projeto nasceu de uma motivação pessoal: criar uma ferramenta que ajude minha filha Bia a expressar desejos, necessidades, sentimentos e escolhas de maneira mais acessível.

A proposta é simples: colocar a tecnologia a serviço da comunicação, respeitando a individualidade de cada pessoa.

**Desenvolvido por Rafael Ricardo Mayer.**

---

## 🌐 Experimente a Jornada de Bia

**[Abrir o aplicativo — Sakura V9.1](https://rafaelrmayer.github.io/jornada-de-Bia_Sakura_V_9.1/)**

A aplicação é desenvolvida para a web, com recursos de Progressive Web App (PWA), permitindo experiências de uso em computadores e dispositivos móveis compatíveis.

**Estado atual:** versão Sakura V9.1 publicada, em evolução e validação contínua.

---

## ❤️ Por que a Jornada de Bia existe?

A comunicação não acontece de uma única maneira.

Para algumas pessoas, palavras faladas não são o principal caminho para expressar pensamentos, sentimentos e necessidades. A Comunicação Aumentativa e Alternativa (CAA) pode oferecer outras possibilidades.

A Jornada de Bia procura construir uma experiência que seja:

- **Acessível:** com navegação visual e recursos de apoio.
- **Personalizável:** com cartões e conteúdos adaptáveis.
- **Acolhedora:** com atenção à experiência sensorial.
- **Progressiva:** com melhorias baseadas em testes e observações.
- **Responsável:** com cuidado especial em relação à privacidade e aos dados.

A ferramenta não pretende substituir acompanhamento profissional, métodos de CAA estabelecidos ou a participação das pessoas responsáveis.

---

## ✨ Funcionalidades

### Comunicação visual

- Cartões com símbolos e frases.
- Categorias para expressar desejos, necessidades e sentimentos.
- Construção de frases a partir de cartões.
- Reprodução de mensagens por síntese de voz.
- Criação e personalização de cartões.

### Personalização

- Temas visuais e opções de aparência.
- Configuração de voz.
- Perfil da criança e informações do responsável.
- Organização de conteúdos e preferências.

### Recursos de apoio

- Rotinas e atividades.
- Recursos voltados ao conforto sensorial.
- Informações de apoio para responsáveis.
- Experiência adaptada para uso em diferentes dispositivos.

### Modo Responsável

Área destinada à configuração e administração do aplicativo, incluindo recursos de proteção de acesso.

A autenticação biométrica disponível no projeto é experimental e não equivale a uma solução de autenticação validada por servidor.

---

## 🧠 Inteligência artificial e personalização

A Jornada de Bia também é um ambiente de pesquisa e experimentação com métodos de aprendizado de máquina.

Entre os componentes estudados estão:

- Registro local de interações.
- Identificação de padrões de utilização.
- Sugestões contextuais.
- Modelos experimentais de Random Forest.
- Possibilidades futuras de arquiteturas adaptativas com redes neurais artificiais.

**Importante:** os modelos experimentais não possuem validação clínica e não devem ser interpretados como sistemas capazes de determinar autonomamente o que uma pessoa deseja comunicar.

A pessoa que utiliza o aplicativo deve manter o controle sobre a comunicação.

---

## ♿ Acessibilidade

A acessibilidade é um requisito central do projeto.

As áreas de trabalho incluem:

- Navegação por toque e teclado.
- Identificação acessível de controles.
- Compatibilidade com tecnologias assistivas.
- Legibilidade, contraste e temas.
- Clareza visual e previsibilidade da interface.
- Redução de barreiras na comunicação.

A compatibilidade com leitores de tela, incluindo TalkBack, está em processo de avaliação prática. A implementação de recursos acessíveis não significa, por si só, conformidade integral com as WCAG.

---

## 🔊 Síntese de voz

O aplicativo utiliza recursos de voz do navegador e possui integração experimental com a voz online **Francisca Neural**.

A reprodução online depende da conectividade e da disponibilidade do serviço externo. Existe uma estratégia de voz alternativa no navegador, cuja confiabilidade está sendo testada.

A prioridade é que a comunicação permaneça disponível mesmo diante de limitações técnicas.

---

## 🔐 Privacidade e segurança

A Jornada de Bia trabalha com informações que podem ser sensíveis, especialmente quando envolvem crianças.

O projeto incorpora mecanismos como:

- Persistência local de dados.
- Proteção de acesso por PIN.
- Recursos experimentais de biometria.
- Backup e restauração.
- Verificações de integridade.
- Recursos de funcionamento offline.

**Limitações importantes:** por ser uma aplicação predominantemente client-side, as proteções locais não equivalem a uma arquitetura de segurança com servidor confiável. O aplicativo não deve ser tratado como armazenamento seguro de informações médicas sensíveis sem medidas adicionais de proteção.

A conformidade com a LGPD depende também das práticas reais de coleta, tratamento, armazenamento e compartilhamento de dados.

---

## 🛠️ Tecnologias

| Tecnologia | Aplicação |
|---|---|
| HTML5 | Estrutura da interface |
| CSS3 | Estilos e temas |
| JavaScript | Funcionalidades e interação |
| Web Speech API | Síntese de voz do navegador |
| PWA / Service Worker | Recursos de instalação e cache |
| WebAuthn | Experimentos de autenticação |
| Random Forest | Aprendizado de máquina experimental |
| GitHub Pages | Publicação da aplicação |

---

## 📂 Estrutura do projeto

```text
jornada-de-Bia_Sakura_V_9.1/
├── index.html
├── css/
├── js/
│   ├── app.js
│   ├── storage.js
│   ├── security.js
│   ├── backup.js
│   ├── random-forest.js
│   └── ...
├── icons/
├── manifest.json
├── sw.js
└── README.md
```

A estrutura acima é resumida. O repositório contém módulos adicionais de acessibilidade, atividades, segurança e interface.

---

## 🚧 Estado do desenvolvimento

A Sakura V9.1 está publicada e disponível para testes.

As prioridades atuais são:

1. Validar a navegação com TalkBack.
2. Investigar a confiabilidade da primeira reprodução de voz.
3. Revisar acessibilidade e experiência de uso.
4. Continuar a estabilização e os testes de segurança.
5. Documentar as funcionalidades e limitações de cada versão.

O desenvolvimento é incremental, com prioridade para estabilidade, acessibilidade e preservação das funcionalidades existentes.

---

## 👨‍💻 Sobre o desenvolvedor

**Rafael Ricardo Mayer**

Desenvolvedor e pesquisador independente, com interesse em inteligência artificial aplicada, acessibilidade, educação e tecnologia assistiva.

A Jornada de Bia integra um conjunto de projetos que procuram explorar como a tecnologia pode contribuir para uma sociedade mais inclusiva.

> Não quero apenas deixar um legado de tecnologia para minhas filhas. Quero ajudar a construir o mundo em que elas vão viver, e contribuir para que esse mundo também seja melhor para outras pessoas.

**[GitHub](https://github.com/rafaelrmayer)** · **[LinkedIn](https://www.linkedin.com/in/rafael-ricardo-mayer-478647a4/)** · **[Portfólio](https://rafaelrmayer.github.io/)**

---

## ❤️ Uma mensagem final

A Jornada de Bia não nasceu apenas como um exercício de programação.

Nasceu da vontade de ouvir, compreender e construir possibilidades.

Cada cartão, cada frase e cada melhoria representam uma tentativa de diminuir a distância entre aquilo que alguém deseja expressar e aquilo que o mundo consegue compreender.

**Comunicação é um direito. A tecnologia deve ajudar a torná-lo acessível.**

🌸 **Jornada de Bia**

*Desenvolvido com amor, pesquisa e tecnologia por Rafael Ricardo Mayer.*

**Sempre rumo à utopia e ao horizonte. ♾️**

## Cartões e Neural API (integração opcional)

Meus cartões contém um painel com cinco cartões de atividades e duas opções
fixas. Os cartões funcionam e falam com o mecanismo de voz existente mesmo sem
API. Não substituem frases personalizadas ou categorias.

Por padrão, a ordenação usa a rede 9 → 16 → ReLU → 5 diretamente em JavaScript,
com os pesos sintéticos exportados do treinamento reproduzível da Neural API.
Não depende de servidor ou bibliotecas externas. A inferência não envia contexto
à rede. A voz continua usando a preferência existente do aplicativo, que pode
incluir um serviço externo. O último cartão fica apenas na memória da sessão;
escolher uma opção fixa limpa esse ID.

Em Configurações, desbloqueie a administração para selecionar “API externa” e
informar um endereço base HTTPS. Somente nesse modo, ao clicar em “Atualizar cartões”, o navegador envia período do dia e ID do último
cartão. Não envia perfil, nome ou histórico de frases. Selecione “Neste aparelho”
para voltar ao cálculo local. Consultas externas nunca são automáticas. A ordenação local ocorre ao entrar na página.

A API deve permitir a origem https://rafaelrmayer.github.io via CORS e carregar o
modelo cards-demo. Uma origem inclui protocolo e domínio, sem caminho do projeto.
O Colab com TestClient não fornece um endereço público para este recurso.
A publicação HTTPS da API é uma etapa separada.

O modo local ordena ao entrar na página ou ao atualizar. Resposta inválida,
timeout de cinco segundos ou indisponibilidade preservam as opções. Os textos
são locais; a resposta externa deve corresponder ao contrato exato. As duas
opções fixas não são ordenadas. A demonstração usa dados sintéticos e não foi
validada como personalização. Os pedidos não incluem credenciais.

Verificação: `node --test tests/*.test.cjs`.


### Pesos da demonstração no navegador

`js/card-model-data.js` contém os pesos sintéticos, vocabulário e versão do
PyTorch de origem. `js/card-model.js` executa as duas camadas lineares e ReLU;
não treina nem registra escolhas. As pontuações servem apenas para ordenar.
O modelo não superou a regra simples nos dados sintéticos (55,3% contra 57,3%).
Não foi validado como personalização para a Bia.

Para atualizar a exportação, gere um checkpoint com
`scripts/train_cards_demo.py` do repositório neural-api, depois execute, em um
ambiente com PyTorch: `python scripts/export-card-model.py /caminho/modelo.pt`.
O script exporta os pesos e 18 referências de teste. Os testes Node comparam
pontuações (tolerância 1e-5) e ordenação exata para todos os contextos válidos.

Após o primeiro carregamento online, o service worker inclui os pesos e o motor
local no cache para uso offline. Se algum recurso local falhar, os sete cartões
continuam disponíveis. Publicação em GitHub Pages depende da integração do PR.

### Página Meus cartões

O início apresenta apenas um acesso a Meus cartões. A página própria reúne os
cinco cartões da demonstração, as duas opções fixas e o acesso expansível aos
símbolos cadastrados. Também está disponível no menu principal e na navegação
inferior. Minha Comunicação mantém frases, categorias e favoritos.

Ao entrar em Meus cartões, o modo local calcula a ordem uma vez, com o período
do dia e o último cartão escolhido na sessão. A ordem não muda durante a escolha;
o botão Atualizar cartões permite recalcular explicitamente. No modo externo,
a abertura da página não inicia pedidos: atualizar continua exigindo o botão.
Não há painel de sugestões no início nem avisos flutuantes.

A interface de comunicação apresenta cartões, sem anunciar sugestões. A natureza
experimental/sintética do modelo está explicada em Configurações e nesta
documentação. O modelo não aprendeu preferências reais nem classifica novos
símbolos personalizados: o repertório neural continua com cinco classes. Os
símbolos personalizados permanecem disponíveis, sem alteração de seus dados.

### Navegação inferior

A barra inferior permanece visível também na página inicial, com Início,
Comunicação, Rotina, Atividades, Assistente, Cartões e Apoio. Os quatro atalhos
duplicados em “Outras atividades” foram removidos do início; os acessos de apoio
(Médico, Categorias, Modo Calmo e Configurações) continuam disponíveis.

Em celular, a barra usa duas linhas para preservar alvos de toque e rótulos;
em telas largas, uma linha. navigation-layout.js mede a altura real da barra e
do aviso de instalação, reservando espaço no documento e posicionando o aviso
acima da navegação. O cache PWA inclui o novo controlador de layout.

### Visual Sakura acolhedor

O início concentra quatro escolhas: Quero, Preciso, Como estou e Meus cartões,
com ícones maiores, fundos sólidos e detalhes em rosa suave (ou a paleta do tema).
Eu estou aqui permanece como ação separada. Criar símbolo, Médico, Categorias,
Modo Calmo, Música e Atividades e Assistente ficam em Apoio; a proteção
administrativa existente permanece. O menu inferior reúne cinco destinos.

Meus cartões apresenta ícones com frases, alvos de toque maiores e indicação da
escolha via borda/fundo e aria-pressed. Não altera a ordem durante a escolha.
As opções fixas continuam presentes. Os estilos estão em css/sakura-friendly.css,
incluído no cache PWA, com variantes para temas escuros e alto contraste. Não
introduz animações ou reprodução automática.

### Fundos em degradê e paleta azul

As paletas selecionáveis são rosa e azul, com modo escuro independente. Verde e
verde escuro salvos anteriormente migram para azul e azul escuro, respectivamente.
O fundo usa degradês estáticos (rosa chá/pêssego/creme ou azul céu), sem galhos,
pétalas ou textura decorativa. A flor pequena do cabeçalho permanece.

O cabeçalho usa um tom mais profundo para manter o nome e o subtítulo brancos
legíveis. Os cartões preservam fundos claros e textos escuros; os temas escuros
e alto contraste continuam disponíveis. Testes de paleta cobrem migração,
restauração e alternância claro/escuro.

Música voltou ao menu inferior, abrindo Música e Atividades. A barra usa seis
destinos, em uma linha no computador e duas de três no celular. O acesso em Apoio
permanece disponível.

### Memória contextual e avaliação do Random Forest

As novas escolhas de frases são armazenadas em contextBrainData como registros
versionados (recordVersion: 2), separados por contexto/sequência e frase. Repetir
uma frase incrementa somente sua contagem; escolher outra mantém ambas.
contextKey contém as entradas do modelo, enquanto a chave de armazenamento inclui
a identidade da frase. RF e MLP usam contextKey explicitamente para evitar que o
rótulo da resposta vaze para as entradas.

Registros antigos permanecem intactos no armazenamento e nos backups. Como o
contador antigo podia acumular escolhas de frases sobrescritas, cada registro
antigo recebe peso 1 na preparação dos dados, não seu contador bruto. Não é
possível recuperar as alternativas antigas perdidas. O painel distingue novas
escolhas de registros antigos com contagem não verificada. Atualizações não
reiniciam nem apagam o histórico automaticamente.

Random Forest e rede neural local MLP continuam em observação e não substituem
as frases do motor contextual. Ambos executam offline; o RF funciona mesmo sem a
MLP. Esta rede local de comparação é distinta do modelo de cinco cartões,
exportado do PyTorch, e do serviço Neural API. Nenhum dado é enviado pelo treino
local. A atualização não adiciona coleta remota ou treinamento da Neural API.

Execute `node scripts/evaluate-random-forest.cjs` para uma avaliação fictícia
controlada: 32 contextos de treino, 16 contextos de teste distintos, duas frases
associadas artificialmente ao ambiente. Com a semente atual, o RF acertou 100%
nesse teste e a regra de frase mais frequente 50%; a estimativa interna OOB foi
21,875%. A discrepância e a simplicidade do cenário impedem concluir utilidade
real. OOB é calculado sobre linhas agregadas de contexto/frase, não sobre eventos
independentes de uso. Não comparar esses números com os da rede neural de
cartões, pois os dados e a tarefa são diferentes. Esse teste não usa escolhas da
Bia e não valida personalização.

Os testes cobrem alternativas preservadas, contagens independentes, leitura de
legados sem mutação, separação entre rótulos e entradas, assinatura de cache,
repetibilidade do RF, contextos insuficientes e manutenção da frase do motor
contextual enquanto os modelos observam.

### Frases personalizadas e aprendizado contextual

Salvar ou editar em Minha Comunicação → Nova frase só modifica o repertório.
Tocar no botão de falar de uma frase personalizada registra uma escolha no
histórico contextual, além do contador geral de uso. O registro acompanha a ação
explícita, não confirma que a reprodução de áudio terminou. O caminho usa intenção
frase-personalizada e sequência none, sem associar símbolos/intenção deixados no
construtor. Usa ambiente selecionado (auto permanece auto, sem inferir a partir de
símbolos antigos) e período atual. Alternativas mantêm contagens separadas.

O painel do Assistente é atualizado ao abrir e após essa escolha. Repetir uma
frase aumenta seu contador, mas não cria novos pares contexto/frase para atingir
artificialmente o mínimo de linhas de treinamento. Não há aprendizado ao cadastrar,
editar ou visualizar a lista. Falha no aprendizado não bloqueia a fala. Os dados
continuam locais e os modelos permanecem em observação.

### Apagar frases cadastradas em lote

No fim da lista de Minha Comunicação, Apagar todas as frases remove apenas o
repertório de frases personalizadas deste navegador, de todas as categorias,
inclusive quando há um filtro ativo. Exige administração desbloqueada e uma
confirmação com a quantidade total. Cancelar não modifica dados. Categorias,
símbolos, favoritos, configurações e todo o aprendizado/modelos são preservados.
A exclusão não remove frases já aprendidas: elas podem continuar no diagnóstico
dos modelos. O botão fica desativado quando não há frases cadastradas.

### Avaliação manual do Random Forest (sem aprender com a resposta)

Em Apoio → Assistente, o painel de avaliação exige administração desbloqueada.
Escolha ambiente e período e clique em Iniciar teste. O RF de 21 árvores/semente
731 e a regra de frase mais frequente recebem o mesmo retrato do histórico local,
com tratamento conservador dos legados. O contexto de consulta é frase
personalizada/sem símbolos. As previsões são congeladas antes da escolha e
ocultas até a conclusão; o resumo de comparação anterior também é ocultado
enquanto há teste pendente.

Abra Minha Comunicação e toque no botão de falar de uma frase. Somente esse
caminho conclui o teste. O clique continua falando conforme a voz configurada,
mas não incrementa aprendizado nem uso geral. Não reordena a lista. Uma escolha
conclui um teste; as seguintes voltam ao uso normal. Há aviso e cancelamento na
Comunicação. Recarregar cancela a pendência; bloquear administração também
invalida a escolha de teste, sem inseri-la no treino.

Resultados ficam separados em rfEvaluationData (prefixo jornadaBia), limitados
aos últimos 200, sem envio de contexto a servidores. A síntese de voz pode usar
o serviço externo já escolhido no app. É possível exportar JSON ou apagar só os
resultados; isso não altera frases ou aprendizado. O teste registra contexto,
configuração, número de linhas de treino, previsões e escolha de referência,
sem salvar uma cópia de todo o histórico de treino.

A comparação de acertos usa apenas os testes em que ambos os métodos estavam
disponíveis, com o mesmo denominador; os demais são mostrados separadamente.
Coincidir com a próxima escolha não confirma necessidade, personalização ou
benefício de comunicação. Testes manuais não são amostras independentes de uso
real, e a escolha de contexto pode influenciar os resultados. A avaliação não
altera a participação dos modelos, que continua em observação.

### Recuperação automática para cálculo local

Em API externa, Atualizar cartões tenta o servidor por até cinco segundos. Falha
de rede/HTTP, resposta incompatível ou timeout acionam o mesmo modelo local
embarcado. Sem internet detectada ou sem endereço, usa local sem pedido externo.
A mensagem informa “Usando processamento neste aparelho”; sucesso remoto informa
“Cartões atualizados pelo servidor”. Isso não altera a preferência salva: uma
próxima atualização explícita tenta novamente a API, sem reconexões automáticas.

Se o modelo local também estiver indisponível ou retornar ordem inválida, mantém
a lista existente e as duas opções fixas. Escolher um cartão durante um pedido,
sair da página ou mudar configuração cancela/invalida a atualização pendente;
respostas atrasadas não podem reordenar a tela depois da escolha. Os botões de
comunicação permanecem disponíveis enquanto a consulta acontece. Não há fala
ou envio de escolhas automático. A recuperação trata o cálculo da ordem; a voz
continua usando suas configurações existentes e disponibilidade no dispositivo.

O uso offline completo da página exige carregamento e instalação do cache PWA
antes da desconexão. Suspensão/cold start da hospedagem pode ultrapassar os cinco
segundos e resultar em cálculo local mesmo que o servidor esteja iniciando.

### Revisão de integração e cobertura de dados

O backup completo (versão 4) inclui também rotina, emoções, preferências de
acessibilidade/atividades, histórico de atividades, conexão dos cartões,
resultados de avaliação e voz selecionada. module-data.js define uma lista
explícita de chaves adicionais; PIN, credenciais biométricas e sessão de
administração não são exportados por ela. Backups anteriores permanecem legíveis;
campos ausentes não são inventados. Backups de configuração restauram apenas
seus campos permitidos. O backup de segurança pré-importação usa a mesma coleta
completa da exportação normal.

Limpar todos os dados alcança as chaves adicionais e recarrega o aplicativo para
esvaziar os estados em memória, preservando chaves de outros aplicativos da mesma
origem. Isso não modifica o botão Apagar todas as frases, que preserva aprendizado.
O cache inicial inclui todos os scripts/folhas locais do HTML, incluindo emoções
e acessibilidade. O retorno do Assistente para Minha Comunicação foi conectado
à navegação.

Esta revisão verificou os fluxos locais com dados fictícios e backup criptografado.
Não é certificação de segurança ou compatibilidade universal: biometria,
notificações e disponibilidade das vozes dependem do aparelho. O PostgreSQL/
backend separado não faz parte deste repositório e não foi auditado nesta rodada.

### Palavras em prática
No menu inferior **Jardim da Bia**, use **Desbloquear Jardim** para abrir o mesmo fluxo administrativo de PIN/biometria, sem sair da tela. Desbloqueie a administração para acompanhar até cinco expressões escolhidas com a Bia e a fono. O adulto registra data, contexto, função comunicativa e apoio observado; o padrão é “Não informado”. O aplicativo não infere espontaneidade nem declara uma palavra conquistada. Pausar mantém o histórico e não altera os cartões.

O resumo usa semanas de segunda a domingo, inclui todos os tipos de apoio e permite salvar observações por semana. Revise o texto antes de abrir o WhatsApp ou usar **Salvar PDF / Imprimir** (escolha “Salvar como PDF” no navegador). Nenhuma mensagem é enviada automaticamente. O jardim é opcional e representa expressões, sem pontuação. Ausência de registro não significa ausência de comunicação.

Os registros ficam neste navegador, separados dos modelos de IA, e entram no backup completo existente. A limpeza geral dos dados também os remove. A proteção administrativa é local, não autenticação de servidor. O módulo funciona offline após o primeiro carregamento completo; não é uma avaliação clínica.

O Jardim apresenta cinco espaços para flores. A fono pode selecionar manualmente “Em acompanhamento”, “Revisar com a fono” (destaque rosa) ou “Consolidada pela fono” (flor aberta). A classificação não muda com a quantidade de registros e não remove a expressão dos cartões. Os últimos cinco dias incluem hoje e mostram os tipos de apoio registrados, com detalhes textuais acessíveis e contextos informados nesse período. Os quatro botões rápidos usam a data, o contexto e a função preenchidos no formulário; nenhum apoio é inferido.

### Ciclo de uso do Jardim
O registro de acionamentos de fala é opcional e vem desligado. Ao ativá-lo na administração, uma expressão exata em acompanhamento, acionada para falar no app, gera uma pendência local (até 50 por expressão). Comparação ignora maiúsculas e pontuação final, mas não procura palavras dentro de outras frases. Prévia de voz não é registrada. Acionamento não prova que a pessoa pretendia comunicar, que o áudio saiu ou que houve uso espontâneo.

No Jardim, o adulto escolhe apoio, contexto e função e confirma o acionamento original, criando uma única observação. Também pode descartá-lo. Pendências não contam como observações no resumo. O botão de nova observação registra uma ocorrência separada; para revisar um acionamento, use o botão específico de confirmação.

“Concluir com a fono e manter no vocabulário” exige administração desbloqueada, revisão das pendências e confirmação do adulto. Adiciona a expressão em Minha Comunicação (categoria Vocabulário do Jardim, sem duplicar expressão já existente), preserva a flor aberta e os registros, e libera uma das cinco vagas. Essa é uma confirmação manual de consolidação, nunca uma conclusão automática da frequência. A expressão permanece pausada no acompanhamento e pode ser retomada.

Se a sessão administrativa expirar enquanto o Jardim está aberto, os registros ficam ocultos e o botão de desbloqueio reaparece no próprio Jardim. Cancelamento, erro de PIN e limite de tentativas mantêm a proteção existente.

O PDF para a fono agora usa um relatório visual A4 com resumo em números, variedade de funções informadas, gráficos de contexto e apoio, cartões por expressão e observações da semana. A prévia mostra o mesmo conteúdo que será impresso; valores e legendas permanecem legíveis sem depender de cores. Os gráficos contam observações revisadas, não acionamentos pendentes, e não representam uma avaliação clínica. O WhatsApp continua usando texto. Para exportar, abra o resumo, revise e escolha **Salvar PDF / Imprimir → Salvar como PDF** no navegador.

O resumo na tela e o PDF compartilham a apresentação com fundo verde suave, cartões brancos, barras empilhadas por expressão, etiquetas de contexto e barras rosas por função comunicativa. Os três cartões principais mostram total, sem incentivo observado e com apoio; após incentivo e apoio não informado aparecem logo abaixo, separadamente, completando o total. Os gráficos de funções usam a maior contagem da semana como escala visual, com números explícitos. Nenhuma categoria de apoio é agrupada ou reclassificada.

### Conta online e cópias de frases
Em **Apoio → Conta e cartões**, desbloqueie a administração e crie uma conta de família ou entre com e-mail e senha. A conta online é diferente do PIN local. A conexão usa https://jornada-de-bia-data-api.onrender.com e exige a API com descoberta de famílias e identificador de envio (veja PR correspondente do backend). Uma API anterior é recusada antes de cadastro ou transferência.

Esta primeira integração copia frases de **Minha Comunicação** por ação explícita:
- **Enviar novas frases deste aparelho** consulta o catálogo e os cartões, pede confirmação da família e envia apenas cópias novas. Frases em categorias ausentes no catálogo ou fora do limite não são enviadas; a mensagem informa a quantidade preservada localmente.
- **Importar novos cartões da conta** adiciona frases após confirmação, preservando as existentes, suas categorias, favoritos e os dados de aprendizado. Cartões já importados não são duplicados nem sobrescritos.
- Edições e exclusões **não são propagadas**. A integração não faz espelhamento nem resolução automática de conflitos. Cartões com alterações permanecem preservados, para revisão em etapa futura.
- Não há envio automático de frases, histórico, Jardim ou treino. Imagens e símbolos pré-instalados não são transferidos.
- O token fica somente em memória por até 15 minutos, sem senha/token em armazenamento persistente ou backup. Recarregar, sair da conta, bloquear a administração ou expirar a sessão encerra a conexão.
- Referências de envio/importação ficam junto das frases e entram no backup completo protegido. Uma resposta perdida pode ser conferida ao tentar novamente, sem duplicar o cartão. Alterações do armazenamento por outra aba interrompem a operação antes de sobrescrever os dados locais.
- Sem internet, as frases já guardadas continuam disponíveis. Envio e importação exigem rede; não existe fila automática de sincronização neste primeiro fluxo.

Para testar entre dispositivos, crie uma frase numa categoria do catálogo (ex.: Geral), envie para a família selecionada, entre na mesma conta no segundo dispositivo e importe. O backend precisa ser atualizado/publicado antes de fazer o merge da interface. Nenhuma credencial PostgreSQL ou chave JWT de servidor pertence ao frontend.

### Revisão de edições entre aparelhos

Em **Apoio → Conta e cartões → Comparar edições das frases**, compare cartões
já vinculados à família e escolha explicitamente a versão do aparelho ou da
conta, frase por frase. Fechar a comparação preserva ambas as versões.
Categorias locais ausentes no catálogo da conta não podem ser enviadas.
Frases novas continuam usando os botões de envio/importação; exclusões não são
propagadas. Não há sincronização em segundo plano.

A Data API precisa expor `CardUpdate.expected_updated_at` antes de usar esta
função. Se outro aparelho editar o cartão após a consulta, o envio é recusado
e a comparação precisa ser refeita. Se a conexão cair depois de salvar, consulte
novamente antes de decidir: a operação pode ter sido concluída no servidor.

### Categorias personalizadas na conta

Em **Apoio → Conta e cartões → Enviar categorias deste aparelho**, confira e
confirme os nomes a enviar para a família selecionada. Esse botão envia apenas
categorias. Depois use **Enviar novas frases deste aparelho** para enviar as
frases com suas categorias personalizadas. Repetir o envio não duplica nomes.

**Importar categorias e novos cartões da conta** traz também as categorias sem
frases. Categorias locais e frases existentes são preservadas, e os dados
importados ficam disponíveis offline. Os nomes equivalentes com diferenças
de maiúsculas ou espaços não geram uma segunda categoria. Renomeações e
exclusões locais não são propagadas.

Publicar primeiro a Data API com o endpoint `/v1/family-categories` e a migração
de categorias por família. Nenhum envio acontece automaticamente.

### Cartões e lixeira da conta

Em **Apoio → Conta e cartões → Cartões e lixeira da conta**, consulte as frases
ativas e arquivadas da família selecionada. Cada ação pede confirmação.
**Mover para lixeira da conta** oculta o cartão da conta sem remover a frase
salva no aparelho. **Restaurar cartão na conta** recupera o mesmo cartão; use
Importar se também quiser trazê-lo para um aparelho onde ele não está salvo.

Excluir uma frase em Minha Comunicação continua sendo uma ação local. Não
há propagação automática de exclusões nem importação de cartões arquivados.
Se a versão mudar desde a consulta, confira a lista novamente antes de agir.
A sessão e o desbloqueio administrativo continuam obrigatórios, e a lista é
limpa ao bloquear ou trocar de família.

Publicar primeiro a Data API com a migração de lixeira e os endpoints de
arquivamento/restauração. O aplicativo verifica esse suporte antes de abrir a
lista.

### Trocar a senha da conta online

Após entrar em **Apoio → Conta e cartões**, abra **Alterar senha da conta**.
Informe a senha atual e repita a nova senha (12 a 128 caracteres). A confirmação
explica que todas as sessões online antigas deixarão de funcionar. Após salvar,
entre novamente com a nova senha em cada aparelho.

Senhas do formulário são limpas após a tentativa, ao sair ou ao bloquear, e
não entram no armazenamento local ou no backup. A troca não modifica as frases.
Se a resposta da rede se perder, o aplicativo desconecta: tente entrar com a
nova senha; a operação pode ter sido concluída no servidor. Não há repetição
automática da troca.

Publicar primeiro a API com auth_version e /v1/auth/change-password.
A função **Esqueci minha senha** ainda depende do serviço de e-mail; a troca
implementada aqui exige conhecer a senha atual.

### Recuperar senha por código (ativação pendente)

O botão **Esqueci a senha da conta** consulta se a recuperação está disponível.
Sem ativação/configuração, informa indisponibilidade e mantém o login e as
frases locais. Quando o backend estiver configurado, o adulto solicita um código
pelo e-mail da conta, cola o código completo e informa/confirma a nova senha.
A redefinição pede novo login e encerra as sessões antigas; não recupera o PIN.

O app não guarda código ou senha no armazenamento/backup. Erros de código são
genéricos, e as frases são preservadas. O envio real permanece desativado até
aprovar o remetente e configurar as variáveis somente no backend.

Publicar primeiro a Data API com a migração password_resets e as rotas
/v1/auth/password-recovery/*; depois este aplicativo. Nenhuma credencial do
Brevo deve ser colocada no JavaScript.

### Convidar colaboradores para os cartões da conta

Em **Apoio → Conta e cartões → Convites e acessos da família**, o responsável
informa o e-mail e escolhe consulta ou edição. Confirma antes de gerar um código
de 48 horas, exibido somente naquele momento, e o compartilha diretamente com a
pessoa. Não há envio de e-mail/WhatsApp por esta função.

A pessoa entra com sua própria conta no e-mail indicado, cola o código em
**Aceitar convite nesta conta** e depois escolhe Importar. O cadastro atual cria
um espaço/família pessoal; aceitar o convite acrescenta a família convidada
sem misturar as contas. Nenhum cartão é importado automaticamente ao aceitar.

Somente o responsável pode consultar/alterar/revogar acessos e cancelar convites.
O colaborador de consulta pode importar, mas não alterar os dados da conta.
O de edição pode enviar frases/categorias e escolher edições ou usar a lixeira.
Ambos continuam sem gestão de pessoas. **Atualizar famílias e permissões** reflete
mudanças; o servidor confere o papel a cada nova requisição.

Códigos são limpos ao sair, bloquear, trocar de família ou consultar a lista;
não são guardados em armazenamento/backup do app. Revogar acesso não apaga cópias
já importadas e não remove o acesso da pessoa a outras famílias. Jardim,
relatórios e modelos permanecem locais.

Publicar primeiro a Data API com viewer e family_invitations. Esta entrega não
depende de ativar o Brevo.

### Histórico dos cartões da conta

Somente o responsável da família encontra **Histórico dos cartões da conta**
em Apoio → Conta e cartões. A consulta manual mostra criação, edição,
arquivamento e restauração, autor e horário do navegador. A identificação usa
o texto atual; o histórico não guarda textos anteriores e começa nesta versão.

Carregar registros anteriores pagina a lista. A lista fica na memória da sessão,
é limpa ao bloquear/sair, mudar de família ou atualizar famílias/permissões e
não entra no armazenamento/backup local. Não altera as frases do aparelho.
Colaboradores não podem consultar a trilha no servidor.

Publicar primeiro a API com a migração card_history_events e GET /v1/card-history.

### Voz guiada opcional

Em **Apoio → Voz guiada — explorar e confirmar**, ative a exploração dos
cartões/frases com confirmação separada. A prévia usa vozes locais identificadas
pelo navegador, com velocidade e volume próprios. O anúncio ao focar é
desligado por padrão; mantenha-o desligado com TalkBack/VoiceOver.

Veja [VOZ_GUIADA_E_TESTES.md](VOZ_GUIADA_E_TESTES.md) para uso, limites e testes
de celular pendentes. A fala confirmada mantém a configuração de voz do app.
A exploração não registra comunicação ou aprendizado. Não depende do backend
nem da ativação do Brevo.

## Frases e lixeira simplificadas

Veja [FRASES_E_LIXEIRA.md](FRASES_E_LIXEIRA.md): lixeira local recuperável,
restauração diretamente em Minhas frases, ações principais de Guardar/Trazer
na conta e roteiro curto para repetir o teste de uso após publicação.

## Conta na nuvem com Google

[ACESSO_GOOGLE.md](ACESSO_GOOGLE.md) descreve a entrada opcional, a configuração
OAuth e os limites. Comunicação e backup local por arquivo não exigem login.
Os formulários de senha/recuperação do aplicativo são substituídos pelo Google.
