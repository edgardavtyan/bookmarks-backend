/* global rootRequire */
const supertest = require('supertest');
const async = require('async');
const app = rootRequire('app');
const errors = rootRequire('app/utils/errors');
const User = rootRequire('app/db/User');
const expect = rootRequire('test/utils/chai').expect;
const utils = rootRequire('test/utils/utils');

const url = '/';

describe(url, () => {
	beforeEach(done => {
		User.Model.remove({}, done);
	});

	describe('GET', () => {
		it('handle non authenticated requests', done => {
			supertest(app)
				.get(url)
				.end((err, res) => {
					expect(res.body.errors).to.contain(errors.auth.notAuthenticated);
					done();
				});
		});

		it('handle authenticated requests', done => {
			const data = { username: 'user', password: 'pass' };
			const agent = supertest.agent(app);

			async.series([
				cb => utils.makePostRequest(agent, '/register', data, cb),
				cb => utils.makePostRequest(agent, '/login', data, cb),
				() => agent.get(url).end((err, res) => {
					expect(res.body.errors).to.be.empty();
					done();
				}),
			]);
		});
	});
});
