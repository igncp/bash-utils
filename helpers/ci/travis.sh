#!/usr/bin/env bash

set -e

# npm in Node v6 would complain about different versions of ESLint
export SKIP_PREFLIGHT_CHECK=true

npm run run-checks
npm run build
npm run lint
npm run test
npm run docs

echo "helpers/travis.sh completed correctly"
