#!/usr/bin/env bash

set -e

echo 'foo'
echo 'bar'

# foo bar
# baz bar

echo 'baz' > /tmp/foo

FOO=BAR

if [ -z "$FOO" ]; then
  echo bar
fi

find . | grep -v foo -c

echo foo | \
  cat
