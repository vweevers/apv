'use strict';

const request = require('request')
    , bail = require('bail')
    , qs = require('querystring')
    , Project = require('./project')
    , ENDPOINT = 'https://ci.appveyor.com/api/'

module.exports = AppVeyor

function AppVeyor(account, token) {
  if (!account) throw new Error('AppVeyor account name is required')
  if (!token) throw new Error('AppVeyor API token is required')

  this.account = account
  this.token = token
}

AppVeyor.prototype.request = function(method, command, params, done) {
  if (typeof params === 'function') done = params, params = undefined
  if (!done) done = bail

  const options = {
    method,
    url: ENDPOINT + command,
    json: true,
    headers: {
      'Authorization': 'Bearer ' + this.token,
      'Content-type': 'application/json'
    }
  }

  if (method === 'POST') options.body = params
  else if (params) options.url+= '?' + qs.stringify(params)

  request(options, function (err, res, body) {
    if (err) return done(err, res, body)
    done(null, body)
  })
}

AppVeyor.prototype.get = function(command, params, done) {
  this.request('GET', command, params, done)
}

AppVeyor.prototype.post = function(command, params, done) {
  this.request('POST', command, params, done)
}

AppVeyor.prototype.getRoles = function(done) {
  this.get('roles', done)
}

// http://www.appveyor.com/docs/api/projects-builds#get-projects
AppVeyor.prototype.getProjects = function(done) {
  this.get('projects', (err, payload) => {
    if (err) return done(err)
    done(null, payload.map(data => new Project(data, this)))
  })
}

;['getBuild', 'getHistory', 'getDeployments', 'getSettings', 'build'].forEach(method => {
  AppVeyor.prototype[method] = function (project) {
    const args = Array.prototype.slice.call(arguments, 1)
    const p = new Project({ slug: project }, this)
    p[method].apply(p, args)
  }
})
