export const getESTreeConverterVisitor = ({ parser }) => {
  const BaseSQLVisitorWithDefaults = parser.getBaseCstVisitorConstructorWithDefaults()

  class CSTVisitor extends BaseSQLVisitorWithDefaults {
    constructor() {
      super()

      this.validateVisitor()
    }

    public Script(ctx) {
      return {
        body: ctx,
        type: 'Program',
      }
    }
  }

  return new CSTVisitor() as any
}
