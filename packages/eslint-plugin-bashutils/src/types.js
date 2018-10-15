// @flow

type T_Token = {|
  type: string,
  value: string,
|}

type T_Node = any

type T_SourceCode = {|
  getTokens: (?T_Node) => T_Token[],
|}

type T_Context = {|
  getSourceCode: () => T_SourceCode,
  report: mixed => void,
|}

type T_Rule = {|
  _test?: mixed,
  create: T_Context => { [string]: (T_Node) => void },
  meta: {|
    docs: {|
      description: string,
    |},
  |},
|}

export type { T_Rule, T_Context, T_Node }
