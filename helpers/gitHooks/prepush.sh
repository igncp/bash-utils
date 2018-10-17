#!/usr/bin/env bash

set -e

if [[ "$(git status --porcelain 2>/dev/null| wc -l)" != "0" ]]; then
  echo "git repository is not clean, stopping"

  exit 1
fi

npm run run-checks

echo "helpers/gitHooks/prepush.sh completed correctly"
