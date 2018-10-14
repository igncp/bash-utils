#!/usr/bin/env bash

set -e

./node_modules/.bin/lerna run docs

rm -rf docs

cp -r packages/website/build docs

find docs/ -type f -name "*.map" | xargs -I {} rm {}

cp -r packages/parser/diagrams/generated_diagrams.html docs/grammar.html

git add -A docs

(BASH_UTILS_ALLOW_DOCS=true git commit -m 'docs: publish release docs')
