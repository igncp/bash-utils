import * as allTokens from '../../tokens'

import { replaceItemInParent } from './treeHelpers'
import { walk } from './walker'

const createAssignment = (token, tokenIdx, tokens) => {
  // @TODO: Multiline assignments
  // @TODO: Assignments to strings

  const [first, ...rest] = token.value.split('=')
  const last = rest.join('=')

  const assignmentNode = {
    ...token,
    body: [],
    type: 'Assignment',
  }

  assignmentNode.body.push({
    ...token,
    loc: {
      end: {
        column: token.loc.start.column + first.length,
        line: token.loc.start.line,
      },
      start: { line: token.loc.start.line, column: token.loc.start.column },
    },
    range: [token.range[0], token.range[0] + first.length],
    value: first,
  })

  assignmentNode.body.push({
    ...token,
    loc: {
      end: {
        column: assignmentNode.body[0].loc.end.column + 2,
        line: token.loc.start.line,
      },
      start: {
        column: assignmentNode.body[0].loc.end.column,
        line: token.loc.start.line,
      },
    },
    range: [
      assignmentNode.body[0].range[1],
      assignmentNode.body[0].range[1] + 1,
    ],
    value: '=',
  })

  if (last) {
    assignmentNode.body.push({
      ...token,
      loc: {
        end: {
          column: assignmentNode.body[1].loc.end.column + last.length,
          line: token.loc.start.line,
        },
        start: {
          column: assignmentNode.body[1].loc.end.column,
          line: token.loc.start.line,
        },
      },
      range: [
        assignmentNode.body[1].range[1],
        assignmentNode.body[1].range[1] + last.length,
      ],
      value: last,
    })
  }

  tokens.splice(tokenIdx, 1)

  assignmentNode.body.forEach(newToken => {
    tokens.splice(tokenIdx, 0, newToken)
  })

  delete assignmentNode.value

  replaceItemInParent(token, assignmentNode)

  assignmentNode.body.forEach(item => {
    item.parent = assignmentNode
    item.parentKey = 'body'
  })

  token.parent = null
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

              if (
                token.type === allTokens.IDENTIFIER.tokenName &&
                token.value[0] !== '=' &&
                token.value.includes('=') &&
                token.parent.type !== 'Assignment'
              ) {
                createAssignment(token, i, tokens)
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
