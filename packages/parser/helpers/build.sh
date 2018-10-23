#!/usr/bin/env bash

set -e

rm -rf lib

./node_modules/.bin/tsc
cp src/flow-types.js lib/
