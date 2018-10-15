import { parse } from '../../parse'
import * as allTokens from '../../tokens'

import {
  replaceItemInParent,
  sortByRange,
  updatePositions,
} from './treeHelpers'
import { walk } from './walker'

const visitTreeToParseBackticks = (tree, visitAllRecursive) => {
  const newTokensToAdd = []
  const newCommentsToAdd = []
  const backtickTokensToRemove = []

  walk(tree, {
    enter(item) {
      // is important to check for `item.parent` as the backtick token will
      // pass through here twice
      if (item.type === allTokens.BACKTICK_STRING.tokenName && item.parent) {
        const fullValueWithoutBackticks = item.value.substr(
          1,
          item.value.length - 2
        )

        const { value: parserResult, parser } = parse(fullValueWithoutBackticks)
        const newItem = visitAllRecursive({ parser, parserResult })
        const multipleCommand = newItem.body[0]

        replaceItemInParent(item, multipleCommand)
        item.parent = null

        backtickTokensToRemove.push(item)

        const { start } = item.loc

        updatePositions(multipleCommand, [item.range[0] + 1], {
          column: start.column + 1,
          line: start.line,
        })
        ;[
          [newItem.tokens, newTokensToAdd],
          [newItem.comments, newCommentsToAdd],
        ].forEach(([arr, extraArr]) => {
          arr.forEach(i => {
            extraArr.push(i)
          })
        })
      }
    },

    leave(item) {
      if (item.type === 'Program') {
        for (let i = item.tokens.length - 1; i >= 0; i--) {
          const token = item.tokens[i]
          const idx = backtickTokensToRemove.indexOf(token)

          if (idx !== -1) {
            item.tokens.splice(idx, 1)
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

export const getBacktickVisitor = () => {
  return {
    visit(tree, visitAllRecursive) {
      return visitTreeToParseBackticks(tree, visitAllRecursive)
    },
  }
}
