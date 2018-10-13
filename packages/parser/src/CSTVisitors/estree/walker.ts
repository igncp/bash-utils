// forked from: https://github.com/Rich-Harris/estree-walker/blob/master/src/estree-walker.js
// with the addition of: it will ignore the `parent` key

export function walk(
  ast,
  // tslint:disable-next-line
  { enter, leave }: { enter?: Function; leave?: Function }
) {
  visit(ast, null, enter, leave, undefined, undefined)
}

let shouldSkip = false
const context = { skip: () => (shouldSkip = true) }

export const childKeys = {}

const toString = Object.prototype.toString

function isArray(thing) {
  return toString.call(thing) === '[object Array]'
}

function visit(node, parent, enter, leave, prop, index) {
  if (!node) {
    return
  }

  if (enter) {
    // tslint:disable-next-line
    const _shouldSkip = shouldSkip
    shouldSkip = false
    enter.call(context, node, parent, prop, index)
    const skipped = shouldSkip
    shouldSkip = _shouldSkip

    if (skipped) {
      return
    }
  }

  const keys =
    childKeys[node.type] ||
    (childKeys[node.type] = Object.keys(node).filter(
      key => typeof node[key] === 'object'
    ))

  // tslint:disable-next-line
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i]
    const value = node[key]

    if (key === 'parent') {
      continue
    }

    if (isArray(value)) {
      for (let j = 0; j < value.length; j += 1) {
        visit(value[j], node, enter, leave, key, j)
      }
    } else if (value && value.type) {
      visit(value, node, enter, leave, key, null)
    }
  }

  if (leave) {
    leave(node, parent, prop, index)
  }
}