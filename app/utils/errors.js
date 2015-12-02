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
		nameTooLong: { key: 'category-name-too-long' },
	},
};
