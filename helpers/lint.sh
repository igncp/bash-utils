#!/usr/bin/env bash

set -e

PRETTIER_FILES=$(sh helpers/get_prettier_files.sh)

eval "./node_modules/.bin/prettier --list-different $PRETTIER_FILES"

./node_modules/.bin/eslint .

UNUSED_RULES=$(npm run eslint-find-rules | grep . | head)

if [ -n "$UNUSED_RULES" ]; then
  echo "$UNUSED_RULES"
  echo ""
  echo "^^^ There are some ESLint unused rules (printing here max 10)"
  echo "Can disable them or add them"
  echo ""
fi

./node_modules/.bin/flow .

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
