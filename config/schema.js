const Joi = require('joi');

const registerUserSchema = {
	username: Joi.string().alphanum().min(4).max(10).required(),
	password: Joi.string().required(),
	email: Joi.string().required(),
	img_url: Joi.string().allow('', null)
};

const loginUserSchema = {
	email: Joi.string().required(),
	password: Joi.string().required()
};

const quizSchema = {
	title: Joi.string().required(),
	time_limit_seconds: Joi.number().integer().allow('', null),
	topic: Joi.string().max(20).required(),
	description: Joi.string().allow('', null),
	votes: Joi.number().integer(),
	question_time_limit: Joi.number().integer().max(60).allow('', null)
};

const updateQuizSchema = Joi.object()
	.keys({
		title: Joi.string(),
		time_limit_seconds: Joi.number().integer(),
		topic: Joi.string().max(20),
		description: Joi.string(),
		question_time_limit: Joi.number().integer().max(60).allow('', null)
	})
	.or('title', 'time_limit_seconds', 'topic', 'description', 'question_time_limit');

const UserQuizSchema = Joi.object()
	.keys({
		vote: Joi.number().integer().min(-1).max(1),
		favorite: Joi.boolean(),
		score: Joi.number().integer()
	})
	.or('vote', 'favorite', 'score');

const UserPostSchema = Joi.object()
	.keys({
		vote: Joi.number().integer().min(-1).max(1),
		favorite: Joi.boolean()
	})
	.or('vote', 'favorite');

const questionSchema = {
	question: Joi.string().required(),
	option1: Joi.string().required(),
	option2: Joi.string().required(),
	option3: Joi.string().allow('', null),
	option4: Joi.string().allow('', null),
	answer: Joi.number().integer().required().min(1).max(4)
};

const updateQuestionSchema = Joi.object()
	.keys({
		question: Joi.string(),
		option1: Joi.string(),
		option2: Joi.string(),
		option3: Joi.string().allow('', null),
		option4: Joi.string().allow('', null),
		answer: Joi.number().integer().min(1).max(4)
	})
	.or('question', 'option1', 'option2', 'option3', 'option4', 'answer');

const postSchema = {
	title: Joi.string().required(),
	body: Joi.string().required(),
	topic: Joi.string().max(20).allow('', null),
	quiz: Joi.number().integer()
};

const updatePostSchema = Joi.object()
	.keys({
		title: Joi.string(),
		body: Joi.string()
	})
	.or('title', 'body');

module.exports = {
	registerSchema(user) {
		console.log('registerSchema', Joi.validate(user, registerUserSchema, { stripUnknown: true }));
		return Joi.validate(user, registerUserSchema, { stripUnknown: true });
	},
	invalidLogin(user) {
		const { error } = Joi.validate(user, loginUserSchema, { stripUnknown: true });
		return error;
	},
	invalidQuiz(quiz, update) {
		if (update) {
			const { error } = Joi.validate(quiz, updateQuizSchema, { stripUnknown: true });
			return error;
		}
		const { error } = Joi.validate(quiz, quizSchema, { stripUnknown: true });
		return error;
	},
	invalidQuestion(question, update) {
		if (update) {
			const { error } = Joi.validate(question, updateQuestionSchema, { stripUnknown: true });
			return error;
		}
		const { error } = Joi.validate(question, questionSchema, { stripUnknown: true });
		return error;
	},
	invalidUserQuizUpdate(input) {
		const { error } = Joi.validate(input, UserQuizSchema, { stripUnknown: true });
		return error;
	},
	invalidPost(post, update) {
		if (update) {
			const { error } = Joi.validate(post, updatePostSchema, { stripUnknown: true });
			return error;
		}
		const { error } = Joi.validate(post, postSchema, { stripUnknown: true });
		return error;
	},
	invalidUserPostUpdate(input) {
		const { error } = Joi.validate(input, UserPostSchema, { stripUnknown: true });
		return error;
	}
};
