#!/usr/bin/env bash

set -e

# requires `npm run build`

rm -rf docs
mkdir docs

find lib/rules/used/ -type f ! -name "index.js" | while read -r RULE_PATH; do
  RULE_NAME=$(echo "$RULE_PATH" | grep -oE '[^/]*.js$' | sed 's|.js$||')
  RULE_DOCS_PATH=docs/"$RULE_NAME".md

  ./node_modules/.bin/jsdoc2md "$RULE_PATH" | \
    tail -n +2 \
    > "$RULE_DOCS_PATH"

  ../../node_modules/.bin/prettier --write "$RULE_DOCS_PATH"

  sed -i '1 s/$/: '"$RULE_NAME"'/' "$RULE_DOCS_PATH"

  if [ -z "$(grep '### Valid' $RULE_DOCS_PATH)" ]; then
    echo "The $RULE_DOCS_PATH lacks a 'Valid' section"
    exit 1
  fi

  if [ -z "$(grep '### Invalid' $RULE_DOCS_PATH)" ]; then
    echo "The $RULE_DOCS_PATH lacks an 'Invalid' section"
    exit 1
  fi

  if [ -n "$(head $RULE_DOCS_PATH -n 2 | tail -n 1)" ]; then
    echo "No empty line after the title in $RULE_DOCS_PATH"
    exit 1
  fi
done
