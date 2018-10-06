import { getDummyCSTVisitor } from './CSTVisitors/dummy'
import { getESTreeConverterVisitor } from './CSTVisitors/estree'
import { parse } from './parse'
import * as exposedTokens from './tokens'

const buildDummyTreeFromSouce = (source: string) => {
  const { value, parser } = parse(source)

  const visitor = getDummyCSTVisitor({ parser })

  return visitor.visit(value)
}

const buildESTreeAstFromSource = (source: string) => {
  const { value, parser } = parse(source)

  const visitor = getESTreeConverterVisitor({ parser })

  return visitor.visit(value)
}

export {
  buildDummyTreeFromSouce,
  buildESTreeAstFromSource,
  parse,
  exposedTokens as tokens,
}
