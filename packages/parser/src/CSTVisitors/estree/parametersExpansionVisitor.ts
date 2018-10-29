import { parse } from '../../parse'
import * as allTokens from '../../tokens'

import {
  getRecursiveWalkLeaveFunction,
  replaceItemInParent,
  updatePositions,
} from './treeHelpers'
import { walk } from './walker'

const visitTreeToExtractPE = (tree, visitAllRecursive) => {
  const newTokensToAdd = []
  const newCommentsToAdd = []
  const tokensToRemove = []

  walk(tree, {
    enter(item) {
      // is important to check for `item.parent` as the token will
      // pass through here twice
      if (item.type === allTokens.IDENTIFIER.tokenName && item.parent) {
        // tslint:disable-next-line no-invalid-template-strings
        if (item.value.substr(0, 2) !== '${') {
          return
        }

        if (item.value[item.value.length - 1] !== '}') {
          throw new Error('Unterminated Parameters Expansion')
        }

        const expansionContent = item.value.substr(2, item.value.length - 3)
        const { value: parserResult, parser } = parse(expansionContent)
        const newItem = visitAllRecursive({ parser, parserResult })
        ;[
          [newItem.tokens, newTokensToAdd],
          [newItem.comments, newCommentsToAdd],
        ].forEach(([arr, extraArr]) => {
          arr.forEach(i => {
            extraArr.push(i)
          })
        })

        const newNode = {
          body: [newItem],
          loc: {
            end: {
              column: item.value.length,
              line: 1,
            },
            start: {
              column: 0,
              line: 1,
            },
          },
          range: item.range.slice(0),
          type: 'ParameterExpansion',
        }

        const { start: stringTokenStart } = item.loc

        updatePositions(newNode, [item.range[0]], {
          column: stringTokenStart.column,
          line: stringTokenStart.line,
        })

        replaceItemInParent(item, newNode)
        item.parent = null
        tokensToRemove.push(item)
      }
    },

    leave: getRecursiveWalkLeaveFunction({
      newCommentsToAdd,
      newTokensToAdd,
      tokensToRemove,
    }),
  })

  return tree
}

export const getParametersExpansionVisitor = () => {
  return {
    visit(tree, visitAllRecursive) {
      return visitTreeToExtractPE(tree, visitAllRecursive)
    },
  }
}
