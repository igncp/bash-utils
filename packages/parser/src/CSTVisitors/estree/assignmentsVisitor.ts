import * as allTokens from '../../tokens'

import {
  getRangeAndLocForText,
  moveNextNodeInsideIfNoSeparation,
  replaceItemInParent,
} from './treeHelpers'
import { walk } from './walker'

const createAssignment = ({ token, tokenIdx, tokens }) => {
  // @TODO: Multiline assignments
  const [first, ...rest] = token.value.split('=')
  const last = rest.join('=')

  const assignmentNode = {
    ...token,
    body: [],
    type: 'Assignment',
  }

  const firstToken = {
    ...token,
    ...getRangeAndLocForText(token.loc.start, token.range[0], first),
    value: first,
  }

  assignmentNode.body.push(firstToken)

  const secondToken = {
    ...token,
    ...getRangeAndLocForText(firstToken.loc.end, firstToken.range[1], '='),
    value: '=',
  }

  assignmentNode.body.push(secondToken)

  if (last) {
    assignmentNode.body.push({
      ...token,
      ...getRangeAndLocForText(secondToken.loc.end, secondToken.range[1], last),
      value: last,
    })
  }

  tokens.splice(tokenIdx, 1)

  // using reverse order to add items back
  for (let i = assignmentNode.body.length - 1; i >= 0; i--) {
    tokens.splice(tokenIdx, 0, assignmentNode.body[i])
  }

  delete assignmentNode.value

  replaceItemInParent(token.parent, assignmentNode)
  assignmentNode.body.forEach(item => {
    item.parent = assignmentNode
    item.parentKey = 'body'
  })

  token.parent.parent = null
  token.parent = null

  if (!last) {
    moveNextNodeInsideIfNoSeparation(assignmentNode, 'body')
  }
}

const getIsValidAssignment = token => {
  if (
    token.type === allTokens.IDENTIFIER.tokenName &&
    token.value[0] !== '=' &&
    token.value.includes('=') &&
    token.parent.type !== 'Assignment'
  ) {
    const [first] = token.value.split('=')

    return /^[A-Za-z_]+$/.test(first)
  }

  return false
}

const visitAstToCreateAssignments = tree => {
  try {
    walk(tree, {
      enter(item) {
        if (item.type === 'Program') {
          const { tokens } = item
          let assignmentFound = true

          // restarting again every time to not deal with the index changes as
          // the array can grow. this could be optimized
          while (assignmentFound) {
            assignmentFound = false

            for (let i = 0; i < tokens.length; i++) {
              const token = tokens[i]

              if (getIsValidAssignment(token)) {
                createAssignment({ token, tokenIdx: i, tokens })
                assignmentFound = true
                break
              }
            }
          }

          throw new Error('exit')
        }
      },
    })
    // tslint:disable-next-line
  } catch (_) {}

  return tree
}

export const getAssignmentsVisitor = () => {
  return {
    visit(tree) {
      return visitAstToCreateAssignments(tree)
    },
  }
}

export const assignmentsVisitorKeysObj = {
  Assignment: ['body'],
}
