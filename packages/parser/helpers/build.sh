#!/usr/bin/env bash

set -e

rm -rf lib

./node_modules/.bin/tsc

rm -rf lib/test

cp -r lib/src/* lib

rm -rf lib/src

cp src/flow-types.js lib/
