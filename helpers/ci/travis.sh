#!/usr/bin/env bash

set -e

npm run run-checks
npm run build
npm run lint
npm run test
npm run docs

echo "helpers/travis.sh completed correctly"
