// @flow

import oneLine from './one-line'
import noVariableAssignment from './no-variable-assignment'
import noMultipleSpaces from './no-multiple-spaces'

const rules = {
  'no-multiple-spaces': noMultipleSpaces,
  'no-variable-assignment': noVariableAssignment,
  'one-line': oneLine,
}

export default rules
