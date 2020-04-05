const Joi = require('joi');

const errorMessage = (error, res, next) => {
	if (error) {
		res.status(422).send({
			error: error.details[0].message
		});
		return;
	}
	next();
};
const registerValidate = (req, res, next) => {
	const schema = {
		first_name: Joi.string()
			.min(3)
			.max(50)
			.required(),
		email: Joi.string().email(),
		mobile_number: Joi.string()
			// .length(10)
			.required(),
		password: Joi.string()
		// .min(6)
		// .max(20)
	};
	let { error } = Joi.validate(req.body, schema);
	errorMessage(error, res, next);
};
const loginValidate = (req, res, next) => {
	const schema = {
		email: Joi.string().email(),
		password: Joi.string().required()
	};
	let { error } = Joi.validate(req.body, schema);
	errorMessage(error, res, next);
};
const emailValidate = (req, res, next) => {
	const schema = {
		email: Joi.string().email()
	};
	let { error } = Joi.validate(req.body, schema);
	// Quick fix @TODO clean up
	if (error) {
		res.status(422).send({
			message: error.details[0].message
		});
		return;
	}
	errorMessage(error, res, next);
};






export const userValidations = {
	registerValidate,
	loginValidate,
	emailValidate,
};
