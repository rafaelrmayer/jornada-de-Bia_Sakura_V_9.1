"""Exporta checkpoint de demonstração confiável para inferência JS e referências PyTorch.
Uso: python scripts/export-card-model.py /caminho/modelo_cartoes_demo.pt
"""
import json
from pathlib import Path
import sys
import torch
from torch import nn

root = Path(__file__).resolve().parent.parent
checkpoint = torch.load(sys.argv[1], map_location='cpu', weights_only=True)
assert checkpoint['arquitetura'] == [9, 16, 5]
assert checkpoint['dados_sinteticos'] is True
model = nn.Sequential(nn.Linear(9, 16), nn.ReLU(), nn.Linear(16, 5))
model.load_state_dict(checkpoint['state_dict'])
model.eval()
weights = {key: value.tolist() for key, value in model.state_dict().items()}
data = dict(architecture=[9, 16, 5], synthetic_data=True, phrases=checkpoint['frases'], weights=weights,
            seed=checkpoint.get('seed', 42), torch_version=str(torch.__version__))
source = '// Pesos de demonstração sintética, exportados por scripts/export-card-model.py.\n'
source += '(function(root){const model=' + json.dumps(data, ensure_ascii=False, allow_nan=False) + ';\n'
source += "if(typeof module !== 'undefined' && module.exports) module.exports=model; else root.BiaCardModel=model;\n})(typeof window==='undefined'?globalThis:window);\n"
(root/'js/card-model-data.js').write_text(source)
references=[]
with torch.inference_mode():
    for period in range(3):
        for last in range(6):
            x=torch.zeros(1,9);x[0,period]=1;x[0,3+last]=1
            scores=model(x)[0].tolist()
            references.append(dict(period=period,last=None if last==5 else last,scores=scores,
                order=sorted(range(5),key=lambda i:(-scores[i],i))))
(root/'tests/fixtures/card-model-reference.json').write_text(json.dumps(references, indent=2))
print('Pesos JS e 18 referências PyTorch exportados.')
