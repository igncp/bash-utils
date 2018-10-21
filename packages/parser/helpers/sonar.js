const { exec } = require('child_process')
const { join } = require('path')

const pjson = require('../package.json')

if (!process.env.BASH_UTILS_SONAR_TOKEN) {
  console.log('BASH_UTILS_SONAR_TOKEN environment variable missing')

  process.exit(1)
}

const sonarSources = ['src'].join(',')
const sonarExclusions = [].join(',')

const sonarHost = 'http://localhost:9000'
const sonarProjectKey = 'bash-utils-parser'
const sonarProjectName = 'Bash Utils Parser'
const sonarToken = process.env.BASH_UTILS_SONAR_TOKEN

const javascriptGlobals = [].join(',')

const sonarJavascriptReportPath = join('coverage', 'lcov.info')
const sonarCoverageExclusions = [].join(',')

const command =
  `${join(
    '..',
    '..',
    'node_modules',
    'sonar-scanner',
    'bin',
    'sonar-scanner'
  )} ` +
  `-Dsonar.projectVersion="${pjson.version}" ` +
  `-Dsonar.login="${sonarToken}" ` +
  `-Dsonar.projectKey="${sonarProjectKey}" ` +
  `-Dsonar.projectName="${sonarProjectName}" ` +
  `-Dsonar.exclusions="${sonarExclusions}" ` +
  `-Dsonar.sources="${sonarSources}" ` +
  `-Dsonar.javascript.lcov.reportPath="${sonarJavascriptReportPath}" ` +
  `-Dsonar.javascript.globals="${javascriptGlobals}" ` +
  `-Dsonar.coverage.exclusions="${sonarCoverageExclusions}" ` +
  `-Dsonar.host.url="${sonarHost}"`

console.log('parsing the project with Sonar')

console.log(`Sonar command:\n${command}\n`)

const sonar = exec(command)

sonar.on('close', code => {
  console.log(`sonar ended with: ${code}`)
})
sonar.on('error', err => {
  console.log(`sonar errd with: ${err}`)
})
sonar.stdout.on('data', d => {
  console.log(`sonar: ${d}`)
})
