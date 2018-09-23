#!/usr/bin/env bash

set -e

npm run lint
npm run test

sh helpers/checks/check_npm_resolver.sh

echo "helpers/gitHooks/prepush.sh completed correctly"
