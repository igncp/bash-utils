import * as allTokens from '../../tokens'

import { walk } from './walker'

// http://tldp.org/LDP/abs/html/comparison-ops.html

const OPERATORS_VALUES = [
  '!=',
  '-eq',
  '-ge',
  '-gt',
  '-le',
  '-lt',
  '-n',
  '-ne',
  '-z',
  '-d',
  '-f',
  '<',
  '<',
  '<=',
  '=',
  '==',
  '>',
  '>',
  '>=',
]

const getIsOperatorLiteralNode = literalNode => {
  if (
    literalNode.body.length !== 1 ||
    literalNode.body[0].type !== allTokens.IDENTIFIER.tokenName
  ) {
    return false
  }

  const { value } = literalNode.body[0]

  if (OPERATORS_VALUES.indexOf(value) !== -1) {
    return true
  }

  return false
}

const removeBeginningExclamationMarks = (acc, literalNode) => {
  if (
    literalNode.body.length !== 1 ||
    literalNode.body[0].type !== allTokens.IDENTIFIER.tokenName ||
    literalNode.body[0].value !== '!'
  ) {
    acc.push(literalNode)
  }

  return acc
}

const validateSingleBracketsCondition = node => {
  const literalNodes = node.body
    .filter(n => n.type === 'CommandUnit')
    .map(b => b.body[0])
    .filter(n => n.type === 'Literal')
    .reduce(removeBeginningExclamationMarks, [])

  if (literalNodes.length > 3) {
    throw new Error('Too many literal nodes')
  }

  const operatorLiteralNodes = literalNodes.filter(getIsOperatorLiteralNode)

  if (operatorLiteralNodes.length > 1) {
    throw new Error('Too many operator literal nodes')
  }

  const restLiteralNodes = literalNodes.filter(
    n => operatorLiteralNodes.indexOf(n) === -1
  )

  if (operatorLiteralNodes.length === 0 && restLiteralNodes.length > 1) {
    throw new Error('Too many literal nodes')
  }

  if (restLiteralNodes.length === 0) {
    throw new Error('Missing literal nodes')
  }
}

const visitToParseIfConditions = tree => {
  walk(tree, {
    enter(item) {
      if (item.type === 'IfConditionSingleBrackets') {
        validateSingleBracketsCondition(item)
      }
    },
  })

  return tree
}

export const getIfConditionsVisitor = () => {
  return {
    visit(tree) {
      return visitToParseIfConditions(tree)
    },
  }
}
