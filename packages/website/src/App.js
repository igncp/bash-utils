// @flow

import JSONTree from 'react-json-tree'
import React, { Component } from 'react'
import { buildESTreeAstFromSource } from '@bash-utils/parser'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneLight as hljsStyle } from 'react-syntax-highlighter/styles/hljs'
import AceEditor from 'react-ace'

import pjson from '../package.json'

import jsonTreeTheme from './jsonTreeTheme'
import './App.css'

import 'brace/mode/sh'
import 'brace/theme/github'

const DEFAULT_CONTENT = `
#!/usr/bin/env bash

echo foo
`.trim()

type T_Props = {||}

type T_State = {|
  bashInputValue: string,
  estreeOutputValue: string,
|}

const HeaderLink = ({ children, href }) => {
  return (
    <a href={href} rel="noopener noreferrer" target="_blank">
      {children}
    </a>
  )
}

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

  handleBashInputChange = (value: string) => {
    this.updateBoxes(value)
  }

  render() {
    return (
      <div className="app">
        <h1>
          <HeaderLink href="https://github.com/igncp/bash-utils">
            {'Bash Utils'}
          </HeaderLink>
        </h1>
        <p>
          {
            'Collection of utilities for Bash. This website reflects the state of the latest commit in the master branch.'
          }
        </p>
        <p>
          <HeaderLink
            href={`https://github.com/igncp/bash-utils/releases/tag/v${
              pjson.version
            }`}
          >{`Latest Release: v${pjson.version}`}</HeaderLink>
          <span>{' | '}</span>
          <HeaderLink href="grammar">{'Parser Grammar'}</HeaderLink>
          <span>{' | '}</span>
          <HeaderLink href="https://github.com/igncp/bash-utils/tree/master/packages/eslint-plugin-bashutils#eslint-plugin-bashutils">
            {'ESLint Package'}
          </HeaderLink>
          <span>{' | '}</span>
          <HeaderLink href="flow-coverage">{'Flow Coverage'}</HeaderLink>
          <span>{' | '}</span>
          <HeaderLink href="parser-tests-coverage">
            {'Parser Tests Coverage'}
          </HeaderLink>
          <span>{' | '}</span>
          <HeaderLink href="eslint-tests-coverage">
            {'ESLint Rules Tests Coverage'}
          </HeaderLink>
        </p>
        <p>{'You can try the result of the parser and ESTree visitor:'}</p>
        <div className="inputs-container">
          <div className="bash-input">
            <AceEditor
              editorProps={{ $blockScrolling: true }}
              height="400px"
              mode="sh"
              name="UNIQUE_ID_OF_DIV"
              onChange={this.handleBashInputChange}
              theme="github"
              value={this.state.bashInputValue}
            />
          </div>
          <div className="estree-output">
            <SyntaxHighlighter
              customStyle={{ margin: 0 }}
              language="javascript"
              style={hljsStyle}
            >
              {JSON.stringify(this.state.estreeOutputValue, null, 2)}
            </SyntaxHighlighter>
          </div>
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
