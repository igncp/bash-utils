import * as exposedInterface from '../../src'
import { getDummyCSTVisitor } from '../../src/CSTVisitors/dummy'
import {
  getESTreeConverterVisitor,
  visitorKeys as visitorKeysForESTree,
} from '../../src/CSTVisitors/estree'
import { parse } from '../../src/parse'
import * as allTokens from '../../src/tokens'

describe('exposedInterface', () => {
  it('has the expected shape', () => {
    expect(exposedInterface).toEqual({
      buildDummyTreeFromSouce: expect.any(Function),
      buildESTreeAstFromSource: expect.any(Function),
      parse,
      tokens: allTokens,
      visitorKeysForESTree,
      walkESTree: expect.any(Function),
    })
  })

  describe('buildESTreeAstFromSource', () => {
    it('has the expected implementation', () => {
      const result = exposedInterface.buildESTreeAstFromSource('foo')
      const { parser, value } = parse('foo')
      const visitor = getESTreeConverterVisitor({ parser })
      const result2 = visitor.visit(value)

      expect(result).toEqual(result2)
    })
  })

  describe('buildDummyTreeFromSouce', () => {
    it('has the expected implementation', () => {
      const result = exposedInterface.buildDummyTreeFromSouce('foo')
      const { parser, value } = parse('foo')
      const visitor = getDummyCSTVisitor({ parser })
      const result2 = visitor.visit(value)

      expect(result).toEqual(result2)
    })
  })
})
