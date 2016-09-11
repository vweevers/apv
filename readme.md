# apv

**CLI to view and trigger AppVeyor builds.**

[![npm status](http://img.shields.io/npm/v/apv.svg?style=flat-square)](https://www.npmjs.org/package/apv)

## usage

```
$ npm install -g apv
$ apv
Usage: apv <command> [options]

View and trigger AppVeyor builds.

Commands:
  config    Write configuration to working directory
  projects  List projects
  history   List build history
  info      View build by version, branch or the latest
  build     Start a build for a commit or pull request

Global options:
  --account -a  Account name                [string]
  --token   -t  Token (APPVEYOR_API_TOKEN)  [string]
  --project -p  Project slug                [string]
  --json    -j  JSON output                 [boolean]

Run 'apv <command> --help' for more information on a command.

$ apv config -a vweevers -t xxx -p auto-prebuild
$ apv history
{
  project: {
    projectId: 230413,
    name: 'auto-prebuild',
    repositoryName: 'vweevers/auto-prebuild',
    ..
  },
  builds: [
    [0] {
      version: '8',
      message: '0.0.3',
      branch: 'master',
      isTag: false,
      commitId: '4208135fbbbd4b910dcf4334c94c6944915a41c9',
      status: 'success',
      started: '2016-09-01T07:31:22.124364+00:00',
      ..
    }
  ]
}
$ apv build 25076945
{                                                         
  buildId: 4853995,                                     
  buildNumber: 9,                                       
  version: '9',                                         
  message: 'appveyor.yml: fix variables',               
  branch: 'master',                                     
  isTag: false,                                         
  commitId: '2507694564d7376ecc1b39cdebfd761d12482ae9',             
  status: 'queued',                                     
  created: '2016-09-11T12:01:51.4470584+00:00',
  ..       
}                                                         
$ apv build #3
{
  message: 'Pull request #3 was not found.'
}
```

## install

With [npm](https://npmjs.org) do:

```
npm install -g apv
```

## license

[MIT](http://opensource.org/licenses/MIT) © Vincent Weevers. Initial code adapted from [rhyolight/appveyor-js-client](https://github.com/rhyolight/appveyor-js-client).
