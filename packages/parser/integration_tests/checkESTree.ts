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

const validateRangesAndLocs = ({ treeResult }) => {
  const { tokens, comments } = treeResult

  tokens
    .concat(comments)
    .sort((a, b) => {
      if (typeof a.range[0] === 'undefined') {
        return 1
      }

      if (typeof b.range[0] === 'undefined') {
        return -1
      }

      return a.range[0] - b.range[0]
    })
    .forEach((treeItem, idx, arr) => {
      try {
        expect(treeItem.range[0] >= 0).toEqual(true)
        expect(treeItem.range[1] >= 0).toEqual(true)
        expect(treeItem.range[0] < treeItem.range[1]).toEqual(true)
        expect(getIsPos1Before2(treeItem.loc.start, treeItem.loc.end)).toEqual(
          true
        )
      } catch (e) {
        // debugger
        throw e
      }

      arr.forEach(otherItem => {
        if (treeItem === otherItem) {
          return
        }

        //  zzz
        //       xxxx
        //             zzz
        const isRangeNotOverlapping =
          treeItem.range[0] >= otherItem.range[1] ||
          treeItem.range[1] <= otherItem.range[0]

        try {
          expect(isRangeNotOverlapping).toEqual(true)
          expect(getAreLocsOverlapping(treeItem.loc, otherItem.loc)).toEqual(
            false
          )
        } catch (e) {
          // debugger
          throw e
        }
      })
    })
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
    containedNodes = [],
    missingNodes = [],
    containedTokens = [],
    missingTokens = [],
  } = {}
) => {
  if (throws) {
    expect(() => (parse as any)(text)).toThrow()
    expect(() => buildESTreeAstFromSource(text)).toThrow()
  } else {
    const fn = () => {
      const { value, lexErrors, parseErrors, parser } = parse(text)

      if (debug) {
        writeDebugFile('parser-result', value)
      }

      expect(lexErrors.length).toEqual(0)
      expect(parseErrors.length).toEqual(0)

      const visitor = getESTreeConverterVisitor({ parser })

      const treeResult = visitor.visit(value)

      if (debug) {
        writeDebugFile('visitor-result', treeResult)
      }

      const getNodeVisited = getNodeVisitedFn({ value, treeResult })

      containedNodes.forEach(nodeName => {
        expect(getNodeVisited(nodeName)).toEqual(true)
      })

      missingNodes.forEach(nodeName => {
        expect(getNodeVisited(nodeName)).toEqual(false)
      })

      const getTokenExisting = getTokenExistingFn({ treeResult })
      const getContainsComments = getContainsCommentsFn({ treeResult })

      containedTokens.forEach(token => {
        expect(getTokenExisting(token)).toEqual(true)
      })

      missingTokens.forEach(token => {
        expect(getTokenExisting(token)).toEqual(false)
      })

      if (typeof containsComments === 'boolean') {
        expect(getContainsComments()).toEqual(containsComments)
      }

      validateRangesAndLocs({ treeResult })
    }

    try {
      expect(fn).not.toThrow()
    } catch (e) {
      if (!errorsCheck) {
        throw e
      }

      return
    }

    if (errorsCheck) {
      throw new Error('no errors on checks')
    }
  }
}
