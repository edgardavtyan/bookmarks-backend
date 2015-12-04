module.exports = {
	username: {
		empty: { key: 'username-empty' },
		notFound: { key: 'not-found' },
		tooShort: { key: 'username-too-short' },
		tooLong: { key: 'username-too-long' },
		invalidSymbols: { key: 'username-has-invalid-symbols' },
		exists: { key: 'username-exists' },
	},

	password: {
		empty: { key: 'password-empty' },
		tooShort: { key: 'password-too-short' },
		tooLong: { key: 'password-too-long' },
	},

	auth: {
		notAuthenticated: { key: 'not-authenticated' },
	},

	category: {
		idEmpty: { key: 'category-id-empty' },
		nameTooLong: { key: 'category-name-too-long' },
		nameEmpty: { key: 'category-name-empty' },
		notFound: { key: 'category-not-found' },
		idNotFound: { key: 'category-id-not-found' },
	},
};
