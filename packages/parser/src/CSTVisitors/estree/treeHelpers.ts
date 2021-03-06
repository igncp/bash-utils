import { walk } from './walker'

export const replaceItemInParent = (item, newItem) => {
  const { parent, parentKey } = item

  newItem.parent = parent
  newItem.parentKey = parentKey

  for (let i = 0; i < parent[parentKey].length; i++) {
    if (parent[parentKey][i] === item) {
      parent[parentKey][i] = newItem

      return
    }
  }
}

const findNextItem = (arr, item) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === item) {
      return arr[i + 1]
    }
  }

  return undefined
}

export const moveNextNodeInsideIfNoSeparation = (node, key) => {
  let refNode = node
  let sibblings = []

  while (refNode.parent) {
    sibblings = refNode.parent[refNode.parentKey]

    if (sibblings.length > 1) {
      break
    }

    refNode = refNode.parent
  }

  const nextItem = findNextItem(sibblings, refNode)

  if (nextItem && nextItem.range[0] === node.range[1]) {
    sibblings.splice(sibblings.indexOf(nextItem), 1)

    node[key].push(nextItem)

    nextItem.parent = node
    nextItem.parentKey = key
  }
}

export const getRangeAndLocForText = (initialPos, initialRange, text) => {
  return {
    loc: {
      end: {
        column: initialPos.column + text.length,
        line: initialPos.line,
      },
      start: { line: initialPos.line, column: initialPos.column },
    },
    range: [initialRange, initialRange + text.length],
  }
}

export const sortByRange = (a, b) => {
  if (typeof a.range[0] === 'undefined') {
    return 1
  }

  if (typeof b.range[0] === 'undefined') {
    return -1
  }

  return a.range[0] - b.range[0]
}

export const updatePositions = (item, baseRange, basePos) => {
  walk(item, {
    enter(subItem) {
      if (!subItem.range || subItem.range.length === 0) {
        return
      }

      subItem.range[0] += baseRange[0]
      subItem.range[1] += baseRange[0]

      if (subItem.loc.start.line === 1) {
        subItem.loc.start.column += basePos.column
        subItem.loc.end.column += basePos.column
      }

      subItem.loc.start.line += basePos.line - 1
      subItem.loc.end.line += basePos.line - 1
    },
  })
}

export const getIsValidVariableName = text => {
  return /^[A-Za-z_]+$/.test(text)
}

export const getRecursiveWalkLeaveFunction = ({
  newTokensToAdd,
  newCommentsToAdd,
  tokensToRemove,
}) => {
  return item => {
    if (item.type === 'Program') {
      for (
        let allTokensIdx = item.tokens.length - 1;
        allTokensIdx >= 0;
        allTokensIdx--
      ) {
        const token = item.tokens[allTokensIdx]
        const idxInTokensToRemove = tokensToRemove.indexOf(token)

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
  }
}
