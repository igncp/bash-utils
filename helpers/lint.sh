#!/usr/bin/env bash

set -e

PRETTIER_FILES=$(sh helpers/get_prettier_files.sh)

eval "./node_modules/.bin/prettier --list-different $PRETTIER_FILES"

./node_modules/.bin/eslint .

./node_modules/.bin/flow .

./node_modules/.bin/lerna run lint
