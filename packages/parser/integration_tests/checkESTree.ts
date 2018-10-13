import { writeFileSync } from 'fs'

import { buildESTreeAstFromSource, parse } from '../src'
import { getESTreeConverterVisitor } from '../src/CSTVisitors/estree'
import { walk } from '../src/CSTVisitors/estree/walker'

const debug = false

const getIsPos1Before2 = (pos1, pos2) =>
  pos1.line < pos2.line ||
  (pos1.line === pos2.line && pos1.column < pos2.column)

const getAreLocsOverlapping = (locA, locB) => {
  return (
    getIsPos1Before2(locA.start, locB.end) &&
    getIsPos1Before2(locB.start, locA.end)
  )
}

const runCustomFnOnTree = ({ treeResult, traverseFn }) => {
  walk(treeResult, {
    enter(...args) {
      traverseFn(...args)
    },
  })
}

const validateRangesAndLocsForArr = (arr, allArrays) => {
  const restItems = allArrays
    .filter(a => a !== arr)
    .reduce((acc, a) => a.concat(a), [])

  arr.forEach((item, idx) => {
    const prevItem = arr[idx - 1]

    try {
      expect(item.range[0] >= 0).toEqual(true)
      expect(item.range[1] >= 0).toEqual(true)
      expect(item.range[0] < item.range[1]).toEqual(true)
      expect(getIsPos1Before2(item.loc.start, item.loc.end)).toEqual(true)

      if (prevItem) {
        expect(prevItem).not.toBe(item)
        expect(getIsPos1Before2(item.loc.start, prevItem.loc.end)).toEqual(
          false
        )
        expect(prevItem.range[1] <= item.range[0]).toEqual(true)
      }
    } catch (e) {
      // debugger
      throw e
    }

    restItems.forEach(otherItem => {
      //  zzz
      //       xxxx
      //             zzz
      const isRangeNotOverlapping =
        item.range[0] >= otherItem.range[1] ||
        item.range[1] <= otherItem.range[0]

      try {
        expect(item).not.toBe(otherItem)
        expect(isRangeNotOverlapping).toEqual(true)
        expect(getAreLocsOverlapping(item.loc, otherItem.loc)).toEqual(false)
      } catch (e) {
        // debugger
        throw e
      }
    })
  })
}

const validateRangesAndLocs = ({ treeResult }) => {
  const { tokens, comments } = treeResult

  const allArrays = [tokens, comments]

  validateRangesAndLocsForArr(tokens, allArrays)
  validateRangesAndLocsForArr(comments, allArrays)
}

const writeDebugFile = (filename, value) => {
  writeFileSync(
    __dirname + '/../debug/' + filename + '.json',
    JSON.stringify(value, null, 2)
  )
}

const getNodeVisitedFn = ({ value, treeResult }) => nodeName => {
  if (!nodeName) {
    throw new Error('Invalid nodeName: ' + nodeName)
  }

  let visited = false

  try {
    walk(treeResult, {
      enter: node => {
        if (node.type === nodeName) {
          visited = true

          // to improve performance
          throw new Error('exit')
        }
      },
    })

    // tslint:disable-next-line no-empty
  } catch (_) {}

  return visited
}

const getTokenExistingFn = ({ treeResult }) => token => {
  const foundToken = treeResult.tokens.find(t => t.type === token.tokenName)

  return !!foundToken
}

const getContainsCommentsFn = ({ treeResult }) => () => {
  return treeResult.comments.length > 0
}

// Till the grammar is relatively stable, only expected errors / success are
// tested

export default (
  text,
  {
    throws = false,
    errorsCheck = false,
    containsComments = null,
    containingNodes = [],
    missingNodes = [],
    containingTokens = [],
    missingTokens = [],
    traverseFn = (...args) => args,
  }: any = {}
) => {
  let isExpectedThrow = false

  const checkingFn = () => {
    let value
    let lexErrors
    let parseErrors
    let parser

    try {
      // tslint:disable-next-line
      isExpectedThrow = true
      ;({ value, lexErrors, parseErrors, parser } = parse(text))
    } catch (e) {
      // debugger
      throw e
    }

    isExpectedThrow = false

    if (debug) {
      writeDebugFile('parser-result', value)
    }

    isExpectedThrow = true

    expect(lexErrors.length).toEqual(0)
    expect(parseErrors.length).toEqual(0)

    const visitor = getESTreeConverterVisitor({ parser })

    const treeResult = visitor.visit(value)

    isExpectedThrow = false

    if (debug) {
      writeDebugFile('visitor-result', treeResult)
    }

    const getNodeVisited = getNodeVisitedFn({ value, treeResult })

    containingNodes.forEach(nodeName => {
      expect(getNodeVisited(nodeName)).toEqual(true)
    })

    missingNodes.forEach(nodeName => {
      expect(getNodeVisited(nodeName)).toEqual(false)
    })

    const getTokenExisting = getTokenExistingFn({ treeResult })
    const getContainsComments = getContainsCommentsFn({ treeResult })

    containingTokens.forEach(token => {
      expect(getTokenExisting(token)).toEqual(true)
    })

    missingTokens.forEach(token => {
      expect(getTokenExisting(token)).toEqual(false)
    })

    if (typeof containsComments === 'boolean') {
      expect(getContainsComments()).toEqual(containsComments)
    }

    validateRangesAndLocs({ treeResult })

    runCustomFnOnTree({ treeResult, traverseFn })
  }

  try {
    if (throws) {
      expect(checkingFn).toThrow()
      expect(isExpectedThrow).toEqual(true)
    } else {
      expect(checkingFn).not.toThrow()
    }
  } catch (e) {
    if (!errorsCheck) {
      // debugger
      throw e
    }

    return
  }

  if (errorsCheck) {
    throw new Error('no errors on checks')
  }
}
