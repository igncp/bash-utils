// 'foo bar'

export default {
  body: [
    {
      body: [
        {
          loc: {
            end: {
              column: 4,
              line: 1,
            },
            start: {
              column: 1,
              line: 1,
            },
          },
          range: [0, 3],
          type: 'IDENTIFIER',
          value: 'foo',
        },
        {
          loc: {
            end: {
              column: 8,
              line: 1,
            },
            start: {
              column: 5,
              line: 1,
            },
          },
          range: [4, 7],
          type: 'IDENTIFIER',
          value: 'bar',
        },
      ],
      loc: {
        end: {
          column: 8,
          line: 1,
        },
        start: {
          column: 1,
          line: 1,
        },
      },
      range: [0, 7],
      type: 'Command',
    },
    {
      loc: { start: {}, end: {} },
      range: [],
      type: 'EOF',
    },
  ],
  loc: {
    end: {
      column: 8,
      line: 1,
    },
    start: {
      column: 1,
      line: 1,
    },
  },
  range: [0, 7],
  tokens: [
    {
      loc: {
        end: {
          column: 4,
          line: 1,
        },
        start: {
          column: 1,
          line: 1,
        },
      },
      range: [0, 3],
      type: 'IDENTIFIER',
      value: 'foo',
    },
    {
      loc: {
        end: {
          column: 8,
          line: 1,
        },
        start: {
          column: 5,
          line: 1,
        },
      },
      range: [4, 7],
      type: 'IDENTIFIER',
      value: 'bar',
    },
  ],
  type: 'Program',
}
