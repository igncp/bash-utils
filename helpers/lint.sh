#!/usr/bin/env bash

set -e

PRETTIER_FILES=$(sh helpers/get_prettier_files.sh)

eval "./node_modules/.bin/prettier --list-different $PRETTIER_FILES"

bash helpers/review_tslint_rules.sh

./node_modules/.bin/eslint .

./node_modules/.bin/stylelint ./**/*.css

./node_modules/.bin/flow-coverage-report

./node_modules/.bin/lerna run lint

TODOS=$(find . -type f ! -path "*node_modules*" ! -path "*.git/*" | \
  xargs grep '@TODO' | \
  grep -v 'lint.sh')

if [ ! -z "$TODOS" ]; then
  echo ""
  echo "There are pending TODOs."
  echo "They are not considered errors but please fix ASAP:"
  echo "$TODOS"
  echo ""
fi

echo "helpers/lint.sh completed successfully"
