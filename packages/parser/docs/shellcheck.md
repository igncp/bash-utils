# ShellCheck research

## References

- ShellCheck: https://github.com/koalaman/shellcheck
    - AST: https://github.com/koalaman/shellcheck/blob/master/src/ShellCheck/AST.hs
    - Parser: https://github.com/koalaman/shellcheck/blob/master/src/ShellCheck/Parser.hs
    - Keywords, commands, etc.: https://github.com/koalaman/shellcheck/blob/master/src/ShellCheck/Data.hs
    - Interfaces: https://github.com/koalaman/shellcheck/blob/master/src/ShellCheck/Interface.hs

## Filtered tokens-like in AST.hs

Prefixed with ? the ones which can't guess. Don't know yet the difference
between all-capital and PascalCase: They seem control flow operators.

- ? Annotation
- ? Arithmetic
- ? Backgrounded
- ? Backticked
- ? BraceExpansion
- ? BraceGroup
- ? CLOBBER: ">|"
- ? CoProc
- ? CoProcBody
- ? DGREAT
- ? DLESS
- ? DLESSDASH
- ? DSEMI
- ? DollarArithmetic
- ? DollarBraceCommandExpansion
- ? DollarBraced
- ? DollarExpansion
- ? Extglob
- ? FdRedirect
- ? ForArithmetic
- ? GREATAND
- ? Glob
- ? Include
- ? Lbrace
- ? Lparen
- ? Pipeline
- ? ProcSub: Process substitution, e.g. "<(echo test | wc -l)"
- ? Rbrace
- ? Script
- ? UnparsedIndex
- ? Until
- ? UntilExpression

- And if
- Array
- Assignment
- Bang
- Banged
- Case
- CaseExpression
- Condition
- Do
- DollarBracket
- DollarDoubleQuoted
- DollarSingleQuoted
- Done
- DoubleQuoted
- EOF
- Elif
- Else
- Esac
- Fi
- For
- ForIn
- Function
- Greater
- HereDoc
- HereString
- If
- IfExpression
- In
- IndexedElement
- IoDuplicate
- IoFile
- LESSAND
- LESSGREAT
- Less
- Literal
- NEWLINE
- NormalWord
- OR_IF
- OrIf
- ParamSubSpecialChar
- Pipe
- Redirecting
- Rparen
- Select
- SelectIn
- Semi
- SimpleCommand
- SingleQuoted
- SourceCommand
- Subshell
- Then
- While
- WhileExpression
