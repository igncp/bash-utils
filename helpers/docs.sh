#!/usr/bin/env bash

set -e

./node_modules/.bin/lerna run docs

rm -rf docs
mkdir docs

cp -r packages/parser/diagrams/generated_diagrams.html docs/index.html
