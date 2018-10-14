#!/usr/bin/env bash

set -e

if [ "$BASH_UTILS_ALLOW_DOCS" == 'true' ]; then
  echo "Allowing docs"

  exit 0
fi

FILES=$(git status --porcelain | grep ' docs' || true)

if [ -n "$FILES" ]; then
  echo "Docs files are tracked by git"
  exit 1
fi
