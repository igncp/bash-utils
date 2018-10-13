// @flow

import type { T_Context } from '../../types'

const SHOULD_REPORT_DUMMY = false

export default {
  create(ctx: T_Context) {
    if (SHOULD_REPORT_DUMMY) {
      ctx.report({
        message: 'Dummy error',
        data: {},
        loc: { start: 1, end: 2 },
      })
    }

    return {
      Program() {},
      Command() {},
    }
  },
}
