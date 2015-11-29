require('../app');
const expect = require('expect.js');
const restler = require('restler');
const User = require('../app/db').User;

describe('Registration', () => {
	beforeEach(() => {
		User.Model.remove({}).exec();
	});

	it('should return error if given username is too short', done => {
		makePostRequest({ username: 'ab' }, body => {
			expect(body.errors).to.contain('username-too-short');
			done();
		});
	});

	it('should return error if given username is too long', done => {
		const username = 'abcdefghigklmnopqrstuvwxyz0123456789';
		makePostRequest({ username }, body => {
			expect(body.errors).to.contain('username-too-long');
			done();
		});
	});

	it('should return error if given username contains invalid symbols', done => {
		// TODO: test more symbols
		const username = 'usern@me';
		makePostRequest({ username }, body => {
			expect(body.errors).to.contain('username-has-invalid-symbols');
			done();
		});
	});

	it('should return error if username was not given', done => {
		makePostRequest({}, body => {
			expect(body.errors).to.contain('username-empty');
			done();
		});
	});

	it('should return error if given password is too short', done => {
		const password = 'ab';
		makePostRequest({ password }, body => {
			expect(body.errors).to.contain('password-too-short');
			done();
		});
	});

	it('should return error if given password is too long', done => {
		const password = 'abcdefghigklmnopqrstuvwxyz0123456789';
		makePostRequest({ password }, body => {
			expect(body.errors).to.contain('password-too-long');
			done();
		});
	});

	it('should return error if password was not given', done => {
		makePostRequest({}, body => {
			expect(body.errors).to.contain('password-empty');
			done();
		});
	});

	it('should return 400 status code if data was invalid', done => {
		const data = { username: '', password: '' };
		makePostRequest(data, (body, res) => {
			expect(res.statusCode).to.be(400);
			done();
		});
	});

	it('should return 200 status code if data was valid', done => {
		const data = {
			username: 'valid_username',
			password: 'valid_password',
		};

		makePostRequest(data, (body, res) => {
			expect(res.statusCode).to.be(200);
			done();
		});
	});

	it('should save user to database', done => {
		const data = {
			username: 'valid_username',
			password: 'valid_password',
		};

		makePostRequest(data, () => {
			User.Model.findOne({ username: data.username }, (err, user) => {
				expect(user.username).to.be(data.username);
				expect(user.password).to.be(data.password);
				done();
			});
		});
	});

	it('should not save user when username exists', done => {
		const data = {
			username: 'username',
			password: 'password',
		};

		makePostRequest(data, () => {
			makePostRequest(data, body => {
				expect(body.errors).to.contain('username-exists');
				done();
			});
		});
	});
});


function makePostRequest(data, callback) {
	restler.post('http://localhost:1377/register', { data }).on('complete', callback);
}
