#!/usr/bin/env bash

set -e

REAL_PACKAGES=$(find packages -maxdepth 1 -mindepth 1 -type d |
  sed 's|packages/||' |
  sort -V)

README_PACKAGES=$(perl -0 -ne '/(Packages:.+)##/s && print "$1\n"' README.md |
  tail -n +2 |
  grep . |
  sed -e 's|- \[\(.*\)\].*|\1|')

README_PACKAGES_SORTED=$(echo "$README_PACKAGES" |
  sort)

UNSORTED_ENTRIES=$(diff <(echo "$README_PACKAGES") <(echo "$README_PACKAGES_SORTED") --color=always || true)

if [ -n "$UNSORTED_ENTRIES" ]; then
  echo "The listed packages in the README.md are not sorted"
  echo "$UNSORTED_ENTRIES"
  exit 1
fi

PARSED_README_PACKAGES=$(echo "$README_PACKAGES" |
  sed 's|@bash-utils/||' |
  sort -V)

DIFF_CONTENT=$(diff <(echo "$REAL_PACKAGES") <(echo "$PARSED_README_PACKAGES") --color=always || true)

if [ -n "$DIFF_CONTENT" ]; then
  echo "The listed packages don't match the real packages"
  echo "$DIFF_CONTENT"
  exit 1
fi
