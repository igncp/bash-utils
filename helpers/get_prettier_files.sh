#!/usr/bin/env bash

git ls-tree --full-tree -r HEAD |
  grep -E '([tj]s|json|md)$' |
  grep -v 'package-lock.json' |
  grep -v 'lerna.json' |
  awk '{print $NF}' | tr '\n' ' '
