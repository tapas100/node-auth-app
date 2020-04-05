const messages = {
	invalid_creds: 'Invalid Credentials',
	not_register: `Hey, looks like you haven't not register. please register`,
	something_went_wrong: 'something went wrong, please try again later !',
};

export const msg = (key, placeholders = {}) => messages[key] || key;
