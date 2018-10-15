// @flow

import JSONTree from 'react-json-tree'
import React, { Component } from 'react'
import { buildESTreeAstFromSource } from '@bash-utils/parser'

import pjson from '../package.json'

import jsonTreeTheme from './jsonTreeTheme'
import './App.css'

const DEFAULT_CONTENT = `
#!/usr/bin/env bash

echo foo
`.trim()

type T_Props = {||}

type T_State = {|
  bashInputValue: string,
  estreeOutputValue: string,
|}

class App extends Component<T_Props, T_State> {
  state = {
    bashInputValue: '',
    estreeOutputValue: '',
  }

  componentDidMount() {
    this.updateBoxes(DEFAULT_CONTENT)
  }

  updateBoxes(bashInputValue: string) {
    let estreeOutputValue = 'PARSING FAILED'

    try {
      estreeOutputValue = buildESTreeAstFromSource(bashInputValue)
    } catch (_) {}

    this.setState({
      bashInputValue,
      estreeOutputValue,
    })
  }

  handleBashInputChange = (ev: SyntheticEvent<HTMLTextAreaElement>) => {
    this.updateBoxes(ev.currentTarget.value)
  }

  render() {
    const commonTextareaProps = {
      'data-gramm_editor': false,
      autocapitalize: 'off',
      autocomplete: 'off',
      autocorrect: 'off',
      rows: 25,
      spellcheck: 'false',
    }

    return (
      <div className="app">
        <h1>
          <a href="https://github.com/igncp/bash-utils">{'Bash Utils'}</a>
        </h1>
        <p>
          {'This website reflects the state on the latest release: '}
          <b>
            <a
              href={`https://github.com/igncp/bash-utils/releases/tag/v${
                pjson.version
              }`}
            >{`v${pjson.version}`}</a>
          </b>
        </p>
        <p>
          {'Collection on utilities for Bash.'}
          <a className="grammar-link" href="grammar">
            {'Parser Grammar'}
          </a>
          <span>{'. '}</span>
          <a
            className="grammar-link"
            href="https://github.com/igncp/bash-utils/tree/master/packages/eslint-plugin-bashutils"
          >
            {'ESLint Package'}
          </a>
        </p>
        <p>{'You can try the result of the parser and ESTree visitor:'}</p>
        <div className="inputs-container">
          <textarea
            className="bash-input"
            {...commonTextareaProps}
            onChange={this.handleBashInputChange}
            value={this.state.bashInputValue}
          />

          <textarea
            className="estree-output"
            {...commonTextareaProps}
            readOnly
            value={JSON.stringify(this.state.estreeOutputValue, null, 2)}
          />
        </div>
        <div className="json-tree-wrapper">
          <JSONTree data={this.state.estreeOutputValue} theme={jsonTreeTheme} />
        </div>
        <footer target="_blank">
          <a href="https://github.com/igncp/bash-utils/tree/master/packages/website">
            {'Source'}
          </a>
        </footer>
      </div>
    )
  }
}

export default App
