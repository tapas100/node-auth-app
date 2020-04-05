const HttpStatus = require('http-status-codes');
function success(res, message, status = 200) {
	return res.status(status).json(message);
}

// eslint-disable-next-line no-shadow
function error(res, error) {
	res
		.status(error.status || 500)
		.send({ message: error.message, error: true, errors: error.error });
}

export const response = {
	success,
	error
};
