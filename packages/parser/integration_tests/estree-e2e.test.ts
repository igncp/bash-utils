import { readdir, readFileSync, writeFileSync } from 'fs'

import { buildESTreeAstFromSource, parse, tokens } from '../src'
import { getESTreeConverterVisitor } from '../src/CSTVisitors/estree'

import check from './checkESTree'

// @TODO: some of these should not throw but return errors instead
describe('parse errors', () => {
  it('throws when wrong argument', () => {
    expect(() => (parse as any)()).toThrow('You must pass a string as source')
    expect(() => (parse as any)(1)).toThrow('You must pass a string as source')
  })

  test("KNOWN ISSUES - they should throw but they don't", () => {
    check('"$(foo"', { throws: false })
    check('"${foo"', { throws: false })
    check('"$((foo"', { throws: false })
  })

  test('grouping commands', () => {
    check('{ echo foo; cat bar.txt }', { throws: true })
  })

  test('redirections', () => {
    check('foo >>', { throws: true })
  })

  test('if expressions', () => {
    check('if [ foo ]; then bar fi', { throws: true })
    check('if [ true ]; then; echo; fi', { throws: true })
    check('if [ foo bar ]; then bar; fi', { throws: true })
    check('if [ -z -z bar ]; then bar; fi', { throws: true })
    check('if [ -z bar]; then bar; fi', { throws: true })
    check('if [ -z ]; then bar; fi', { throws: true })
  })

  test('strings', () => {
    check('foo " bar', { throws: true })
    check("foo ' bar", { throws: true })
    check(`foo " bar'`, { throws: true })
  })

  test('parameters expansion', () => {
    check('${foo', { throws: true })
  })

  test('command expansion', () => {
    check('$(foo', { throws: true })
    check('`foo', { throws: true })
  })

  test('arithmetic expansion', () => {
    check('$((foo', { throws: true })
  })

  test('process substitution', () => {
    check('<( foo', { throws: true })
  })

  test('misc', () => {
    check('echo foo(', { throws: true })
    check('echo foo()', { throws: true })
    check('echo foo)', { throws: true })
    check('echo & &', { throws: true })
  })

  test('pipelines', () => {
    check('| echo', { throws: true })
  })
})

describe('non parse errors', () => {
  test('KNOWN ISSUES - should not error but error', () => {
    check('echo foo\\(', { throws: true })
    check('echo \\(\\)', { throws: true })
    check('( echo foo; cat bar.txt )', { throws: true })
    check('{ echo foo; cat bar.txt; }', { throws: true })
    check('select fname in foo; do echo $fname; done', {
      containingNodes: ['SelectExpression'],
      errorsCheck: true,
    })
    check(
      `
case $FOO in
[1-6]*)
  BAR="FOO"
  ;;
[7-8]*)
  BAR="BAR"
  ;;
*)
  BAR="BAZ"
  ;;
esac`,
      { throws: true }
    )
  })

  test('strings', () => {
    check('echo foo"a"', { containingTokens: [tokens.STRING] })
    check('echo "$@@@"')
    check('echo "$@"')
    check("foo 'bar'", { containingTokens: [tokens.STRING, tokens.IDENTIFIER] })
    check('foo "bar"', { containingTokens: [tokens.STRING, tokens.IDENTIFIER] })
    check("'foo'", {
      containingTokens: [tokens.STRING],
      missingTokens: [tokens.IDENTIFIER],
    })
    check('"foo"', {
      containingTokens: [tokens.STRING],
      missingTokens: [tokens.IDENTIFIER],
    })
    check('echo "$FOO"', {
      containingTokens: [tokens.STRING, tokens.IDENTIFIER],
    })
  })

  test('shebang', () => {
    check('#!/usr/bin/env bash', {
      containingNodes: ['Shebang'],
      containsComments: true,
    })

    check(
      `#!/usr/bin/env bash
      foo`,
      {
        containingNodes: ['Shebang'],
        containsComments: true,
      }
    )

    check(
      `foo #!/usr/bin/env bash
      #!/usr/bin/env bash`,
      {
        containsComments: true,
        missingNodes: ['Shebang'],
      }
    )
  })

  test('comments', () => {
    check('# foo $(( "', {
      containingNodes: ['Comment'],
      missingNodes: ['Command'],
    })
    check('foo # bar $(( "', {
      containingNodes: ['Comment', 'Command'],
    })
  })

  test('simple commands', () => {
    check('.//foo/bar.baz bar')
    check('find .')
    check('./foo/bar.baz foo')
    check('echo $ FOO')
    check('echo $.a@#%~', {
      missingNodes: ['Comment'],
      missingTokens: [tokens.STRING],
    })
    check('echo $FOO')
    check('foo ./bar/baz.sh')
    check('foo bar baz bam')
    check('foo bar')
    check('foo')
    check('foo-bar')
    check('foo_bar baz bam')
    check('set -e')
    check('echo &')
  })

  test('redirections', () => {
    check('foo > ./bar/baz.sh', {
      containingNodes: ['Redirection'],
    })
    check('foo > bar', { containingNodes: ['Redirection'] })
    check('foo bar > baz', { containingNodes: ['Redirection'] })
    check('foo > bar baz', { containingNodes: ['Redirection'] })
    check('foo bar > baz bam', { containingNodes: ['Redirection'] })

    check('foo >> bar', { containingNodes: ['Redirection'] })
    check('foo bar >> baz', { containingNodes: ['Redirection'] })
    check('foo >> baz baz', { containingNodes: ['Redirection'] })
  })

  test('assignments', () => {
    check('FOO=BAR', { containingNodes: ['Assignment'] })
    check('FOO=BAR foo', { containingNodes: ['Assignment'] })
    check('FOO=BAR foo > baz', { containingNodes: ['Assignment'] })
    check('FOO=BAR foo bar', { containingNodes: ['Assignment'] })
    check('FOO=BAR foo BAR=foo', { containingNodes: ['Assignment'] })
    ;['FOO="BAR" echo baz', "FOO='BAR' echo baz"].forEach(text => {
      check(text, {
        containingNodes: ['Assignment'],
        containingTokens: [tokens.STRING],
        traverseFn: node => {
          if (node.type === 'Assignment') {
            expect(node.body).toHaveLength(3)
          }
        },
      })
    })
    check('FOO=BAR FOO2=BAR2 foo bar', { containingNodes: ['Assignment'] })

    check('F$O=BAR', { missingNodes: ['Assignment'] })
    check('=BARFoo foo', { missingNodes: ['Assignment'] })
    check('BARFoo foo', { missingNodes: ['Assignment'] })
  })

  test('substitutions and expansions', () => {
    check('echo <(cat foo.txt)', {
      containingNodes: ['ProcessSubstitution'],
      missingNodes: ['CommandSubstitution', 'ParameterExpansion'],
    })
    check('cat $(echo foo.txt)', {
      containingNodes: ['CommandSubstitution'],
      missingNodes: ['ProcessSubstitution', 'ParameterExpansion'],
    })
    check('bar ${foo}', {
      containingNodes: ['ParameterExpansion'],
      missingNodes: ['CommandSubstitution', 'ProcessSubstitution'],
    })
    check('bar ${foo | bar > baz}')
    check('echo $()')
    check('echo $( $( echo foo ) )')
    check('if [ $() $() -z bar ]; then bar; fi')
    check('if [ `` `` `` -z bar ]; then bar; fi')
    check('`foo`', { containingTokens: [tokens.IDENTIFIER] })
  })

  test('if expressions', () => {
    check('if [ foo ]; then bar; fi')
    check('if [ foo ] || [ bar ]; then echo foo; fi')
    check('if [ foo ] && [ bar ]; then echo foo; fi')
    check('if [ foo ] && [[ bar ]]; then echo foo; fi')
    check('if [ -z foo ]; then bar; fi', {
      containingNodes: ['IfConditionSingleBrackets'],
    })
    check('if [ bar -ne foo ]; then bar; fi', {
      containingNodes: ['IfConditionSingleBrackets'],
    })
    check('if [ foo     ]; then bar; fi')
    check(
      `if [ foo ]
  then
  bar
  fi`
    )
  })

  test('pipes', () => {
    check('echo | echo', { containingNodes: ['Pipeline'] })
    check('find . | grep foo', { containingNodes: ['Pipeline'] })
  })

  test('command continuations', () => {
    check('echo || echo')
    check('echo && echo')
    check(`echo foo \\
    bar`)
    check(
      `echo | \\
      /tmp/bar`,
      {
        traverseFn: item => {
          // confirm it is not considering \ as identifier
          if (item.type === tokens.IDENTIFIER.tokenName) {
            expect(item.value !== 'echo' || item.value !== '/tmp/bar').toEqual(
              true
            )
          }
        },
      }
    )
  })

  test('files', done => {
    const filesPath = __dirname + '/fixture_files'
    readdir(filesPath, (err, files) => {
      if (err) {
        throw err
      }

      files.forEach(fileName => {
        const fileContent = readFileSync(filesPath + '/' + fileName, 'utf-8')

        expect(typeof fileContent).toEqual('string')

        check(fileContent)
      })

      done()
    })
  })
})
