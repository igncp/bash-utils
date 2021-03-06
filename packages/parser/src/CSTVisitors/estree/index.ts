import {
  assignmentsVisitorKeysObj,
  getAssignmentsVisitor,
} from './assignmentsVisitor'
import { getBacktickVisitor } from './backtickVisitor'
import { baseVisitorKeysObj, getBaseVisitor } from './baseVisitor'
import { getIfConditionsVisitor } from './ifConditionsVisitor'
import { getParametersExpansionVisitor } from './parametersExpansionVisitor'
import { getRemoveParentVistor } from './removeParentVisitor'
import { getShebangVisitor, shebangVisitorKeysObj } from './shebangVisitor'
import { getStringsVisitor } from './stringsVisitor'

import { walk } from './walker'

const VISITORS_FACTORIES = [
  getBaseVisitor,
  getBacktickVisitor,
  getStringsVisitor,
  getParametersExpansionVisitor,
  getShebangVisitor,
  getAssignmentsVisitor,
  getIfConditionsVisitor,
]

const visitAllRecursive = ({ parser, parserResult }) => {
  const visitors = VISITORS_FACTORIES.map((f: any) => {
    return f({ parser })
  })

  return visitors.reduce((tree, visitor) => {
    return visitor.visit(tree, visitAllRecursive)
  }, parserResult)
}

export const getESTreeConverterVisitor = ({ parser }) => {
  return {
    visit(parserResult) {
      const treeWithParents = visitAllRecursive({ parser, parserResult })

      // this should only be applied in the final tree
      return getRemoveParentVistor().visit(treeWithParents)
    },
  }
}

// exposed visitor keys after applying all visitors
export const visitorKeys = {
  ...baseVisitorKeysObj,
  ...assignmentsVisitorKeysObj,
  ...shebangVisitorKeysObj,
}

export const walkESTree = walk
