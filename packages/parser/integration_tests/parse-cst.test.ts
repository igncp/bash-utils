import { EOF } from 'chevrotain'

import { parse, tokens } from '../src'

const EOFChild = [
  {
    endColumn: NaN,
    endLine: NaN,
    endOffset: NaN,
    image: '',
    startColumn: NaN,
    startLine: NaN,
    startOffset: NaN,
    tokenType: EOF,
    tokenTypeIdx: expect.any(Number),
  },
]

const parseAndGetValue = t => parse(t).value

describe('cst generated', () => {
  describe('one liners', () => {
    test('empty string', () => {
      expect(parseAndGetValue('')).toEqual({
        children: {
          EOF: EOFChild,
        },
        name: 'Script',
      })
    })

    test('string of 4 spaces', () => {
      expect(parseAndGetValue([0, 0, 0, 0].reduce(a => `${a} `, ''))).toEqual({
        children: {
          EOF: EOFChild,
        },
        name: 'Script',
      })
    })

    test('command with single argument', () => {
      expect(parseAndGetValue('echo world')).toEqual({
        children: {
          Command: [
            {
              children: {
                IDENTIFIER: [
                  {
                    image: 'echo',
                    startColumn: 1,
                    startLine: 1,
                    startOffset: 0,
                    tokenType: tokens.IDENTIFIER,
                    tokenTypeIdx: expect.any(Number),
                  },
                  {
                    image: 'world',
                    startColumn: 6,
                    startLine: 1,
                    startOffset: 5,
                    tokenType: tokens.IDENTIFIER,
                    tokenTypeIdx: expect.any(Number),
                  },
                ],
              },
              name: 'Command',
            },
          ],
          EOF: EOFChild,
        },
        name: 'Script',
      })
    })

    test('command with single argument and semicolon', () => {
      expect(parseAndGetValue('echo world ;')).toEqual({
        children: {
          Command: [
            {
              children: {
                IDENTIFIER: [
                  {
                    image: 'echo',
                    startColumn: 1,
                    startLine: 1,
                    startOffset: 0,
                    tokenType: tokens.IDENTIFIER,
                    tokenTypeIdx: expect.any(Number),
                  },
                  {
                    image: 'world',
                    startColumn: 6,
                    startLine: 1,
                    startOffset: 5,
                    tokenType: tokens.IDENTIFIER,
                    tokenTypeIdx: expect.any(Number),
                  },
                ],
              },
              name: 'Command',
            },
          ],
          EOF: EOFChild,
          SEMICOLON: [
            {
              image: ';',
              startColumn: 12,
              startLine: 1,
              startOffset: 11,
              tokenType: tokens.SEMICOLON,
              tokenTypeIdx: expect.any(Number),
            },
          ],
        },
        name: 'Script',
      })
    })

    test('command with no argument', () => {
      expect(parseAndGetValue('echo')).toEqual({
        children: {
          Command: [
            {
              children: {
                IDENTIFIER: [
                  {
                    image: 'echo',
                    startColumn: 1,
                    startLine: 1,
                    startOffset: 0,
                    tokenType: tokens.IDENTIFIER,
                    tokenTypeIdx: expect.any(Number),
                  },
                ],
              },
              name: 'Command',
            },
          ],
          EOF: EOFChild,
        },
        name: 'Script',
      })
    })

    test('command with two arguments a middle semicolon', () => {
      expect(parseAndGetValue('echo ; printf   ;')).toEqual({
        children: {
          Command: [
            {
              children: {
                IDENTIFIER: [
                  {
                    image: 'echo',
                    startColumn: 1,
                    startLine: 1,
                    startOffset: 0,
                    tokenType: tokens.IDENTIFIER,
                    tokenTypeIdx: expect.any(Number),
                  },
                ],
              },
              name: 'Command',
            },
            {
              children: {
                IDENTIFIER: [
                  {
                    image: 'printf',
                    startColumn: 8,
                    startLine: 1,
                    startOffset: 7,
                    tokenType: tokens.IDENTIFIER,
                    tokenTypeIdx: expect.any(Number),
                  },
                ],
              },
              name: 'Command',
            },
          ],
          EOF: EOFChild,
          SEMICOLON: [
            {
              image: ';',
              startColumn: 6,
              startLine: 1,
              startOffset: 5,
              tokenType: tokens.SEMICOLON,
              tokenTypeIdx: expect.any(Number),
            },
            {
              image: ';',
              startColumn: 17,
              startLine: 1,
              startOffset: 16,
              tokenType: tokens.SEMICOLON,
              tokenTypeIdx: expect.any(Number),
            },
          ],
        },
        name: 'Script',
      })
    })
  })

  describe('multi-line', () => {
    test('two simple commands', () => {
      const script = `
      echo foo
      echo bar
      `

      expect(parseAndGetValue(script)).toEqual({
        children: {
          Command: [
            {
              children: {
                IDENTIFIER: [
                  {
                    image: 'echo',
                    startColumn: 7,
                    startLine: 2,
                    startOffset: 7,
                    tokenType: tokens.IDENTIFIER,
                    tokenTypeIdx: expect.any(Number),
                  },
                  {
                    image: 'foo',
                    startColumn: 12,
                    startLine: 2,
                    startOffset: 12,
                    tokenType: tokens.IDENTIFIER,
                    tokenTypeIdx: expect.any(Number),
                  },
                ],
              },
              name: 'Command',
            },
            {
              children: {
                IDENTIFIER: [
                  {
                    image: 'echo',
                    startColumn: 7,
                    startLine: 3,
                    startOffset: 22,
                    tokenType: tokens.IDENTIFIER,
                    tokenTypeIdx: expect.any(Number),
                  },
                  {
                    image: 'bar',
                    startColumn: 12,
                    startLine: 3,
                    startOffset: 27,
                    tokenType: tokens.IDENTIFIER,
                    tokenTypeIdx: expect.any(Number),
                  },
                ],
              },
              name: 'Command',
            },
          ],
          EOF: EOFChild,
          EmptyStatement: [
            {
              children: {
                NEWLINE: [
                  {
                    image: '\n',
                    startColumn: 1,
                    startLine: 1,
                    startOffset: 0,
                    tokenType: tokens.NEWLINE,
                    tokenTypeIdx: expect.any(Number),
                  },
                ],
              },
              name: 'EmptyStatement',
            },
            {
              children: {
                NEWLINE: [
                  {
                    image: '\n',
                    startColumn: 15,
                    startLine: 2,
                    startOffset: 15,
                    tokenType: tokens.NEWLINE,
                    tokenTypeIdx: expect.any(Number),
                  },
                ],
              },
              name: 'EmptyStatement',
            },
            {
              children: {
                NEWLINE: [
                  {
                    image: '\n',
                    startColumn: 15,
                    startLine: 3,
                    startOffset: 30,
                    tokenType: tokens.NEWLINE,
                    tokenTypeIdx: expect.any(Number),
                  },
                ],
              },
              name: 'EmptyStatement',
            },
          ],
        },
        name: 'Script',
      })
    })
  })

  it('throws when wrong argument', () => {
    expect(() => (parseAndGetValue as any)()).toThrow(
      'You must pass a string as source'
    )
    expect(() => (parseAndGetValue as any)(1)).toThrow(
      'You must pass a string as source'
    )
  })
})
