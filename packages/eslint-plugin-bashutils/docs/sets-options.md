## Sets Options: sets-options

Enforces or forbids setting certain options

Acceps an object as options with the following properties:

- include: Array of strings that the script should set. For example: `include: ['-x']`
- exclude: Array of strings that the script should not set. For example: `exclude: ['-x']`

### Valid

Option: `[2, { include: ['-e'] }]`

```sh
set -e

echo foo
```

### Invalid

Option: `[2, { include: ['-e'] }]`

```sh
echo foo
```
