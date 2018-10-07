#!/usr/bin/env bash

set -e

RESULT=$(grep -r '   maxLookahead' src || true)

if [ ! -z "$RESULT" ]; then
  echo "There are entries with uncommented maxLookahead"
  echo "$RESULT"
  exit 1
fi
