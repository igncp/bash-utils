export const getDummyCSTVisitor = ({ parser }) => {
  const BaseSQLVisitorWithDefaults = parser.getBaseCstVisitorConstructorWithDefaults()

  class CSTVisitor extends BaseSQLVisitorWithDefaults {
    constructor() {
      super()

      this.validateVisitor()
    }

    // tslint:disable-next-line prefer-function-over-method
    public Script(ctx) {
      return {
        children: ctx,
        name: 'Script',
      }
    }
  }

  return new CSTVisitor() as any
}
