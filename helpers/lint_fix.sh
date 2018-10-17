#!/usr/bin/env bash

set -e

PRETTIER_FILES=$(sh helpers/get_prettier_files.sh)

eval "./node_modules/.bin/prettier --write $PRETTIER_FILES"

./node_modules/.bin/eslint --fix .

./node_modules/.bin/stylelint --fix ./**/*.css

./node_modules/.bin/lerna run lint-fix
