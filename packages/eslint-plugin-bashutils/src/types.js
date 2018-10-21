// @flow

type T_ESTreePosition = {|
  column: number,
  line: number,
|}

type T_Loc = {|
  end: T_ESTreePosition,
  start: T_ESTreePosition,
|}

type T_ESTreeToken = {|
  loc: T_Loc,
  range: [number, number],
  type: string,
  value: string,
|}

type T_ESTreeNode = {|
  body: T_ESTreeItem[], // eslint-disable-line no-use-before-define
  loc: T_Loc,
  range: [number, number],
  type: string,
|}

type T_ESTreeItem = T_ESTreeToken | T_ESTreeNode

type T_ESTreeProgramNode = {|
  comments: T_ESTreeToken[],
  tokens: T_ESTreeToken[],
|}

type T_Node = any

type T_SourceCode = {|
  getTokens: (?T_Node) => T_ESTreeToken[],
  text: string,
|}

type T_Context = {|
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

type T_Rule = {|
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

export type {
  T_Context,
  T_ESTreeItem,
  T_ESTreeNode,
  T_ESTreeProgramNode,
  T_Node,
  T_Rule,
}
