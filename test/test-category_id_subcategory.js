/* global rootRequire */
'use strict';
const app = require('../app');
const async = require('async');
const supertest = require('supertest');
const User = rootRequire('app/db/User').Model;
const Category = rootRequire('app/db/Category').Model;
const SubCategory = rootRequire('app/db/SubCategory').Model;
const errors = rootRequire('app/utils/errors');
const utils = rootRequire('test/utils/utils');
const expect = rootRequire('test/utils/chai').expect;
const faker = rootRequire('test/utils/faker-custom');

const urlPattern = '/category/:id/subcategory';
const credentials = { username: 'user', password: 'pass' };

describe(urlPattern, () => {
	let categoryId, url;


	beforeEach(done => {
		async.series([
			cb => User.remove({}, cb),
			cb => Category.remove({}, cb),
			cb => SubCategory.remove({}, cb),
			cb => User.create(credentials, cb),
			() => Category.create({ name: 'TestCategory' }, (err, category) => {
				categoryId = category.id;
				url = getUrl(categoryId);
				done();
			}),
		]);
	});

	describe('GET', () => {
		it('handle unauthorized requests', done => {
			supertest(app).get(url).end(utils.expectUnauthorized(done));
		});

		it('return 404 given non existing id', done => {
			const agent = supertest.agent(app);
			async.series([
				cb => utils.login(agent, credentials, cb),
				() => agent.get(getUrl(123)).end((err, res) => {
					expect(res.statusCode).to.eql(404);
					done();
				}),
			]);
		});

		it('return all subcategories', done => {
			const agent = supertest.agent(app);
			async.series([
				cb => utils.login(agent, credentials, cb),
				cb => SubCategory.create({ name: 'TestName1', categoryId }, cb),
				cb => SubCategory.create({ name: 'TestName2', categoryId }, cb),
				cb => SubCategory.create({ name: 'TestName3', categoryId: faker.string(24) }, cb),
				cb => SubCategory.create({ name: 'TestName4', categoryId: faker.string(24) }, cb),
				() => agent.get(url).end((err, res) => {
					expect(res.body[0]).to.contain({
						name: 'TestName1', categoryId: String(categoryId) });
					expect(res.body[1]).to.contain({
						name: 'TestName2', categoryId: String(categoryId) });
					done();
				}),
			]);
		});
	});

	describe('POST', () => {
		it('handle unauthorized requests', done => {
			supertest(app).post(getUrl(123)).end(utils.expectUnauthorized(done));
		});

		it('return error given non existing id', done => {
			const agent = supertest.agent(app);
			const testUrl = getUrl(faker.string(24));
			async.series([
				cb => utils.login(agent, credentials, cb),
				() => agent.post(testUrl).end((err, res) => {
					expect(res.statusCode).to.eql(404);
					expect(res.body.errors).to.contain(errors.category.idNotFound);
					done();
				}),
			]);
		});

		it('return error given too long name', done => {
			const agent = supertest.agent(app);
			const data = { name: faker.string(2000) };
			async.series([
				cb => utils.login(agent, credentials, cb),
				() => agent.post(url).type('form').send(data).end((err, res) => {
					expect(res.statusCode).to.eql(400);
					expect(res.body.errors).to.contain(errors.subcategory.nameTooLong);
					done();
				}),
			]);
		});

		it('set default name given empty name', done => {
			const agent = supertest.agent(app);
			async.series([
				cb => utils.login(agent, credentials, cb),
				cb => agent.post(url).end((err, res) => {
					expect(res.statusCode).to.eql(200);
					expect(res.body).to.contain({ name: 'New SubCategory' });
					cb();
				}),
				() => SubCategory.findOne({}, (err, subcategory) => {
					expect(subcategory.name).to.eql('New SubCategory');
					done();
				}),
			]);
		});

		it('save subcategory', done => {
			const agent = supertest.agent(app);
			const data = { name: faker.string(25) };
			async.series([
				cb => utils.login(agent, credentials, cb),
				cb => agent.post(url).type('form').send(data).end((err, res) => {
					expect(res.statusCode).to.eql(200);
					expect(res.body).to.contain({
						name: data.name, categoryId: String(categoryId) });
					cb();
				}),
				() => SubCategory.findOne({}, (err, subcategory) => {
					expect(subcategory.name).to.eql(data.name);
					done();
				}),
			]);
		});
	});

	describe('DELETE', () => {
		it('handle unauthorized requests', done => {
			supertest(app).delete(url).end(utils.expectUnauthorized(done));
		});

		it('return 404 given non existing category id', done => {
			const agent = supertest.agent(app);
			const testUrl = getUrl(faker.string(24));
			async.series([
				cb => utils.login(agent, credentials, cb),
				() => agent.delete(testUrl).end((err, res) => {
					expect(res.statusCode).to.eql(404);
					expect(res.body.errors).to.contain(errors.category.idNotFound);
					done();
				}),
			]);
		});

		it('delete all subcategories with given category id', done => {
			const agent = supertest.agent(app);
			async.series([
				cb => utils.login(agent, credentials, cb),
				cb => SubCategory.create([{categoryId}, {categoryId}, {}, {}, {}], cb),
				cb => agent.delete(url).end((err, res) => {
					expect(res.statusCode).to.eql(200);
					cb();
				}),
				() => SubCategory.find({}, (err, subcategories) => {
					expect(subcategories.length).to.eql(3);
					done();
				}),
			]);
		});
	});
});

function getUrl(id) {
	return urlPattern.replace(':id', id);
}
