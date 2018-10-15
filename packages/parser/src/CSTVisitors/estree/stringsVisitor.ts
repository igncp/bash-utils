import { parse } from '../../parse'
import * as allTokens from '../../tokens'

import {
  replaceItemInParent,
  sortByRange,
  updatePositions,
} from './treeHelpers'
import { walk } from './walker'

const getInterpolationStructures = text => {
  const structuresStack = []
  const structures = []

  for (let i = 0; i <= text.length - 1; i++) {
    const ch = text[i]

    if (ch === '(' && text[i - 1] === '$' && text[i - 2] !== '\\') {
      structuresStack.push(i - 1)
    }

    if (ch === ')' && structuresStack.length > 0) {
      const beginning = structuresStack.pop()

      structures.push({
        beginning,
        depth: structuresStack.length,
        end: i + 1,
      })
    }
  }

  return structures
}

const getInitialBodyFromInterpolationStructures = (text, structures) => {
  const body = []

  structures.forEach((structure, structureIdx) => {
    const lastItemInBody = body[body.length - 1]

    if (structure.beginning !== 0) {
      if (!lastItemInBody) {
        body.push({
          range: [0, structure.beginning],
          type: 'RawString',
        })
      } else if (lastItemInBody.end !== structure.beginning) {
        body.push({
          range: [lastItemInBody.end, structure.beginning],
          type: 'RawString',
        })
      }
    }

    body.push({
      range: [structure.beginning, structure.end],
      type: 'InterpolationFragment',
    })

    if (
      structureIdx === structures.length - 1 &&
      structure.end !== text.length
    ) {
      body.push({
        range: [structure.end, text.length],
        type: 'RawString',
      })
    }
  })

  body.forEach(item => {
    item.value = text.substr(item.range[0], item.range[1] - item.range[0])
    item.loc = {
      end: {
        column: item.range[1],
        line: 0,
      },
      start: {
        column: item.range[0],
        line: 0,
      },
    }
  })

  return body
}

const visitTreeToParseStrings = (tree, visitAllRecursive) => {
  const newTokensToAdd = []
  const newCommentsToAdd = []
  const stringTokensToRemove = []

  walk(tree, {
    enter(item) {
      // is important to check for `item.parent` as the token will
      // pass through here twice
      if (item.type === allTokens.STRING.tokenName && item.parent) {
        if (item.value[0] !== '"') {
          return
        }

        const interpolationStructures = getInterpolationStructures(item.value)

        if (interpolationStructures.length === 0) {
          return
        }

        const shallowStructures = interpolationStructures.filter(
          s => s.depth === 0
        )

        const newNode = {
          body: getInitialBodyFromInterpolationStructures(
            item.value,
            shallowStructures
          ),
          loc: {
            end: {
              column: item.value.length,
              line: 0,
            },
            start: {
              column: 0,
              line: 0,
            },
          },
          range: item.range.slice(0),
          type: 'CompoundString',
        }

        const { start: stringTokenStart } = item.loc

        updatePositions(newNode, [item.range[0]], {
          column: stringTokenStart.column,
          line: stringTokenStart.line,
        })

        newNode.body.forEach(bodyItem => {
          if (bodyItem.type !== 'InterpolationFragment') {
            return bodyItem
          }

          const textToParse = bodyItem.value.substr(
            2,
            bodyItem.value.length - 3
          )
          const { value: parserResult, parser } = parse(textToParse)
          const newItem = visitAllRecursive({ parser, parserResult })
          const multipleCommand = newItem.body[0]

          const { start } = bodyItem.loc

          updatePositions(multipleCommand, [bodyItem.range[0]], {
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

          bodyItem.body = [multipleCommand]
        })

        replaceItemInParent(item, newNode)
        item.parent = null
        stringTokensToRemove.push(item)
      }
    },

    leave(item) {
      if (item.type === 'Program') {
        for (let i = item.tokens.length - 1; i >= 0; i--) {
          const token = item.tokens[i]
          const idx = stringTokensToRemove.indexOf(token)

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

export const getStringsVisitor = () => {
  return {
    visit(tree, visitAllRecursive) {
      return visitTreeToParseStrings(tree, visitAllRecursive)
    },
  }
}
