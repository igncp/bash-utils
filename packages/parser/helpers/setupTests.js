const { execSync } = require('child_process')
const { resolve } = require('path')

const packagePath = resolve(`${__dirname}/..`)

execSync(`sh ${packagePath}/helpers/fix_token_type_idx.sh ${packagePath}`)
