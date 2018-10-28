import { walk } from '../../src/CSTVisitors/estree/walker'

describe('estree visitor walker', () => {
  it('stops when calling skip', () => {
    const spyFn = jest.fn()
    walk(
      {
        foo: [{}, {}],
      },
      {
        enter() {
          spyFn()
          this.skip()
        },
      }
    )

    expect(spyFn.mock.calls).toEqual([[]])
  })

  it('traverses properties with objects with types', () => {
    const spyFn = jest.fn()
    walk(
      {
        foo: {
          type: 'bar',
        },
      },
      { leave: spyFn }
    )

    expect(
      spyFn.mock.calls.filter(n => (n as any)[0].type === 'bar').length
    ).toEqual(1)
  })
})
