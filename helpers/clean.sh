#!/usr/bin/env bash

find . -type f -name "*.log" ! -path "*node_modules*" |
  xargs -I {} rm -f {}

echo "removing node modules..."
echo "you can recover node_modules by only running 'npm i'"
echo "on the top directory, and the 'postinstall' script"
echo "in the package.json will do the rest"

find . -type d -name "node_modules" |
  xargs -I {} rm -rf {}
