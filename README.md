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
