#!/usr/bin/env bash

find . -type f -name "*.log" ! -path "*node_modules*" |
  xargs -I {} rm -f {}
