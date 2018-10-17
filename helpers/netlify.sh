#!/usr/bin/env bash

set -e

./node_modules/.bin/lerna run docs

rm -rf dist

cp -r packages/website/build dist

find dist/ -type f -name "*.map" | xargs -I {} rm {}

cp -r packages/parser/diagrams/generated_diagrams.html dist/grammar.html
