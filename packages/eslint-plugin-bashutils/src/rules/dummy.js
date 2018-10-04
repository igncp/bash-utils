// @flow

const SHOULD_REPORT_DUMMY = false

type T_Context = {|
  report: mixed => void,
|}

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
      Program() {
        console.info('Program Visited')
      },
    }
  },
}