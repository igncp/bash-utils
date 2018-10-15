// @flow

import oneLine from './one-line'
import noVariableAssignment from './no-variable-assignment'
import noMultipleSpaces from './no-multiple-spaces'
import dummy from './dummy'

const rules = {
  'no-multiple-spaces': noMultipleSpaces,
  'no-variable-assignment': noVariableAssignment,
  'one-line': oneLine,
  dummy,
}

export default rules
