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
