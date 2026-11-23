# Laboratório de cartões experimentais

O laboratório fica em **Apoio → Mais opções**, visível somente após desbloqueio local e entrada com a conta Google autorizada pela capacidade `manage_experiments` do backend. Ser responsável de uma família não basta. O backend configura o administrador em `EXPERIMENT_ADMIN_EMAIL`; detalhes de implantação pertencem ao repositório da API.

## Demonstração neural

O painel usa cinco cartões sintéticos e duas opções fixas. Não representa preferências reais da Bia e não classifica símbolos personalizados. A comunicação principal continua disponível independentemente dele.

- `js/card-model-data.js`: pesos e vocabulário exportados do treinamento sintético.
- `js/card-model.js`: rede 9 → 16 → ReLU → 5, executada em JavaScript, sem treinamento no navegador.
- O modo local dispensa consulta à API. A atualização é explícita; a demonstração não é iniciada automaticamente ao entrar em Comunicação.
- O modo externo exige URL HTTPS e confirmação no laboratório. A consulta envia período do dia e ID do último cartão da demonstração, não perfil ou histórico de frases. Os textos dos cartões permanecem locais.
- Falha, timeout ou resposta fora do contrato preservam as opções disponíveis. A preferência de voz é independente e pode usar serviço online.

A demonstração neural não superou a regra simples no conjunto sintético documentado: 55,3% contra 57,3%. Isso não mede eficácia de CAA nem evolução terapêutica.

## Atualizar pesos

No repositório `neural-api`, gere o checkpoint com `scripts/train_cards_demo.py`. Em ambiente com PyTorch, no repositório do aplicativo:

```bash
python scripts/export-card-model.py /caminho/modelo.pt
node --test tests/*.test.cjs
```

A exportação inclui referências usadas para comparar pontuações e ordenação no navegador. Não substitua dados sintéticos por dados de crianças sem avaliar finalidade, autorização e proteção adequadas.

## Limite da restrição

A autorização controla a interface do aplicativo e é revalidada ao salvar configurações. Os arquivos do frontend são públicos. A Neural API externa possui controles próprios; esconder o painel não restringe automaticamente o acesso a esse serviço.
