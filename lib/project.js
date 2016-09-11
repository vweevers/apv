'use strict';

const xtend = require('xtend')

// TODO
// http://www.appveyor.com/docs/api/projects-builds#get-project-settings-in-yaml
// http://www.appveyor.com/docs/api/projects-builds#add-project
// http://www.appveyor.com/docs/api/projects-builds#update-project
// http://www.appveyor.com/docs/api/projects-builds#update-project-settings-in-yaml
// http://www.appveyor.com/docs/api/projects-builds#delete-project
// http://www.appveyor.com/docs/api/projects-builds#cancel-build

module.exports = Project

function Project (data, client) {
  this.data = data
  this.account = client.account
  this.slug = data.slug
  this.client = client

  if (!this.slug) {
    throw new TypeError('Missing project slug')
  }
}

Project.prototype.toJSON = function () {
  return this.data
}

Project.prototype.url = function (suffix) {
  return 'projects/' + this.account + '/' + this.slug + '/' + (suffix || '')
}

// http://www.appveyor.com/docs/api/projects-builds#get-project-last-build
// http://www.appveyor.com/docs/api/projects-builds#get-project-last-branch-build
// http://www.appveyor.com/docs/api/projects-builds#get-project-build-by-version
Project.prototype.getBuild = function (options, done) {
  if (typeof options === 'function') done = options, options = {}
  else if (!options) options = {}

  if (options.branch) {
    this.client.get(this.url('branch/' + options.branch), done)
  } else if (options.version) {
    this.client.get(this.url('build/' + options.version), done)
  } else {
    this.client.get(this.url(), done)
  }
}

// http://www.appveyor.com/docs/api/projects-builds#get-project-history
Project.prototype.getHistory = function (options, done) {
  if (typeof options === 'function') done = options, options = null
  options = xtend({ recordsNumber: 15 }, options)
  this.client.get(this.url('history'), options, done)
}

// http://www.appveyor.com/docs/api/projects-builds#get-project-deployments
Project.prototype.getDeployments = function (done) {
  this.client.get(this.url('deployments'), done)
}

// http://www.appveyor.com/docs/api/projects-builds#get-project-settings
Project.prototype.getSettings = function (done) {
  this.client.get(this.url('settings'), done)
}

// http://www.appveyor.com/docs/api/projects-builds#start-build-of-specific-branch-commit
// http://www.appveyor.com/docs/api/projects-builds#start-build-of-pull-request-github-only
Project.prototype.build = function (options, done) {
  if (Array.isArray(options)) {
    if (options.length === 2) {
      options = { branch: options[0], commit: options[1] }
    } else if (options.length === 1) {
      const target = options[0]
      if (target[0] === '#') options = { pr: parseInt(target.slice(1)) }
      else options = { commit: target }
    } else {
      return done(new Error('Insufficient arguments'))
    }
  }

  if (options.pr) {
    this.buildPullRequest(options.pr, done)
  } else if (options.commit) {
    this.buildCommit(options.branch, options.commit, done)
  } else {
    return done(new Error('Invalid build target'))
  }
}

Project.prototype.buildCommit = function (branch, commit, done) {
  if (typeof commit === 'function') {
    done = commit, commit = branch, branch = null
  }

  if (!commit) return done(new Error('Missing commit id'))

  this.client.post('builds', {
    accountName: this.account,
    projectSlug: this.slug,
    branch: branch || 'master',
    commitId: commit
  }, done)
}

Project.prototype.buildPullRequest = function (id, done) {
  if (!id || typeof id !== 'number' || isNaN(id)) {
    return done(new Error('Invalid pull request id'))
  }

  this.client.post('builds', {
    accountName: this.account,
    projectSlug: this.slug,
    pullRequestId: id
  }, done)
}
