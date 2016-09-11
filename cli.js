#!/usr/bin/env node
'use strict';

const meow = require('meow')
    , xtend = require('xtend')
    , fs = require('fs')
    , purdy = require('purdy')
    , join = require('path').join

const COMMANDS = [
  'config',
  'projects',
  'history',
  'info',
  'build'
]

const ALIAS = {
  a: 'account',
  t: 'token',
  p: 'project',
  j: 'json'
}

const cli = meow({ help: false }, {
  boolean: ['json'],
  string:  ['account', 'token', 'project'],
  default: {
    token: process.env.APPVEYOR_API_TOKEN
  },
  alias: ALIAS
})

const command = cli.input.splice(0, 1)[0]
    , valid = COMMANDS.indexOf(command) >= 0

if (cli.flags.help || !valid) {
  const file = valid ? command : 'cli'
  const txt = fs.readFileSync(join(__dirname, 'usage', file + '.txt'), 'utf8')
  console.log(txt)
  process.exit(cli.flags.help ? 0 : 2)
}

try {
  var rc = JSON.parse(fs.readFileSync('.apvrc', 'utf8'))
} catch (err) {
  if (err.code !== 'ENOENT') throw err
}

const flags = cli.flags
for(let k in flags) if (flags[k] === undefined) delete flags[k]
const options = xtend(rc, cli.flags)
for(let k in ALIAS) delete options[k]

if (command === 'config') {
  const json = JSON.stringify(options, null, 2)
  fs.writeFileSync('.apvrc', json)
} else {
  const AppVeyor = require('./')
      , appveyor = new AppVeyor(options.account, options.token)

  switch (command) {
    case 'projects':
      appveyor.getProjects(print)
    case 'history':
      appveyor.getHistory(options.project, print)
    case 'build':
      appveyor.build(options.project, cli.input, print)
    case 'info':
      appveyor.getBuild(options.project, { branch: flags.branch, version: cli.input[0] }, print)
  }

  function print(err, data) {
    if (err) throw err

    if (options.json) {
      console.log(JSON.stringify(data, null, 2))
    } else {
      purdy(format(data), { indent: 2, depth: 10 })
    }
  }

  function format(data) {
    if (Array.isArray(data)) return data.map(format)
    if (data.toJSON) data = data.toJSON()
    return data
  }
}
