#!/usr/bin/env bash

set -e

rm -rf lib

pwd
ls -lah node_modules/.bin

./node_modules/.bin/tsc
