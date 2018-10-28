import { parse } from '../../src'
import { getDummyCSTVisitor } from '../../src/CSTVisitors/dummy'

describe('parse errors', () => {
  it('leaves the tree unchanged', () => {
    const { value, parser } = parse('foo')

    const visitor = getDummyCSTVisitor({ parser })

    expect(visitor.visit(value)).toEqual(value)
  })
})
