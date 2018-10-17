#!/usr/bin/env bash

set -e

rm -rf lib

# Node v10 in Travis would remove this directory
if [ ! -d node_modules ]; then
  npm i
fi

./node_modules/.bin/tsc
