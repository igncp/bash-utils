#!/usr/bin/env bash

set -e

npm run run-checks
npm run lint
npm run test
npm run docs

echo "helpers/ci.sh completed correctly"
