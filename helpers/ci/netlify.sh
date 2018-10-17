#!/usr/bin/env bash

set -e

npm i
npm run lint
npm run test
npm run docs

rm -rf dist

cp -r packages/website/build dist

find dist/ -type f -name "*.map" | xargs -I {} rm {}

cp -r packages/parser/diagrams/generated_diagrams.html dist/grammar.html
cp -r flow-coverage dist/
cp -r packages/parser/coverage/lcov-report dist/parser-tests-coverage
cp -r packages/eslint-plugin-bashutils/coverage/lcov-report dist/eslint-tests-coverage
