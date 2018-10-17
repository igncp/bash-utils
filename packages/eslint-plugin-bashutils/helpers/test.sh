#!/usr/bin/env bash

set -e

if [ ! -d tests/integration/node_modules ]; then
  (cd tests/integration && npm i)
fi

(cd ../parser && npm run build)
npm run build

echo "running rules tests"

../../node_modules/.bin/jest src/rules --coverage

echo "running integration tests"

./tests/integration/node_modules/.bin/eslint \
  --no-eslintrc \
  -c ./tests/integration/.eslintrc.js \
  --ext .sh \
  tests/integration

echo "success"
