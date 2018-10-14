#!/usr/bin/env bash

set -e

USED_RULES=$(find src/rules/used/ -maxdepth 1 -mindepth 1 -type f |
  grep -v index |
  sed 's|src/rules/used/||; s|.js$||' |
  sort -V)

README_RULES=$(perl -0 -ne '/(## Rules.+)##/s && print "$1\n"' README.md |
  head -n -2 |
  tail -n +3 |
  sed -e 's|- \[\*\*\(.*\)\*\*\](.*):.*$|\1|')

DIFF_CONTENT=$(diff <(echo "$README_RULES") <(echo "$USED_RULES") --color=always || true)

if [ -n "$DIFF_CONTENT" ]; then
  echo "The ESLint rules in the docs are not the same as the files"
  echo "$DIFF_CONTENT"
  exit 1
fi
