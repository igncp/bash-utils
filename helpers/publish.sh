#!/usr/bin/env bash

set -e

sh helpers/checks/check_npm_resolver.sh

./node_modules/.bin/lerna publish "$@"

sh helpers/publish_docs.sh
