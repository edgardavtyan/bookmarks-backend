'use strict';
/* global rootRequire */
const app = require('../../app');
const async = require('async');
const supertest = require('supertest');
const errors = rootRequire('app/utils/errors');
const Category = rootRequire('app/db/Category');
const User = rootRequire('app/db/User');
const faker = rootRequire('test/utils/faker-custom');
const expect = rootRequire('test/utils/chai').expect;

const credentials = {
	username: 'username',
	password: 'password',
};

describe('/bookmark/category', () => {
	let userId;
	let categoryId;


	beforeEach(done => {
		async.series([
			clearModel(Category),
			clearModel(User),
			addCategory({name: ''}, category => categoryId = category.id),
			function() {
				new User.Model(credentials).save((err, user) => {
					userId = user.id;
					done();
				});
			},
		]);
	});

	describe('GET', () => {
		it('handle not authenticated requests', done => {
			supertest(app)
				.get('/bookmark/category')
				.end((err, res) => {
					expect(res.body.errors).to.contain(errors.auth.notAuthenticated);
					done();
				});
		});

		it('return all bookmark categories', done => {
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
		it('handle not authenticated users', done => {
			supertest(app)
				.post('/bookmark/category')
				.type('form')
				.end(expectNotAuthenticated(done));
		});

		it('fill empty category fields', done => {
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

		it('fill given category fields', done => {
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

		it('return error if category name is too long', done => {
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
	});

	describe('PUT', () => {
		it('handle unauthorized requests', done => {
			supertest(app).put('/bookmark/category').end(expectNotAuthenticated(done));
		});

		it('return error given no id', done => {
			const agent = supertest.agent(app);
			async.series([
				login(agent),
				makePutRequest(agent, {}, (err, res) => {
					expect(res.statusCode).to.equal(400);
					expect(res.body.errors).to.contain(errors.category.idEmpty);
					done();
				}),
			]);
		});

		it('return error given empty category name', done => {
			const agent = supertest.agent(app);
			async.series([
				login(agent),
				makePutRequest(agent, {}, (err, res) => {
					expect(res.statusCode).to.equal(400);
					expect(res.body.errors).to.contain(errors.category.nameEmpty);
					done();
				}),
			]);
		});

		it('return error given too long category name', done => {
			const data = {
				id: categoryId,
				name: faker.string(600),
			};
			const agent = supertest.agent(app);

			async.series([
				login(agent),
				makePutRequest(agent, data, (err, res) => {
					expect(res.statusCode).to.equal(400);
					expect(res.body.errors).to.contain(errors.category.nameTooLong);
					done();
				}),
			]);
		});

		it('change category name', done => {
			const agent = supertest.agent(app);
			const data = {
				id: categoryId,
				name: faker.string(50),
			};

			async.series([
				login(agent),
				makePutRequest(agent, data, (err, res) => {
					expect(res.statusCode).to.equal(200);

					Category.Model.findById(categoryId, (dbErr, category) => {
						console.log(category);
						expect(category.name).to.equal(data.name);
						done();
					});
				}),
			]);
		});
	});
});

function expectNotAuthenticated(done) {
	return function(err, res) {
		expect(res.body.errors).to.contain(errors.auth.notAuthenticated);
		done();
	};
}

function clearModel(model) {
	return function(callback) {
		model.Model.remove({}, callback);
	};
}

function addCategory(data, callback) {
	return function(innerCallback) {
		new Category.Model(data).save((err, category) => {
			if (callback) callback(category);
			innerCallback();
		});
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

function makePutRequest(agent, data, callback) {
	return function() {
		agent
		.put('/bookmark/category')
		.type('form')
		.send(data)
		.end(callback);
	};
}
