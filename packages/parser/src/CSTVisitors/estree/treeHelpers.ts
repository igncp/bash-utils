export const replaceItemInParent = (item, newItem) => {
  const { parent, parentKey } = item

  newItem.parent = parent
  newItem.parentKey = parentKey

  for (let i = 0; i < parent[parentKey].length; i++) {
    if (parent[parentKey][i] === item) {
      parent[parentKey][i] = newItem

      return
    }
  }
}
