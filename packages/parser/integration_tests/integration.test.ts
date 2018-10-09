import { buildESTreeAstFromSource, parse } from '../src'
import { getESTreeConverterVisitor } from '../src//CSTVisitors/estree'

// Till the grammar is relatively stable, only expected errors / success are
// tested

const checkThrows = text => {
  expect(() => (parse as any)(text)).toThrow()
  expect(() => buildESTreeAstFromSource(text)).toThrow()
}

describe('parse errors', () => {
  it('throws when wrong argument', () => {
    expect(() => (parse as any)()).toThrow('You must pass a string as source')
    expect(() => (parse as any)(1)).toThrow('You must pass a string as source')
  })

  // @TODO: some of these should not throw but return errors instead
  test('redirections', () => {
    checkThrows('foo >>')
  })

  test('simple commands', () => {
    checkThrows('foo=BAR=baz foo')
    checkThrows('foo==bar foo')
  })

  test('if conditions', () => {
    checkThrows('if [ foo bar ]; then bar; fi')
  })

  test.skip('known issues', () => {
    checkThrows('if [ foo ]; then bar fi')
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
  test('simple commands', () => {
    checkNoErrors('foo')
    checkNoErrors('foo bar')
    checkNoErrors('foo bar baz bam')
    checkNoErrors('foo_bar baz bam')
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
