#!/usr/bin/env bash

set -e

EXTRANEOUS_RESOLVERS=$(find . -type f -name "package-lock.json" ! -path "*node_modules*" |
  xargs grep resolved |
  grep -vP 'resolved": "https?://registry.npmjs.org' || true)

if [ ! -z "$EXTRANEOUS_RESOLVERS" ]; then
  echo "You have extraneous resolvers in package-lock.json"
  echo "$EXTRANEOUS_RESOLVERS"
  exit 1
fi
