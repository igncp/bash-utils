#!/usr/bin/env bash

set -e

npm run run-checks
npm run lint
npm run test

echo "helpers/gitHooks/prepush.sh completed correctly"
