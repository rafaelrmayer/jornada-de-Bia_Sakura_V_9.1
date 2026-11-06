#!/bin/sh
cd "$(dirname "$0")" || exit 1
printf '\nAbra no navegador: http://localhost:8000\nPara encerrar, pressione Ctrl+C.\n'
python3 -m http.server 8000 --bind 127.0.0.1
