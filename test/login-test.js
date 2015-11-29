require('../app');
const restler = require('restler');
const expect = require('expect.js');
const User = require('../app/db').User;

describe('Login', () => {
	afterEach(done => {
		User.Model.remove({}, () => done());
	});

	it('should not login given not existing username', done => {
		const data = { username: 'user', password: '123123' };
		makeLoginRequest(data, body => {
			expect(body.errors).to.contain('username-not-found');
			done();
		});
	});

	it('should login given correct data', done => {
		const data = { username: 'user', password: '123123' };
		new User.Model(data).save(() => {
			makeLoginRequest(data, body => {
				expect(body.errors).to.be.empty();
				done();
			});
		});
	});
});

function makeLoginRequest(data, callback) {
	restler.post('http://localhost:1377/user/login', { data }).on('complete', callback);
}
