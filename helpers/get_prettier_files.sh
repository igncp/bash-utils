#!/usr/bin/env bash

git ls-tree --full-tree -r HEAD |
  grep -E '([tj]s|json|md)$' |
  awk '{print $NF}' |
  grep -Ev '^docs' |
  grep -Ev '^flow-coverage' |
  grep -v 'package-lock.json' |
  grep -v 'lerna.json' |
  tr '\n' ' '
