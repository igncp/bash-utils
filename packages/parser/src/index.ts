import { getDummyCSTVisitor } from './CSTVisitors/dummy'
import { getESTreeConverterVisitor } from './CSTVisitors/estree'
import { parse } from './parse'
import * as exposedTokens from './tokens'

const buildDummyTreeFromSouce = (source: string) => {
  const { value, parser } = parse(source)

  const visitor = getDummyCSTVisitor({ parser })
  const tree = visitor.visit(value)

  return tree
}

const buildESTreeAstFromSource = (source: string) => {
  const { value, parser } = parse(source)

  const visitor = getESTreeConverterVisitor({ parser })
  const tree = visitor.visit(value)

  return tree
}

export {
  buildDummyTreeFromSouce,
  buildESTreeAstFromSource,
  parse,
  exposedTokens as tokens,
}
