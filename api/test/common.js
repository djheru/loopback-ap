'use strict';

const app = require('../server/server');
const supertest = require('supertest');
const request = supertest(app);
const chai = require('chai');
const expect = chai.expect;

module.exports = {app, expect, request};
