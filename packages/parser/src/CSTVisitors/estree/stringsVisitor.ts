import { parse } from '../../parse'
import * as allTokens from '../../tokens'

import {
  getIsValidVariableName,
  getRecursiveWalkLeaveFunction,
  replaceItemInParent,
  updatePositions,
} from './treeHelpers'
import { walk } from './walker'

const getNextPossibleVariableName = (text, chIdx) => {
  const remainingText = text.substr(chIdx, text.length)
  let variableName = ''

  for (let i = 0; i < remainingText.length; i++) {
    const ch = remainingText[i]

    if (!getIsValidVariableName(ch)) {
      break
    }

    variableName += ch
  }

  return variableName || null
}

const getInterpolationStructures = text => {
  const structuresStack = []
  const structures = []

  text.split('').forEach((ch, chIdx) => {
    const nextCh = text[chIdx + 1]
    const prevCh = text[chIdx - 1]
    const lastStructureInStack = structuresStack[structuresStack.length - 1]

    if (ch === '$' && prevCh !== '\\') {
      if (nextCh === '(') {
        structuresStack.push({
          chIdx,
          type: 'commandSubstitution',
        })

        return
      }

      const nextPossibleVariableName = getNextPossibleVariableName(
        text,
        chIdx + 1
      )

      if (nextPossibleVariableName) {
        structuresStack.push({
          chIdx,
          endIdx: chIdx + nextPossibleVariableName.length + 1,
          type: 'VariableInString',
        })

        return
      }
    } else if (lastStructureInStack) {
      if (ch === ')' && lastStructureInStack.type === 'commandSubstitution') {
        const beginning = structuresStack.pop().chIdx

        structures.push({
          beginning,
          depth: structuresStack.length,
          end: chIdx + 1,
          type: 'commandSubstitution',
        })
      } else if (
        lastStructureInStack.type === 'VariableInString' &&
        chIdx === lastStructureInStack.endIdx
      ) {
        const beginning = structuresStack.pop().chIdx

        structures.push({
          beginning,
          depth: structuresStack.length,
          end: chIdx,
          type: 'VariableInString',
        })
      }
    }
  })

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
      } else if (lastItemInBody.range[1] !== structure.beginning) {
        body.push({
          range: [lastItemInBody.range[1], structure.beginning],
          type: 'RawString',
        })
      }
    }

    const range = [structure.beginning, structure.end]

    if (structure.type === 'commandSubstitution') {
      body.push({
        range,
        type: 'InterpolationFragment',
      })
    } else if (structure.type === 'VariableInString') {
      body.push({
        range,
        type: 'VariableInString',
      })
    }

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
        line: 1,
      },
      start: {
        column: item.range[0],
        line: 1,
      },
    }
  })

  return body
}

const visitTreeToParseStrings = (tree, visitAllRecursive) => {
  const newTokensToAdd = []
  const newCommentsToAdd = []
  const tokensToRemove = []

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
              line: 1,
            },
            start: {
              column: 0,
              line: 1,
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

          multipleCommand.parent = bodyItem
          multipleCommand.parentKey = 'body'
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

export const getStringsVisitor = () => {
  return {
    visit(tree, visitAllRecursive) {
      return visitTreeToParseStrings(tree, visitAllRecursive)
    },
  }
}
