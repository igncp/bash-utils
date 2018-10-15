// @flow

import requireShebang from './require-shebang'
import noMultipleEmptyLines from './no-multiple-empty-lines'

const rules = {
  'no-multiple-empty-lines': noMultipleEmptyLines,
  'require-shebang': requireShebang,
}

export default rules
