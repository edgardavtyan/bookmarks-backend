const expect = require('expect.js');
const supertest = require('supertest');
const app = require('../app');

describe('Registration', () => {
	it('should return error if given username is too short', done => {
		makePostRequest().send({ username: 'ab' }).end((err, res) => {
			expect(res.body.errors).to.contain('username-too-short');
			done();
		});
	});

	it('should return error if given username is too long', done => {
		const username = 'abcdefghigklmnopqrstuvwxyz0123456789';
		makePostRequest().send({ username }).end((err, res) => {
			expect(res.body.errors).to.contain('username-too-long');
			done();
		});
	});

	it('should return error if given username contains invalid symbols', done => {
		// TODO: test more symbols
		const username = 'usern@me';
		makePostRequest().send({ username }).end((err, res) => {
			expect(res.body.errors).to.contain('username-has-invalid-symbols');
			done();
		});
	});

	it('should return error if username was not given', done => {
		makePostRequest().end((err, res) => {
			expect(res.body.errors).to.contain('username-empty');
			done();
		});
	});

	it('should return error if given password is too short', done => {
		const password = 'ab';
		makePostRequest().send({ password }).end((req, res) => {
			expect(res.body.errors).to.contain('password-too-short');
			done();
		});
	});

	it('should return error if password was not given', done => {
		makePostRequest().end((err, res) => {
			expect(res.body.errors).to.contain('password-empty');
			done();
		});
	});

	it('should return 400 status code if data was invalid', done => {
		const data = { username: '', password: '' };
		makePostRequest().send(data).end((err, res) => {
			expect(res.statusCode).to.be(400);
			done();
		});
	});

	it('should return 200 status code if data was valid', done => {
		const data = {
			username: 'valid_username',
			password: 'valid_password',
		};

		makePostRequest().send(data).end((err, res) => {
			expect(res.statusCode).to.be(200);
			done();
		});
	});
});

function makePostRequest() {
	return supertest(app).post('/register').type('form');
}
