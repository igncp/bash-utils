// @flow

/* eslint-disable no-empty */

// export any for now

declare module '@bash-utils/parser' {
  declare var tokens: any
  declare var visitorKeysForESTree: any
  declare var buildESTreeAstFromSource: any
}

declare module 'react-json-tree' {
  declare export default any
}

declare module 'react-syntax-highlighter' {
  declare export default any
}

declare module 'react-ace' {
  declare export default any
}

declare module 'react-syntax-highlighter/styles/hljs' {
  declare var atomOneLight: any
}

declare module 'brace/mode/sh' {
}

declare module 'brace/theme/github' {
}

/* eslint-enable no-empty */
