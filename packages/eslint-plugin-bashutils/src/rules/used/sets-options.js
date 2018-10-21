// @flow

/**
 * Enforces or forbids setting certain options
 *
 * Acceps an object as options with the following properties:
 *
 * - include: Array of strings that the script should set. For example: `include: ['-x']`
 * - exclude: Array of strings that the script should not set. For example: `exclude: ['-x']`
 *
 * ### Valid
 *
 * Option: `[2, { include: ['-e'] }]`
 *
 * ```sh
 * set -e
 *
 * echo foo
 * ```
 *
 * ### Invalid
 *
 * Option: `[2, { include: ['-e'] }]`
 *
 * ```sh
 * echo foo
 * ```
 *
 * @module Sets Options
 */

import { tokens } from '@bash-utils/parser'

import type { T_Rule, T_ESTreeNode } from '../../types'

const availableSetOptions = ['-a', '-e', '-x']

const getIsAvailableSetOption = o => availableSetOptions.indexOf(o) !== -1

const getValueOfSingleIdentifier = node => {
  const nodeBody = node.body || null

  if (
    !nodeBody ||
    nodeBody.length !== 1 ||
    !nodeBody[0] ||
    nodeBody[0].type !== 'Literal'
  ) {
    return null
  }

  const literalNode = nodeBody[0]

  if (!literalNode) {
    return null
  }

  const literalNodeBody = ((literalNode: any): T_ESTreeNode).body

  if (
    !literalNodeBody ||
    literalNodeBody.length !== 1 ||
    !literalNodeBody[0] ||
    literalNodeBody[0].type !== tokens.IDENTIFIER.tokenName
  ) {
    return null
  }

  // $FlowIgnore
  return literalNodeBody[0].value
}

const getSetExpressionType = node => {
  const nodeBody = node.body || null

  if (!nodeBody || nodeBody.length !== 2) {
    return false
  }

  const firstIdentifier = getValueOfSingleIdentifier(nodeBody[0])

  if (firstIdentifier !== 'set') {
    return false
  }

  const secondIdentifier = getValueOfSingleIdentifier(nodeBody[1])

  if (
    !secondIdentifier ||
    availableSetOptions.indexOf(secondIdentifier) === -1
  ) {
    return false
  }

  return secondIdentifier
}

const rule: T_Rule = {
  meta: {
    docs: {
      description: 'Enforces or forbids setting certain options',
    },
    schema: [
      {
        type: 'object',
        properties: {
          included: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          excluded: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missing: 'No set option: {option}',
      supported: 'Option not supported',
      present: 'Forbidden option: {option}',
      repeated: "Can't add an option as included and excluded at the same time",
    },
  },
  create(ctx) {
    const setExpressions = []
    const { included = [], excluded = [] } = ctx.options[0]
    const loc = {
      start: {
        line: 1,
        column: 1,
      },
      end: {
        line: 1,
        column: 1,
      },
    }

    included.forEach(includedOption => {
      if (excluded.indexOf(includedOption) !== -1) {
        ctx.report({
          messageId: 'repeated',
          loc,
        })
      }
    })

    included.concat(excluded).forEach(option => {
      if (availableSetOptions.indexOf(option) === -1) {
        ctx.report({
          messageId: 'supported',
          loc,
        })
      }
    })

    return {
      Command(node: T_ESTreeNode) {
        const setExpressionType = getSetExpressionType(node)

        if (setExpressionType) {
          setExpressions.push(setExpressionType)
        }
      },
      'Program:exit': () => {
        included.filter(getIsAvailableSetOption).forEach(includedOption => {
          if (setExpressions.indexOf(includedOption) === -1) {
            ctx.report({
              messageId: 'missing',
              loc,
              data: {
                option: includedOption,
              },
            })
          }
        })

        excluded.filter(getIsAvailableSetOption).forEach(excludedOption => {
          if (setExpressions.indexOf(excludedOption) !== -1) {
            ctx.report({
              messageId: 'present',
              data: {
                option: excludedOption,
              },
              loc,
            })
          }
        })
      },
    }
  },
}

export default rule
