// @flow

import functionStyle from './function-style'
import noMultipleEmptyLines from './no-multiple-empty-lines'
import noMultipleSpaces from './no-multiple-spaces'
import requireShebang from './require-shebang'
import setsOptions from './sets-options'

const rules = {
  'function-style': functionStyle,
  'no-multiple-empty-lines': noMultipleEmptyLines,
  'no-multiple-spaces': noMultipleSpaces,
  'require-shebang': requireShebang,
  'sets-options': setsOptions,
}

export default rules
