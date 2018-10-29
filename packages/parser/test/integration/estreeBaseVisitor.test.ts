import { getBaseVisitor } from '../../src/CSTVisitors/estree/baseVisitor'
import { parse } from '../../src/parse'

describe('estreeBaseVisitor', () => {
  it('throws when visit for a node returns falsy', () => {
    const { value, parser } = parse('foo bar')
    const {
      visit,
      _test: { visitor },
    } = getBaseVisitor({ parser })

    const origVisit = visitor.visit.bind(visitor)
    let time = 0

    visitor.visit = (...data) => {
      if (time === 1) {
        return null
      }

      time++

      return origVisit(...data)
    }

    const fn = () => visit(value)

    expect(fn).toThrow('Undefined visited node returned for')
  })
})
