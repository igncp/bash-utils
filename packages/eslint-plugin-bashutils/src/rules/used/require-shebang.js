// @flow

import { tokens } from '@bash-utils/parser'
import type { T_Rule, T_ESTreeProgramNode } from '@bash-utils/parser'

/**
 * Requires adding a shebang in the top of the script
 *
 * ### Valid
 *
 * ```sh
 * #!/usr/bin/env bash
 *
 * echo foo
 * ```
 *
 * ### Invalid
 *
 * ```sh
 * echo foo
 *
 * ```
 *
 * @module Require Shebang
 */

// eslint transforms shebangs to comments in the code passed to the parser
// Can't use here the Shebang node type

const rule: T_Rule = {
  meta: {
    docs: {
      description: 'This rules enforces the presence of a shebang',
    },
    messages: {
      missing: 'Missing Shebang',
    },
  },
  create(ctx) {
    const { text } = ctx.getSourceCode()

    return {
      Program(node: T_ESTreeProgramNode) {
        let found = false

        for (let i = 0; i < node.tokens.length; i++) {
          const token = node.tokens[i]

          if (
            token.type === tokens.IDENTIFIER.tokenName &&
            token.value.substr(0, 3) === '///' &&
            token.loc.start.line === 1 &&
            text.substr(0, 2) === '#!'
          ) {
            found = true
          } else if (token.loc.start.line > 1) {
            break
          }
        }

        if (!found) {
          ctx.report({
            messageId: 'missing',
            loc: {
              end: { line: 1, column: 1 },
              start: { line: 1, column: 1 },
            },
          })
        }
      },
    }
  },
}

export default rule
