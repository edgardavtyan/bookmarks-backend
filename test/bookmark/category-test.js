'use strict';
/* global rootRequire */
const async = require('async');
const supertest = require('supertest');
const expect = require('../utils/chai').expect;
const app = require('../../app');
const messages = rootRequire('utils/messages');
const errors = rootRequire('utils/errors');
const Category = rootRequire('db/Category');
const User = rootRequire('db/User');

describe('/bookmark/category GET', () => {
	let userId;
	const credentials = {
		username: 'username',
		password: 'password',
	};


	beforeEach(done => {
		async.series([
			clearModel(Category),
			clearModel(User),
			function() {
				new User.Model(credentials).save((err, user) => {
					userId = user.id;
					done();
				});
			},
		]);
	});

	it('should handle not authenticated requests', done => {
		supertest(app)
			.get('/bookmark/category')
			.end((err, res) => {
				expect(res.body.errors).to.contain(errors.auth.notAuthenticated);
				expect(res.body.message).to.equal(messages.auth.notAuthenticated);
				done();
			});
	});

	it('should return all bookmark categories', done => {
		const agent = supertest.agent(app);
		async.series([
			addCategories(3, userId),
			addCategories(5, 'other_id'),
			login(agent, credentials),
			function() {
				agent.get('/bookmark/category').end((err, res) => {
					expect(res.body.length).to.equal(3);
					done();
				});
			},
		]);
	});
});

function clearModel(model) {
	return function(callback) {
		model.Model.remove({}, callback);
	};
}

function addCategories(count, id) {
	return function(callback) {
		async.each(new Array(count), (i, eachCallback) => {
			new Category.Model({ userId: id }).save(eachCallback);
		}, callback);
	};
}

function login(agent, credentials) {
	return function(callback) {
		agent.post('/user/login').type('form').send(credentials).end(callback);
	};
}
