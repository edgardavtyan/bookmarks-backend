/* global rootRequire */
const app = require('../app');
const supertest = require('supertest');
const expect = require('./utils/chai').expect;
const async = require('async');
const errors = rootRequire('utils/errors');
const messages = rootRequire('utils/messages');
const User = rootRequire('db/User');

describe('/', () => {
	beforeEach(done => {
		User.Model.remove({}, done);
	});

	describe('GET', () => {
		it('handle non authenticated requests', done => {
			supertest(app)
				.get('/')
				.end((err, res) => {
					expect(res.body.errors).to.contain(errors.auth.notAuthenticated);
					expect(res.body.message).to.equal(messages.auth.notAuthenticated);
					done();
				});
		});

		it('handle authenticated requests', done => {
			const data = { username: 'user', password: 'pass' };
			const agent = supertest.agent(app);

			async.series([
				function(callback) {
					agent.post('/register').type('form').send(data).end(callback);
				},
				function(callback) {
					agent.post('/user/login').type('form').send(data).end(callback);
				},
				function() {
					agent.get('/').end((err, res) => {
						expect(res.body.errors).to.be.empty();
						expect(res.body.message).to.equal(messages.auth.authenticated);
						done();
					});
				},
			]);
		});
	});
});
