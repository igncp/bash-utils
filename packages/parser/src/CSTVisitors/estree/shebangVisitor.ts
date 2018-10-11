import * as allTokens from '../../tokens'

import { replaceItemInParent } from './treeHelpers'
import { walk } from './walker'

const getIsValidShebang = ({ item, comments, tokens }) => {
  if (item.value.substr(0, 2) !== '#!') {
    return false
  }

  const isAnotherItemInSameLine = items => {
    for (let i = 0; i < items.length; i++) {
      if (
        items[i] !== item &&
        items[i].loc.start.line === 1 &&
        items[i].type !== allTokens.NEWLINE.tokenName
      ) {
        return true
      } else if (items[i].loc.start.line > 1) {
        break
      }
    }

    return false
  }

  if (isAnotherItemInSameLine(comments) || isAnotherItemInSameLine(tokens)) {
    return false
  }

  return true
}

const visitAstToCreateShebang = tree => {
  let comments
  let tokens

  try {
    walk(tree, {
      enter(item) {
        if (item.type === 'Program') {
          comments = item.comments
          tokens = item.tokens
        } else if (
          item.type === allTokens.COMMENT.tokenName &&
          item.loc.start.line === 1 &&
          getIsValidShebang({ item, comments, tokens })
        ) {
          const newItem = {
            ...item,
            body: [item],
            type: 'Shebang',
          }

          replaceItemInParent(item, newItem)

          item.parent = newItem
          item.parentKey = newItem

          throw new Error('exit')
        }
      },
    })
    // tslint:disable-next-line
  } catch (_) {}

  return tree
}

export const getShebangVisitor = () => {
  return {
    visit(tree) {
      return visitAstToCreateShebang(tree)
    },
  }
}
