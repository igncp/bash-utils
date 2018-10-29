## Function Style: function-style

Enforces a certain style for functions

Acceps an object as options with the following properties:

- withFunctionKeyword: Boolean [=true], in case positive it requires the `function` keyword

### Valid

Option: `[2, { withFunctionKeyword: true }]`

```sh
function foo () { echo 'foo'; }
function foo { echo 'foo'; }
```

### Invalid

Option: `[2, { withFunctionKeyword: true }]`

```sh
foo () { echo 'foo'; }
```
