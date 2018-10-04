const path = require('path')
const fs = require('fs')

const mkdirp = require('mkdirp')
const chevrotain = require('chevrotain')

const { Parser } = require('../lib/parse.js')

const parser = new Parser([])
const serializedGrammar = parser.getSerializedGastProductions()

const htmlText = chevrotain.createSyntaxDiagramsCode(serializedGrammar)

const outPath = path.resolve(__dirname, '../diagrams')

mkdirp.sync(outPath)

fs.writeFileSync(`${outPath}/generated_diagrams.html`, htmlText)
