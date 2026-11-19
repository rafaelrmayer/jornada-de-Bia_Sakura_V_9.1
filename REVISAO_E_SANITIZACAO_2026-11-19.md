# Revisão e sanitização — 19/11/2026

Base do aplicativo: `dcab129` (inclui correções da Rotina e do contraste). Backend revisado: `93db5e8`. A revisão abrangeu os módulos de comunicação, armazenamento, backup, saúde, rotina, voz, conta Google, compartilhamento, cache e os pontos de renderização de texto dinâmico. No backend, foram conferidos os módulos de autenticação, famílias, permissões, cartões, pranchas, migrações e backup, com execução da suíte.

Nenhuma conta, dado de usuário ou banco de produção foi alterado. Não foram adicionadas dependências, nem foi modificado o esquema do banco. O PostgreSQL de testes foi descartado ao terminar.

## Correções incluídas

### Backup grande

A conversão de bytes para Base64 passava o conteúdo inteiro como argumentos de uma função. Arquivos maiores podiam exceder o limite do motor JavaScript. A conversão agora usa blocos limitados, mantendo o formato criptográfico existente e a compatibilidade dos arquivos.

Teste com mais de 500 mil caracteres de texto cifrado verifica exportação, recuperação de Unicode e recusa de senha incorreta.

### Bloqueio durante backup ou importação

A administração podia ser bloqueada enquanto o aplicativo aguardava descriptografia ou geração do backup de segurança. A importação verificava o acesso somente na entrada.

Agora o fluxo confere a mesma sessão administrativa depois das etapas assíncronas e antes de escrever. Bloquear e desbloquear novamente não retoma uma operação iniciada na sessão anterior. A exportação geral também confere a autorização antes de iniciar o download, depois da criptografia. Arquivos já baixados não podem ser revogados pelo aplicativo.

### Seletor de alergias

O seletor passava a poder permanecer visível ao bloquear. Agora ele fecha, limpa a lista temporária e a busca. A abertura e a confirmação também exigem administração desbloqueada. O comportamento de salvar saúde no aparelho permanece.

### Abertura com JSON local inválido

Leituras diretas com `JSON.parse` de alguns estados principais interrompiam a inicialização. A leitura desses estados agora utiliza o tratamento existente de JSON e verifica se a estrutura principal é uma lista ou um objeto. A interface usa valores padrão quando a leitura não é válida; carregar a tela não regrava os valores originais dessas chaves.

Isso não é uma ferramenta de reparo de qualquer corrupção, nem uma validação completa de todos os campos de todos os arquivos antigos. Alterações explícitas posteriores podem substituir o valor correspondente.

### Código antigo

Removidos modal, funções, referências e variáveis do seletor de plano de saúde, cujo campo já havia sido retirado do aplicativo. Preservados os dados legados reconhecidos pelo backup separado de saúde. Removidas variáveis sem uso do serviço de backup.

## Verificação executada

- **104 testes Node passaram**, incluindo novos casos de backup grande e cancelamento antes do download.
- **188 testes do backend passaram** com PostgreSQL 17 descartável e todas as 14 migrações aplicadas. Incluem autenticação Google, isolamento entre famílias, permissões, conflitos, convites, histórico e backup/restauração.
- Compilação de Python e sintaxe de **34 arquivos JavaScript** verificadas.
- HTML verificado sem IDs duplicados.
- Fluxos Playwright: frases/conta compartilhada/saúde, gravação segura da Rotina, contraste dos temas e os novos casos de sanitização.
- Os testes de navegador usam serviços simulados e bloqueiam pedidos externos. Não usam conta real ou dados médicos reais.

O backend emitiu um aviso de depreciação do TestClient Starlette/httpx no ambiente de testes; não houve falha. A migração dessa dependência de teste deve ser avaliada separadamente quando as versões forem atualizadas.

## Limites e próximos passos

- A Rotina continua local, sem transferência pelo Google. Sem Web Locks, a checagem de versão não oferece a mesma garantia para gravações exatamente simultâneas entre abas.
- Saúde não vai para os convidados nem para o backup geral; existe backup de saúde separado e criptografado, adicionado na atualização anterior.
- Os pictogramas ARASAAC atuais são imagens incluídas no aplicativo; não há busca online do catálogo. Créditos e licença permanecem.
- O README principal ainda mistura instruções históricas. A proposta do PR #43 precisa incorporar as novidades posteriores antes de ser integrada.
- Permanecem necessários os testes reais com outra conta para consulta/edição/revogação, lixeira/restauração e os testes em celulares e leitores de tela.
- Não foi realizada uma auditoria externa, verificação completa de vulnerabilidades de dependências ou certificação WCAG/LGPD. Passar nos testes não garante ausência de defeitos.

## Conferência após publicar

1. Atualizar o app e entrar com Google; conferir as frases existentes.
2. Abrir Saúde, abrir o seletor de alergias e bloquear: o seletor deve fechar.
3. Exportar um backup com senha e conferir a restauração em ambiente separado, preservando o aparelho de uso.
4. Conferir Rotina e temas escuros nas telas usadas no celular.
