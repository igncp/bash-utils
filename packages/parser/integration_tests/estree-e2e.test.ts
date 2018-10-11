import { writeFileSync } from 'fs'

import { buildESTreeAstFromSource, parse, tokens } from '../src'
import { getESTreeConverterVisitor } from '../src/CSTVisitors/estree'

import check from './checkESTree'

// @TODO: some of these should not throw but return errors instead
describe('parse errors', () => {
  it('throws when wrong argument', () => {
    expect(() => (parse as any)()).toThrow('You must pass a string as source')
    expect(() => (parse as any)(1)).toThrow('You must pass a string as source')
  })

  test("KNOWN ISSUES - they should throw but they don't", () => {
    check('"$(foo"', { throws: false })
  })

  test('redirections', () => {
    check('foo >>', { throws: true })
  })

  test('if conditions', () => {
    check('if [ foo bar ]; then bar; fi', { throws: true })
    check('if [ foo ]; then bar fi', { throws: true })
    check('if [ true ]; then; echo; fi', { throws: true })
  })

  test('strings', () => {
    check('foo " bar', { throws: true })
    check("foo ' bar", { throws: true })
    check(`foo " bar'`, { throws: true })
  })

  test('parameters expansion', () => {
    check('${foo', { throws: true })
  })

  test('command expansion', () => {
    check('$(foo', { throws: true })
    check('`foo', { throws: true })
  })

  test('arithmetic expansion', () => {
    check('$((foo', { throws: true })
  })

  test('process substitution', () => {
    check('<( foo', { throws: true })
  })

  test('misc', () => {
    check('echo foo(', { throws: true })
    check('echo foo()', { throws: true })
    check('echo foo)', { throws: true })
    check('| echo', { throws: true })
  })
})

describe('non parse errors', () => {
  test('KNOWN ISSUES - should not error but error', () => {
    check('echo <(cat foo.txt)', { throws: true })
    check('cat $(echo foo.txt)', { throws: true })
    check('bar `foo`', { throws: true })
    check('bar ${foo}`', { throws: true })
    check('echo foo\\(', { throws: true })
    check('echo \\(\\)', { throws: true })
    check('echo || echo', { throws: true })
    check('echo | echo', { throws: true })
  })

  test('strings', () => {
    check('echo "$@@@"')
    check('echo "$@"')
    check("foo 'bar'", { containedTokens: [tokens.STRING, tokens.IDENTIFIER] })
    check('foo "bar"', { containedTokens: [tokens.STRING, tokens.IDENTIFIER] })
    check("'foo'", {
      containedTokens: [tokens.STRING],
      missingTokens: [tokens.IDENTIFIER],
    })
    check('"foo"', {
      containedTokens: [tokens.STRING],
      missingTokens: [tokens.IDENTIFIER],
    })
    check('echo "$FOO"', {
      containedTokens: [tokens.STRING, tokens.IDENTIFIER],
    })
  })

  test('shebang', () => {
    check('#!/usr/bin/env bash', {
      containedNodes: ['Shebang'],
      containsComments: true,
    })

    check(
      `#!/usr/bin/env bash
      foo`,
      {
        containedNodes: ['Shebang'],
        containsComments: true,
      }
    )

    check(
      `foo #!/usr/bin/env bash
      #!/usr/bin/env bash`,
      {
        containsComments: true,
        missingNodes: ['Shebang'],
      }
    )
  })

  test('comments', () => {
    check('# foo $(( "', {
      containedNodes: ['Comment'],
      missingNodes: ['Command'],
    })
    check('foo # bar $(( "', {
      containedNodes: ['Comment', 'Command'],
      missingNodes: [],
    })
  })

  test('simple commands', () => {
    check('.//foo/bar.baz bar')
    check('./foo/bar.baz foo')
    check('echo $ FOO')
    check('echo $.a@#%~', {
      missingNodes: ['Comment'],
      missingTokens: [tokens.STRING],
    })
    check('echo $FOO')
    check('foo ./bar/baz.sh')
    check('foo > ./bar/baz.sh', {
      containedNodes: ['Redirection'],
    })
    check('foo bar baz bam')
    check('foo bar')
    check('foo')
    check('foo-bar')
    check('foo_bar baz bam')
    check('set -e')
  })

  test('redirections', () => {
    check('foo > bar', { containedNodes: ['Redirection'] })
    check('foo bar > baz')
    check('foo > bar baz')
    check('foo bar > baz bam')

    check('foo >> bar')
    check('foo bar >> baz')
    check('foo >> baz baz')
  })

  test('assignments', () => {
    check('FOO=BAR', { containedNodes: ['Assignment'] })
    check('FOO=BAR foo', { containedNodes: ['Assignment'] })
    check('=BARFoo foo', { missingNodes: ['Assignment'] })
    check('BARFoo foo', { missingNodes: ['Assignment'] })
    check('FOO=BAR foo > baz', { containedNodes: ['Assignment'] })
    check('FOO=BAR foo bar', { containedNodes: ['Assignment'] })
    check('FOO=BAR foo BAR=foo', { containedNodes: ['Assignment'] })
    check('FOO=BAR FOO2=BAR2 foo bar', { containedNodes: ['Assignment'] })
  })

  test('if expressions', () => {
    check('if [ foo ]; then bar; fi')
    check('if [ foo     ]; then bar; fi')
    check(
      `if [ foo ]
  then
  bar
  fi`
    )
  })
})
