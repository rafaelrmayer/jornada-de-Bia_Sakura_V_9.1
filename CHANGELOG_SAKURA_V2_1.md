# Jornada de Bia Sakura V2.1

- Corrigido o fundo do tema rosa padrão para `#FFE5F0`, incluindo o documento e os contêineres principais quando o tema claro não possui o atributo `data-theme`.
- Iniciado o refinamento da implementação experimental do Random Forest: treinamento local com 21 árvores, modelo reutilizado enquanto os dados não mudam, invalidação após nova aprendizagem e limiar de confiança mais conservador (60%).
- Mantido o caminho de previsão existente como fallback quando há poucos dados, apenas uma classe ou falha no modelo.
- O Random Forest continua experimental; a confiança representa a proporção de votos das árvores, não uma probabilidade calibrada. Nenhum dado é enviado para um servidor pelo modelo.
