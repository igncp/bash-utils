#!/usr/bin/env bash

set -e

# this can be time consuming in the future but at this stage it should be
# tolerable

npm run run-checks
npm run lint
npm run test

echo "helpers/gitHooks/precommit.sh completed correctly"
