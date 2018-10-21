#!/usr/bin/env bash

set -e

# looking for all files till it needs filtering
DOT_ONLY_OCCURRENCES=$(find . -type f ! -path "*node_modules*" ! -name "check_only_tests.sh" |
  grep -v copied_fixture_files | \
  xargs grep -E '\.only\(' || true)

if [ ! -z "$DOT_ONLY_OCCURRENCES" ]; then
  echo "You have tests using .only("
  echo "$DOT_ONLY_OCCURRENCES"
  exit 1
fi
