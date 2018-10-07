// @flow

type T_Token = {|
  type: string,
  value: string,
|}

export type T_Node = any

type T_SourceCode = {|
  getTokens: (?T_Node) => T_Token[],
|}

export type T_Context = {|
  getSourceCode: () => T_SourceCode,
  report: mixed => void,
|}
