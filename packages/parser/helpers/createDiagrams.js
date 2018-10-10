const path = require('path')
const fs = require('fs')

const mkdirp = require('mkdirp')
const chevrotain = require('chevrotain')

const { Parser } = require('../lib/parse.js')

const parser = new Parser([])
const serializedGrammar = parser.getSerializedGastProductions()

let htmlText = chevrotain.createSyntaxDiagramsCode(serializedGrammar)

const outPath = path.resolve(__dirname, '../diagrams')

mkdirp.sync(outPath)

const formattedDate = (() => {
  const today = new Date()
  let dd = today.getDate()
  let mm = today.getMonth() + 1
  const yyyy = today.getFullYear()

  if (dd < 10) {
    dd = `0${dd}`
  }

  if (mm < 10) {
    mm = `0${mm}`
  }

  return `${dd}/${mm}/${yyyy}`
})()

htmlText +=
  '<div style="color: #777; text-align: right; padding: 0 20px 20px 0; font-family: sans-serif;">' +
  `Last built on: ${formattedDate}</div>`

fs.writeFileSync(`${outPath}/generated_diagrams.html`, htmlText)
