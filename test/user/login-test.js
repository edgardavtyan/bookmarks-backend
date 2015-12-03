/* global rootRequire */
const app = require('../../app');
const supertest = require('supertest');
const errors = rootRequire('app/utils/errors');
const User = rootRequire('app/db').User;
const expect = rootRequire('test/utils/chai').expect;

describe('Login', () => {
	beforeEach(done => {
		User.Model.remove({}, () => done());
	});

	it('return error given not existing username', done => {
		const data = { username: 'user', password: '123123' };
		makeLoginRequest(data, (err, res) => {
			expect(res.body.errors).to.contain(errors.username.notFound);
			done();
		});
	});

	it('login given correct data', done => {
		const data = { username: 'user', password: '123123' };
		new User.Model(data).save(() => {
			makeLoginRequest(data, (err, res) => {
				expect(res.body.errors).to.be.empty();
				done();
			});
		});
	});
});

function makeLoginRequest(data, callback) {
	supertest(app)
		.post('/user/login')
		.type('form')
		.send(data)
		.end(callback);
}
