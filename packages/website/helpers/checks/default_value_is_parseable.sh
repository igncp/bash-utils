#!/usr/bin/env bash

set -e

if [ -z "$(grep -o 'const DEFAULT_CONTENT = `' src/App.js)" ]; then
  echo 'DEFAULT_CONTENT not found in src/App.js'

  exit 1
fi

WEBSITE_DEFAULT_CONTENT=$(\
  perl -0 -ne '/(const DEFAULT_CONTENT = .+)`.trim\(\)/s && print "$1\n"' src/App.js | \
  tail -n +2)

FILE_DEFAULT_CONTENT=$(cat ../parser/integration_tests/fixture_files/website_default_content.sh)

DIFF_VALUE=$(diff <(echo "$WEBSITE_DEFAULT_CONTENT") <(echo "$FILE_DEFAULT_CONTENT") --color=always || true)

if [ -n "$DIFF_VALUE" ]; then
  echo "The DEFAULT_CONTENT variable in src/App.js is not tested"
  echo "$DIFF_VALUE"
  exit 1
fi
