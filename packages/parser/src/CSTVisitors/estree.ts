import { EOF } from 'chevrotain'

const sortByRange = (a, b) => {
  if (typeof a.range[0] === 'undefined') {
    return 1
  }

  if (typeof b.range[0] === 'undefined') {
    return -1
  }

  return a.range[0] - b.range[0]
}

const parseToken = item => {
  if (item.tokenType === EOF) {
    return {
      loc: { start: {}, end: {} },
      range: [],
      type: 'EOF',
    }
  }

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
          end: { line: 0, column: 0 },
          start: { line: 0, column: 0 },
        },
        range: [0, 0],
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
      'Undefined visited node returned for ' + JSON.stringify(node)
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
    .sort()
}

const getNodeParsedProperties = (ctx, visitor) => {
  const sortedArr = convertASTObjectIntoSortedArray(ctx, visitor)

  return {
    ...getLocationAndRangeForNodes(sortedArr),
    sortedArr,
  }
}

export const getESTreeConverterVisitor = ({ parser }) => {
  const BaseSQLVisitorWithDefaults = parser.getBaseCstVisitorConstructorWithDefaults()

  class CSTVisitor extends BaseSQLVisitorWithDefaults {
    constructor() {
      super()

      this.validateVisitor()

      this.tokens = []
    }

    public onTokenFound(token) {
      this.tokens.push(token)
    }

    public Command(ctx) {
      const { sortedArr: body, ...position } = getNodeParsedProperties(
        ctx,
        this
      )

      return {
        body,
        ...position,
        type: 'Command',
      }
    }

    public Script(ctx) {
      const { sortedArr: body, ...position } = getNodeParsedProperties(
        ctx,
        this
      )
      const tokens = this.getProgramTokens()

      return {
        body,
        tokens,
        ...position,
        type: 'Program',
      }
    }

    private getProgramTokens() {
      return this.tokens
        .slice(0)
        .sort(sortByRange)
        .filter(t => t.type !== 'EOF')
    }
  }

  return new CSTVisitor() as any
}
