#!/bin/zsh
# Тест в WebKit → коммит → выкладка на GitHub Pages. Использование: ./publish.sh "что изменилось"
set -e
cd "$(dirname "$0")"
node tools/test.js | tail -3
git add -A
git commit -m "${1:-Обновление прототипа}" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" || true
git push -q origin main
echo "Выложено: https://matveymatvey52.github.io/crm-chukomina/"
