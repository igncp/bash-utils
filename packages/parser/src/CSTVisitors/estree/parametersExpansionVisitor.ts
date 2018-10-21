import { parse } from '../../parse'
import * as allTokens from '../../tokens'

import {
  replaceItemInParent,
  sortByRange,
  updatePositions,
} from './treeHelpers'
import { walk } from './walker'

const visitTreeToExtractPE = (tree, visitAllRecursive) => {
  const newTokensToAdd = []
  const newCommentsToAdd = []
  const stringTokensToRemove = []

  walk(tree, {
    enter(item) {
      // is important to check for `item.parent` as the token will
      // pass through here twice
      if (item.type === allTokens.IDENTIFIER.tokenName && item.parent) {
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
        stringTokensToRemove.push(item)
      }
    },

    leave(item) {
      if (item.type === 'Program') {
        for (
          let allTokensIdx = item.tokens.length - 1;
          allTokensIdx >= 0;
          allTokensIdx--
        ) {
          const token = item.tokens[allTokensIdx]
          const idxInTokensToRemove = stringTokensToRemove.indexOf(token)

          if (idxInTokensToRemove !== -1) {
            item.tokens.splice(allTokensIdx, 1)
          }
        }

        newTokensToAdd.forEach(t => {
          item.tokens.push(t)
        })
        newCommentsToAdd.forEach(t => {
          item.comments.push(t)
        })

        item.tokens.sort(sortByRange)
        item.comments.sort(sortByRange)
      }
    },
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
