#!/usr/bin/env bash

# this script is not longer used and is kept here in case more rules are added

UNUSED_TSLINT_RULES=$(perl -0 -ne '/("rules":.+?)\}/s && print "$1\n"' packages/parser/tslint.json | \
  tail -n +2 | \
  tr '\n' '@' | \
  sed 's| ||g' | \
  perl -0 -ne '/(@@".*?)@@/s && print "$1\n"' | \
  sed 's|@|\n|g' | \
  grep .)

if [ -n "$UNUSED_TSLINT_RULES" ]; then
  echo ""
  echo "$UNUSED_TSLINT_RULES" | head -n 10
  echo ""
  echo "^^^ There are $(echo "$UNUSED_TSLINT_RULES" | wc -l) unused TSLint rules (only 10 printed)"
  echo "Please review and move them (even if they remain disabled)"
  echo "https://palantir.github.io/tslint/rules/"
  echo ""
fi
