'use strict';
/* global rootRequire */
const async = require('async');
const supertest = require('supertest');
const expect = require('../utils/chai').expect;
const app = require('../../app');
const faker = require('../utils/faker-custom');
const messages = rootRequire('utils/messages');
const errors = rootRequire('utils/errors');
const Category = rootRequire('db/Category');
const User = rootRequire('db/User');

const credentials = {
	username: 'username',
	password: 'password',
};

describe('/bookmark/category', () => {
	let userId;


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

	describe('GET', () => {
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

	describe('POST', () => {
		it('should handle not authenticated users', done => {
			supertest(app)
				.post('/bookmark/category')
				.type('form')
				.end(expectNotAuthenticated(done));
		});

		it('should fill empty category fields', done => {
			const agent = supertest.agent(app);
			async.series([
				login(agent),
				postRequestAndQueryDb(agent, {}, (err, category) => {
					expect(category).to.not.be.null();
					expect(category.name).to.equal('New Category');
					expect(category.icon).to.equal('default');
					done();
				}),
			]);
		});

		it('should return error if category name is too long', done => {
			const agent = supertest.agent(app);
			const name = faker.string(1000);
			async.series([
				login(agent),
				postRequest(agent, { name }, (err, res) => {
					expect(res.statusCode).to.equal(400);
					expect(res.body.errors).to.contain(errors.category.nameTooLong);
					done();
				}),
			]);
		});

		it('should fill given category fields', done => {
			const agent = supertest.agent(app);
			const categoryData = {
				name: 'Category',
				icon: 'book',
			};

			async.series([
				login(agent),
				postRequestAndQueryDb(agent, categoryData, (err, category) => {
					expect(category).to.not.be.null();
					expect(category.name).to.equal(categoryData.name);
					expect(category.icon).to.equal(categoryData.icon);
					done();
				}),
			]);
		});
	});
});

function expectNotAuthenticated(done) {
	return function(err, res) {
		expect(res.body.errors).to.contain(errors.auth.notAuthenticated);
		expect(res.body.message).to.equal(messages.auth.notAuthenticated);
		done();
	};
}

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

function login(agent) {
	return function(callback) {
		agent.post('/user/login').type('form').send(credentials).end(callback);
	};
}

function postRequest(agent, data, callback) {
	return function() {
		agent
		.post('/bookmark/category')
		.type('form')
		.send(data)
		.end(callback);
	};
}

function postRequestAndQueryDb(agent, data, callback) {
	return function() {
		agent
		.post('/bookmark/category')
		.type('form')
		.send(data)
		.end((err, res) => {
			Category.Model.findById(res.body.category._id, callback);
		});
	};
}
