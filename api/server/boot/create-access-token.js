'use strict';

const Promise = require('bluebird');

module.exports = function(app, cb) {
  const {AccessToken, User} = app.models;
  const email = 'admin@example.com';
  const password = 'secretpw';
  const accessToken = 'secretpw';
  // example of a application start script that creates an access token
  return Promise.resolve()
    .then(() => User.findOne({where: {email}}))
    .then(res => (!!res) ? res : User.create({email, password}))
    .then(user => AccessToken.upsert({id: accessToken, userId: user.id}))
    .then(token => console.log(`Access Token: ${token.id}`))
    .asCallback(cb); // similar to .then(res => cb(null, res)).catch(e => cb(e))
};
