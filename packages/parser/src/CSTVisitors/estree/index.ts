import { getAssignmentsVisitor } from './assignmentsVisitor'
import { getBaseVisitor } from './baseVisitor'
import { getRemoveParentVistor } from './removeParentVisitor'
import { getShebangVisitor } from './shebangVisitor'

const VISITORS_FACTORIES = [
  getBaseVisitor,
  getShebangVisitor,
  getAssignmentsVisitor,
  getRemoveParentVistor, // this should be the last
]

export const getESTreeConverterVisitor = ({ parser }) => {
  const visitors = VISITORS_FACTORIES.map(f => {
    return f({ parser })
  })

  return {
    visit(parserResult) {
      return visitors.reduce((tree, visitor) => {
        return visitor.visit(tree)
      }, parserResult)
    },
  }
}

const visitorKeysWithBody = [
  'Assignment',
  'Command',
  'IfCondition',
  'IfExpression',
  'MultipleCommand',
  'Program',
  'Redirection',
  'RedirectionA',
  'RedirectionB',
  'Shebang',
].reduce((acc, key) => {
  return {
    acc,
    [key]: ['body'],
  }
}, {})

// exposed visitor keys after applying all visitors
export const visitorKeys = {
  ...visitorKeysWithBody,
}
