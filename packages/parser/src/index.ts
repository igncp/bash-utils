import { CSTVisitor } from './CSTVisitor'
import { parse } from './parse'
import * as exposedTokens from './tokens'

const visitor = new CSTVisitor()

const buildASTFromSouce = (source: string): string => {
  const { value, tokens, parseErrors, lexErrors } = parse(source)
  const props = { tokens, parseErrors, lexErrors }

  if (parseErrors.length) {
    const { message, location } = parseErrors[0]
    const { column, line } = location.start

    const err = new SyntaxError(`${message} at ${line}:${column}`)

    throw err
  }

  const tree = visitor.visit(value, props)

  return tree
}

export { buildASTFromSouce, exposedTokens as tokens }
