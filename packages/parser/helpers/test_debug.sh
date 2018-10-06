#!/usr/bin/env bash

set -e

node --inspect ../../node_modules/.bin/jest "$@"
