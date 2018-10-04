#!/usr/bin/env bash

set -e

if [ ! -d tests/integration/node_modules ]; then
  (cd tests/integration && npm i)
fi

npm run build

echo "running integration tests"

./tests/integration/node_modules/.bin/eslint \
  --no-eslintrc \
  -c ./tests/integration/.eslintrc.js \
  --ext .sh \
  tests/integration

echo "success"
