# `eslint-plugin-bashutils`

ESLint plugin to lint files using bash (e.g. with `.sh`extension). This plugin contains several "experimental" rules that are not exposed. Feel free to contribute, even if you need some guidence to get started.

## Rules

- [**function-style**](./docs/function-style.md): Disallows adding more than one empty lines
- [**no-multiple-empty-lines**](./docs/no-multiple-empty-lines.md): Disallows adding more than one empty lines
- [**no-multiple-spaces**](./docs/no-multiple-spaces.md): Forbids adding multiple consecutive spaces (except certain cases)
- [**require-shebang**](./docs/require-shebang.md): Requires adding a shebang in the top of the script
- [**sets-options**](./docs/sets-options.md): Enforces or forbids setting certain options

## References

- https://github.com/RokuRoad/eslint-plugin-roku
- https://eslint.org/docs/developer-guide/nodejs-api
- https://eslint.org/parser/
