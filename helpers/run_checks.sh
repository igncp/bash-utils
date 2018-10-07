#!/usr/bin/env bash

set -e

find helpers/checks -type f | \
  xargs -I {} sh {}

./node_modules/.bin/lerna run run-checks
