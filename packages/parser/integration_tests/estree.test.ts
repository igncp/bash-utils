import { buildESTreeAstFromSource } from '../src'

import estreeSimpleCommandFixture from './fixtures/estree.simple_command'
import estreeTwoSimpleCommandsFixture from './fixtures/estree.two_simple_commands'

describe('estree-like ast generator', () => {
  test('simple command', () => {
    const estreeValue = buildESTreeAstFromSource('foo bar')

    expect(estreeValue).toEqual(estreeSimpleCommandFixture)
  })

  test('two simple commands', () => {
    const estreeValue = buildESTreeAstFromSource(`echo foo
echo bar`)

    expect(estreeValue).toEqual(estreeTwoSimpleCommandsFixture)
  })
})
