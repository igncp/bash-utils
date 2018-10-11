import { walk } from './walker'

const visitTreeToRemoveParents = tree => {
    walk(tree, {
      enter(node) {
        if (node.parent) {
          delete node.parent
          delete node.parentKey
        }
      }
    })

  return tree
}

export const getRemoveParentVistor = () => {
  return {
    visit(tree) {
      return visitTreeToRemoveParents(tree)
    },
  }
}
