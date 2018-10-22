// @flow

import React from 'react'

type T_Option = {|
  id: string,
  value: string,
|}

type T_Props = {|
  onChange: any => void,
  options: T_Option[],
  selectedId: string,
|}

const SelectBox = ({ options, selectedId, onChange }: T_Props) => {
  if (options.length === 0) {
    return null
  }

  return (
    <select onChange={onChange} value={selectedId}>
      {options.map(opt => {
        return (
          <option key={opt.id} value={opt.id}>
            {opt.value}
          </option>
        )
      })}
    </select>
  )
}

export default SelectBox
