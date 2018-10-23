// @flow

declare module '@bash-utils/parser' {
  declare var tokens: any
  declare var walkESTree: any
  declare var visitorKeysForESTree: any
  declare var buildESTreeAstFromSource: any

  declare type T_ESTreePosition = {|
    column: number,
    line: number,
  |}

  declare type T_Loc = {|
    end: T_ESTreePosition,
    start: T_ESTreePosition,
  |}

  declare type T_ESTreeToken = {|
    loc: T_Loc,
    range: [number, number],
    type: string,
    value: string,
  |}

  declare type T_ESTreeNode = {|
    body: T_ESTreeItem[],
    loc: T_Loc,
    range: [number, number],
    type: string,
  |}

  declare type T_ESTreeItem = T_ESTreeToken | T_ESTreeNode

  declare type T_ESTreeProgramNode = {|
    comments: T_ESTreeToken[],
    tokens: T_ESTreeToken[],
  |}

  declare type T_Node = any

  declare type T_SourceCode = {|
    getTokens: (?T_Node) => T_ESTreeToken[],
    text: string,
  |}

  declare type T_Context = {|
    getSourceCode: () => T_SourceCode,
    options: any[],
    report: ({|
      data?: mixed,
      loc?: T_Loc,
      message?: string,
      messageId?: string,
      node?: T_ESTreeItem,
    |}) => void,
  |}

  declare type T_Rule = {|
    _test?: mixed,
    create: T_Context => { [string]: (T_Node) => void },
    meta: {|
      docs: {|
        description: string,
      |},
      messages?: { [string]: string },
      schema?: any[],
    |},
  |}
}
