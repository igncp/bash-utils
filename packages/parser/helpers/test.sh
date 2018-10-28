#!/usr/bin/env bash

set -e

find test/integration/copied_fixture_files -type f -name "*.sh" | \
  xargs -I {} rm -rf {}

SHELL_FILES=$(find ../../ -type f ! -path "*node_modules*" ! -path "*.git*" -name "*.sh" | \
  sort -V)

COUNTER=0
while read -r SHELL_FILE; do
  cat "$SHELL_FILE" > test/integration/copied_fixture_files/sample-"$COUNTER".sh
  COUNTER=$((COUNTER+1))
done <<< "$SHELL_FILES"

../../node_modules/.bin/jest "$@"
