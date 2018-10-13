# `eslint-plugin-bashutils`

ESLint plugin to lint files using bash (e.g. with `.sh`extension). This plugin contains several "experimental" rules that are not exposed. Feel free to contribute, even if you need some guidence to get started.

## Rules

- [**no-multiple-empty-lines**](./src/rules/used/no-multiple-empty-lines.js): Disallows adding more than one empty lines
- [**require-shebang**](./src/rules/used/require-shebang.js): Requires adding a shebang in the top of the script

## References

- https://github.com/RokuRoad/eslint-plugin-roku
- https://eslint.org/docs/developer-guide/nodejs-api
- https://eslint.org/parser/
