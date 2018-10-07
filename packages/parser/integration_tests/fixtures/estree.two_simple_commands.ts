export default {
  body: [
    {
      body: [
        {
          loc: {
            end: {
              column: 5,
              line: 1,
            },
            start: {
              column: 1,
              line: 1,
            },
          },
          range: [0, 4],
          type: 'IDENTIFIER',
          value: 'echo',
        },
        {
          loc: {
            end: {
              column: 9,
              line: 1,
            },
            start: {
              column: 6,
              line: 1,
            },
          },
          range: [5, 8],
          type: 'IDENTIFIER',
          value: 'foo',
        },
      ],
      loc: {
        end: {
          column: 9,
          line: 1,
        },
        start: {
          column: 1,
          line: 1,
        },
      },
      range: [0, 8],
      type: 'Command',
    },
    {
      body: [
        {
          loc: {
            end: {
              column: 5,
              line: 2,
            },
            start: {
              column: 1,
              line: 2,
            },
          },
          range: [9, 13],
          type: 'IDENTIFIER',
          value: 'echo',
        },
        {
          loc: {
            end: {
              column: 9,
              line: 2,
            },
            start: {
              column: 6,
              line: 2,
            },
          },
          range: [14, 17],
          type: 'IDENTIFIER',
          value: 'bar',
        },
      ],
      loc: {
        end: {
          column: 9,
          line: 2,
        },
        start: {
          column: 1,
          line: 2,
        },
      },
      range: [9, 17],
      type: 'Command',
    },
    {
      loc: {
        end: {
          column: 10,
          line: 1,
        },
        start: {
          column: 9,
          line: 1,
        },
      },
      range: [8, 9],
      type: 'NEWLINE',
      value: '\n',
    },
    {
      loc: {
        end: {},
        start: {},
      },
      range: [],
      type: 'EOF',
    },
  ],
  loc: {
    end: {
      column: 10,
      line: 1,
    },
    start: {
      column: 1,
      line: 1,
    },
  },
  range: [0, 9],
  tokens: [
    {
      loc: {
        end: {
          column: 5,
          line: 1,
        },
        start: {
          column: 1,
          line: 1,
        },
      },
      range: [0, 4],
      type: 'IDENTIFIER',
      value: 'echo',
    },
    {
      loc: {
        end: {
          column: 9,
          line: 1,
        },
        start: {
          column: 6,
          line: 1,
        },
      },
      range: [5, 8],
      type: 'IDENTIFIER',
      value: 'foo',
    },
    {
      loc: {
        end: {
          column: 10,
          line: 1,
        },
        start: {
          column: 9,
          line: 1,
        },
      },
      range: [8, 9],
      type: 'NEWLINE',
      value: '\n',
    },
    {
      loc: {
        end: {
          column: 5,
          line: 2,
        },
        start: {
          column: 1,
          line: 2,
        },
      },
      range: [9, 13],
      type: 'IDENTIFIER',
      value: 'echo',
    },
    {
      loc: {
        end: {
          column: 9,
          line: 2,
        },
        start: {
          column: 6,
          line: 2,
        },
      },
      range: [14, 17],
      type: 'IDENTIFIER',
      value: 'bar',
    },
  ],
  type: 'Program',
}
