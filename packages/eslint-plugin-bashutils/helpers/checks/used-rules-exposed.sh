#!/usr/bin/env bash

set -e

USED_RULES=$(find src/rules/used/ -maxdepth 1 -mindepth 1 -type f |
  grep -v index |
  sed 's|src/rules/used/||; s|.js$||' |
  sort -V)

EXPOSED_RULES=$(cat src/rules/used/index.js |
  grep -o "from '.*'$" |
  sed "s|from './||; s|'$||" |
  sort -V)

DIFF_CONTENT=$(diff <(echo "$EXPOSED_RULES") <(echo "$USED_RULES") --color=always || true)

if [ -n "$DIFF_CONTENT" ]; then
  echo "The exposed rules are not the same than the rules in 'src/rules/used'"
  echo "$DIFF_CONTENT"
  exit 1
fi
