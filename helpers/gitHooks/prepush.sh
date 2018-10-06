#!/usr/bin/env bash

set -e

find helpers/checks -type f | \
  xargs -I {} sh {}

npm run lint
npm run test

echo "helpers/gitHooks/prepush.sh completed correctly"
