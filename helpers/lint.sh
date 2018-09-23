#!/usr/bin/env bash

set -e

PRETTIER_FILES=$(git ls-tree --full-tree -r HEAD |
  grep -E '([tj]s|json)$' |
  grep -v 'package-lock.json' |
  awk '{print $NF}' | tr '\n' ' ')

eval "./node_modules/.bin/prettier --write $PRETTIER_FILES"

./node_modules/.bin/eslint .

./node_modules/.bin/flow .

./node_modules/.bin/lerna run lint
