// @flow

import JSONTree from 'react-json-tree'
import React from 'react'
import { walkESTree } from '@bash-utils/parser'
import type { T_ESTreeItem } from '@bash-utils/parser'

import jsonTreeTheme from './jsonTreeTheme'
import SelectBox from './SelectBox'

const getIsItemNode = item => !!item && typeof item === 'object' && !!item.type

const getIsItemAUnderRangeOfItemB = (itemA, itemB) => {
  return itemB.range[0] <= itemA.range[0] && itemB.range[1] >= itemA.range[1]
}

const searchTypeToPlaceholderMap = {
  eval:
    "You can type a JavaScript expression to filter using 'n' as the node. E.g.: n.value === 'echo' || n.range[0] > 10",
  valueAndType:
    'You can type a string and it will be matched with the node types and values',
}

type T_Props = {|
  data: T_ESTreeItem | string,
|}

type T_State = {|
  parsedData: mixed,
  searchType: string,
  searchValue: string,
  selectedNode: any,
  treeKey: number,
|}

class TreeView extends React.Component<T_Props, T_State> {
  state = {
    searchValue: '',
    searchType: 'valueAndType',
    treeKey: 0,
    selectedNode: null,
    parsedData: this.props.data,
  }

  componentDidUpdate(prevProps: T_Props, prevState: T_State) {
    if (this.props.data !== prevProps.data) {
      this.setParsedData(this.state.searchValue)
    } else if (this.state.selectedNode && !prevState.selectedNode) {
      this.unselectNodeTimerId = setTimeout(() => {
        this.setState({
          selectedNode: null,
        })
      }, 10)
    }
  }

  componentWillUnmount() {
    clearTimeout(this.unselectNodeTimerId)
  }

  unselectNodeTimerId: TimeoutID

  getDoesItemMatchSearch(n: any, searchValue: string) {
    if (!getIsItemNode(n)) {
      return false
    }

    if (this.state.searchType === 'eval') {
      try {
        /* eslint-disable no-eval */
        if (/ = /.test(searchValue) === false && eval(searchValue)) {
          /* eslint-enable no-eval */
          return true
        }
      } catch (_) {}
    } else if (this.state.searchType === 'valueAndType') {
      if (
        (n.value || '').toLowerCase().indexOf(searchValue.toLowerCase()) !== -1
      ) {
        return true
      }

      if (n.type.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1) {
        return true
      }
    }

    return false
  }

  setParsedData(searchValue: string) {
    const { data } = this.props

    if (typeof data !== 'object' || searchValue === '') {
      this.setState({
        parsedData: data,
      })

      return
    }

    const parsedData = []
    const elInstance = this

    walkESTree(data, {
      enter(n: T_ESTreeItem) {
        if (elInstance.getDoesItemMatchSearch(n, searchValue)) {
          parsedData.push(n)
        }
      },
    })

    this.setState({
      parsedData,
    })
  }

  onSearchChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const searchValue = e.target.value

    this.setState({
      searchValue,
    })

    this.setParsedData(searchValue)
  }

  handleItemClick(
    e: SyntheticInputEvent<HTMLButtonElement>,
    data: T_ESTreeItem
  ) {
    e.stopPropagation()

    this.setState(s => ({
      searchValue: '',
      treeKey: s.treeKey + 1,
      parsedData: this.props.data,
      selectedNode: {
        ...data,
        body: [],
      },
    }))
  }

  getShouldItemBeClickable(data: mixed) {
    if (!this.state.searchValue) {
      return false
    }

    if (Array.isArray(data)) {
      return false
    }

    return getIsItemNode(data)
  }

  getItemString = (
    type: mixed,
    data: T_ESTreeItem,
    itemType: string,
    itemString: string
  ) => (
    <span>
      {itemType} {itemString}
      {this.getShouldItemBeClickable(data) ? (
        <span
          onClick={e => this.handleItemClick(e, data)}
          style={{ cursor: 'pointer' }}
        >
          {' > SHOW IN TREE'}
        </span>
      ) : (
        ''
      )}
    </span>
  )

  getShouldExpandNode = (keyName: string, data: T_ESTreeItem) => {
    const { selectedNode } = this.state

    if (!selectedNode) {
      return false
    }

    if (Array.isArray(data)) {
      return !!data.find(item => {
        return (
          getIsItemNode(item) && getIsItemAUnderRangeOfItemB(selectedNode, item)
        )
      })
    }

    if (getIsItemNode(data)) {
      return getIsItemAUnderRangeOfItemB(selectedNode, data)
    }

    return false
  }

  handleSearchTypeChange = (e: any) => {
    this.setState({
      searchType: e.target.value,
      parsedData: this.props.data,
      searchValue: '',
    })
  }

  render() {
    return (
      <React.Fragment>
        <div className="json-tree-wrapper">
          <JSONTree
            data={this.state.parsedData}
            getItemString={this.getItemString}
            hideRoot
            key={this.state.treeKey}
            shouldExpandNode={this.getShouldExpandNode}
            theme={jsonTreeTheme}
          />
        </div>
        <input
          className="search-box"
          onChange={this.onSearchChange}
          placeholder={searchTypeToPlaceholderMap[this.state.searchType]}
          value={this.state.searchValue}
        />
        <SelectBox
          onChange={this.handleSearchTypeChange}
          options={[
            {
              id: 'eval',
              value: 'filter by JavaScript expression',
            },
            {
              id: 'valueAndType',
              value: 'filter by type and value',
            },
          ]}
          selectedId={this.state.searchType}
        />
      </React.Fragment>
    )
  }
}

export default TreeView
