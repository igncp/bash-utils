import { buildESTreeAstFromSource, parse } from '../src'
import { getESTreeConverterVisitor } from '../src//CSTVisitors/estree'

// Till the grammar is relatively stable, only expected errors / success are
// tested

const checkThrows = text => {
  expect(() => (parse as any)(text)).toThrow()
  expect(() => buildESTreeAstFromSource(text)).toThrow()
}

// @TODO: some of these should not throw but return errors instead
describe('parse errors', () => {
  it('throws when wrong argument', () => {
    expect(() => (parse as any)()).toThrow('You must pass a string as source')
    expect(() => (parse as any)(1)).toThrow('You must pass a string as source')
  })

  test('redirections', () => {
    checkThrows('foo >>')
  })

  test('if conditions', () => {
    checkThrows('if [ foo bar ]; then bar; fi')
    checkThrows('if [ foo ]; then bar fi')
    checkThrows('if [ true ]; then; echo; fi')
  })

  test('strings', () => {
    checkThrows('foo " bar')
    checkThrows("foo ' bar")
  })

  test('parameters expansion', () => {
    checkThrows('${foo')
  })

  test('command expansion', () => {
    checkThrows('$(foo')
    checkThrows('`foo')
  })

  test('arithmetic expansion', () => {
    checkThrows('$((foo')
  })

  test('process substitution', () => {
    checkThrows('<( foo')
  })

  test('misc', () => {
    checkThrows('echo foo(')
    checkThrows('echo foo()')
    checkThrows('echo foo)')
  })
})

const checkNoErrors = text => {
  const fn = () => {
    const { value, parser, lexErrors, parseErrors } = parse(text)

    expect(lexErrors.length).toEqual(0)
    expect(parseErrors.length).toEqual(0)

    const visitor = getESTreeConverterVisitor({ parser })

    return visitor.visit(value)
  }

  expect(fn).not.toThrow()
}

describe('non parse errors', () => {
  test.skip('known issues - should not error but error', () => {
    checkNoErrors('foo "bar"')
    checkNoErrors("foo 'bar'")
    checkNoErrors('echo <(cat foo.txt)')
    checkNoErrors('cat $(echo foo.txt)')
    checkNoErrors('bar `foo`')
    checkNoErrors('bar ${foo}`')
    checkNoErrors('echo "$FOO"')
    checkNoErrors('echo foo\\(')
    checkNoErrors('# foo $(( "')
    checkNoErrors('#!/usr/bin/env bash')
    checkNoErrors('echo "$@"')
    checkNoErrors('echo "$@@@"')
    checkNoErrors('echo \\(\\)')
  })

  test('simple commands', () => {
    checkNoErrors('.//foo/bar.baz bar')
    checkNoErrors('./foo/bar.baz foo')
    checkNoErrors('echo $ FOO')
    checkNoErrors('echo $.a@#%~')
    checkNoErrors('echo $FOO')
    checkNoErrors('foo ./bar/baz.sh')
    checkNoErrors('foo > ./bar/baz.sh')
    checkNoErrors('foo bar baz bam')
    checkNoErrors('foo bar')
    checkNoErrors('foo')
    checkNoErrors('foo-bar')
    checkNoErrors('foo_bar baz bam')
    checkNoErrors('set -e')
  })

  test('redirections', () => {
    checkNoErrors('foo > bar')
    checkNoErrors('foo bar > baz')
    checkNoErrors('foo > bar baz')
    checkNoErrors('foo bar > baz bam')

    checkNoErrors('foo >> bar')
    checkNoErrors('foo bar >> baz')
    checkNoErrors('foo >> baz baz')
  })

  test('assignments', () => {
    checkNoErrors('FOO=BAR foo > baz')
    checkNoErrors('FOO=BAR foo bar')
    checkNoErrors('FOO=BAR foo')
    checkNoErrors('FOO=BAR foo BAR=foo')
    checkNoErrors('FOO=BAR FOO2=BAR2 foo bar')
  })

  test('if expressions', () => {
    checkNoErrors('if [ foo ]; then bar; fi')
    checkNoErrors('if [ foo     ]; then bar; fi')
    checkNoErrors(`if [ foo ]
  then
  bar
  fi`)
  })
})
