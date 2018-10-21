#!/usr/bin/env bash

set -e

# this can be time consuming in the future but at this stage it should be
# tolerable

npm run postinstall
npm run run-checks
npm run build
npm run lint

npm run test
./node_modules/.bin/lerna run test-ratchet

npm run docs

git add -A packages/eslint-plugin-bashutils/docs

echo "helpers/gitHooks/precommit.sh completed correctly"
