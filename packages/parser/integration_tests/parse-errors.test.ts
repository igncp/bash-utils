import { parse } from '../src'

describe('parse errors', () => {
  it('throws when wrong argument', () => {
    expect(() => (parse as any)()).toThrow('You must pass a string as source')
    expect(() => (parse as any)(1)).toThrow('You must pass a string as source')
  })

  // @TODO: some of these should not throw but return errors instead
  test('redirections', () => {
    expect(() => (parse as any)('foo >>')).toThrow()
  })
})

const checkErrors = text => {
  const result = parse(text)

  expect(result.parseErrors).toHaveLength(0)
  expect(result.lexErrors).toHaveLength(0)
}

describe('non parse errors', () => {
  test('simple commands', () => {
    checkErrors('foo')
    checkErrors('foo bar')
    checkErrors('foo bar baz bam')
  })

  test('redirections', () => {
    checkErrors('foo > bar')
    checkErrors('foo bar > baz')
    checkErrors('foo > bar baz')
    checkErrors('foo bar > baz bam')

    checkErrors('foo >> bar')
    checkErrors('foo bar >> baz')
    checkErrors('foo >> baz baz')
  })
})
