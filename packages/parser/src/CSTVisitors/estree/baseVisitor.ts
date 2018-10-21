import { EOF } from 'chevrotain'

import * as allTokens from '../../tokens'

import { sortByRange } from './treeHelpers'

const parseToken = item => {
  if (item.tokenType === EOF) {
    return {
      loc: { start: {}, end: {} },
      range: [],
      type: 'EOF',
    }
  }

  // https://eslint.org/docs/developer-guide/working-with-custom-parsers#all-nodes
  // code.slice(node.range[0], node.range[1]) must be the text of the node.
  // This range does not include spaces/parentheses which are around the node.
  const range = [item.startOffset, item.startOffset + item.image.length]

  return {
    loc: {
      end: {
        column: item.startColumn + item.image.length,
        line: item.startLine,
      },
      start: { line: item.startLine, column: item.startColumn },
    },
    range,
    type: item.tokenType.tokenName,
    value: item.image,
  }
}

const getLocationAndRangeForNodes = nodesArr => {
  const first = nodesArr[0]
  let last = nodesArr[nodesArr.length - 1]

  // EOF
  if (last.range.length === 0) {
    if (first !== last) {
      last = nodesArr[nodesArr.length - 2]
    } else {
      return {
        loc: {
          end: { line: 1, column: 1 },
          start: { line: 1, column: 0 },
        },
        range: [0, 1],
      }
    }
  }

  return {
    loc: {
      end: { line: last.loc.end.line, column: last.loc.end.column },
      start: { line: first.loc.start.line, column: first.loc.start.column },
    },
    range: [first.range[0], last.range[1]],
  }
}

const parseNode = (node, visitor) => {
  const visitedNode = visitor.visit(node)

  if (!visitedNode) {
    throw new Error(
      `Undefined visited node returned for ${JSON.stringify(node)}`
    )
  }

  return visitedNode
}

const getItemHandler = visitor => item => {
  const isToken = !!item.tokenType

  if (isToken) {
    const token = parseToken(item)

    visitor.onTokenFound(token)

    return token
  }

  return parseNode(item, visitor)
}

const visitASTObjectKeys = (ctx, visitor) => {
  return Object.keys(ctx).reduce((acc, ctxKey) => {
    const items = ctx[ctxKey]

    acc[ctxKey] = items.map(getItemHandler(visitor))

    return acc
  }, {})
}

const convertASTObjectIntoSortedArray = (ctx, visitor) => {
  const newCtx = visitASTObjectKeys(ctx, visitor)

  return Object.keys(newCtx)
    .reduce((acc, ctxKey) => {
      const items = newCtx[ctxKey]

      items.forEach(item => {
        acc.push(item)
      })

      return acc
    }, [])
    .sort(sortByRange)
}

const getNodeParsedProperties = (ctx, visitor) => {
  const sortedArr = convertASTObjectIntoSortedArray(ctx, visitor)

  return {
    ...getLocationAndRangeForNodes(sortedArr),
    sortedArr,
  }
}

const transformChildrenTo = ({ type, key, ctx, visitor }) => {
  const { sortedArr, ...position } = getNodeParsedProperties(ctx, visitor)

  return {
    [key]: sortedArr,
    ...position,
    type,
  }
}

const baseVisitorKeysWithBody = [
  'BacktickExpression',
  'Command',
  'CommandSubstitution',
  'CommandSubstitutionGroup',
  'CommandUnit',
  'CommandsGroup',
  'Comment',
  'ComposedCommand',
  'IfCondition',
  'IfConditionDoubleBrackets',
  'IfConditionGroup',
  'IfConditionSingleBrackets',
  'IfExpression',
  'Literal',
  'MultipleCommand',
  'MultipleCommandWithTerminator',
  'ParameterExpansion',
  'Pipeline',
  'PipelineBlock',
  'ProcessSubstitution',
  'Program',
  'Redirection',
  'RedirectionA',
  'RedirectionB',
  'SubShell',
  'Termination',
]

export const baseVisitorKeysObj = baseVisitorKeysWithBody.reduce((acc, key) => {
  return {
    acc,
    [key]: ['body'],
  }
}, {})

export const getBaseVisitor = ({ parser }) => {
  const BaseSQLVisitorWithDefaults = parser.getBaseCstVisitorConstructorWithDefaults()

  class CSTVisitor extends BaseSQLVisitorWithDefaults {
    constructor() {
      super()

      this.validateVisitor()

      this.comments = []
      this.tokens = []

      baseVisitorKeysWithBody.filter(key => key !== 'Program').forEach(type => {
        this[type] = ctx => {
          const key = 'body'

          const node = transformChildrenTo({ type, ctx, key, visitor: this })

          return this.getSameNodeWithParentInChildren(node, [key])
        }
      })
    }

    public onTokenFound(token) {
      if (token.type === allTokens.COMMENT.tokenName) {
        this.comments.push(token)
      } else {
        this.tokens.push(token)
      }
    }

    public Script(ctx) {
      const result = transformChildrenTo({
        ctx,
        key: 'body',
        type: 'Program',
        visitor: this,
      })
      const tokens = this.getProgramTokens()
      const comments = this.getProgramComments()

      return this.getSameNodeWithParentInChildren(
        {
          ...result,
          comments,
          tokens,
        },
        ['body']
      )
    }

    public getSameNodeWithParentInChildren(node, keys) {
      keys.forEach(key => {
        const children = node[key] || []

        children.forEach(child => {
          child.parent = node
          child.parentKey = key
        })
      })

      return node
    }

    private getProgramTokens() {
      return this.tokens
        .slice(0)
        .sort(sortByRange)
        .filter(t => t.type !== 'EOF')
    }

    private getProgramComments() {
      return this.comments.slice(0).sort(sortByRange)
    }
  }

  const visitor = new CSTVisitor()

  return {
    visit(parserResult) {
      return visitor.visit(parserResult)
    },
  }
}
