/* global rootRequire */
const app = require('../../app');
const supertest = require('supertest');
const errors = rootRequire('app/utils/errors');
const User = rootRequire('app/db').User;
const faker = rootRequire('test/utils/faker-custom');
const expect = rootRequire('test/utils/chai').expect;

describe('Registration', () => {
	beforeEach(() => {
		User.Model.remove({}).exec();
	});

	it('return error given too short username', done => {
		makePostRequest({ username: faker.string(2) }, (err, res) => {
			expect(res.body.errors).to.contain(errors.username.tooShort);
			done();
		});
	});

	it('return error given too long username', done => {
		const username = faker.string(200);
		makePostRequest({ username }, (err, res) => {
			expect(res.body.errors).to.contain(errors.username.tooLong);
			done();
		});
	});

	it('return error given username with invalid symbols', done => {
		// TODO: test more symbols
		const username = 'usern@me';
		makePostRequest({ username }, (err, res) => {
			expect(res.body.errors).to.contain(errors.username.invalidSymbols);
			done();
		});
	});

	it('return error given no username', done => {
		makePostRequest({}, (err, res) => {
			expect(res.body.errors).to.contain(errors.username.empty);
			done();
		});
	});

	it('return error given existing username', done => {
		const data = {
			username: 'username',
			password: 'password',
		};

		makePostRequest(data, () => {
			makePostRequest(data, (err, res) => {
				expect(res.body.errors).to.contain(errors.username.exists);
				done();
			});
		});
	});

	it('return error given too short password', done => {
		const password = faker.string(2);
		makePostRequest({ password }, (err, res) => {
			expect(res.body.errors).to.contain(errors.password.tooShort);
			done();
		});
	});

	it('return error given too long password', done => {
		const password = faker.string(200);
		makePostRequest({ password }, (err, res) => {
			expect(res.body.errors).to.contain(errors.password.tooLong);
			done();
		});
	});

	it('return error given no password', done => {
		makePostRequest({}, (err, res) => {
			expect(res.body.errors).to.contain(errors.password.empty);
			done();
		});
	});

	it('return 400 status given invalid data', done => {
		const data = { username: '', password: '' };
		makePostRequest(data, (body, res) => {
			expect(res.statusCode).to.equal(400);
			done();
		});
	});

	it('return 200 status given valid data', done => {
		const data = {
			username: 'valid_username',
			password: 'valid_password',
		};

		makePostRequest(data, (body, res) => {
			expect(res.statusCode).to.equal(200);
			done();
		});
	});

	it('save user to database', done => {
		const data = {
			username: 'valid_username',
			password: 'valid_password',
		};

		makePostRequest(data, () => {
			User.Model.findOne({ username: data.username }, (err, user) => {
				expect(user.username).to.equal(data.username);
				expect(user.password).to.equal(data.password);
				done();
			});
		});
	});
});


function makePostRequest(data, callback) {
	supertest(app)
		.post('/register')
		.type('form')
		.send(data)
		.end(callback);
}
