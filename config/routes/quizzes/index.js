const express = require('express');
const router = express.Router();
const questionRouter = require('./questionRoutes');
const { invalidQuiz, invalidUserQuizUpdate } = require('../../schema');
const helpers = require('../../../db/helpers/quizHelpers');

router.param('quizId', (req, res, next, id) => {
	helpers
		.getQuiz(id, req.user)
		.then((quiz) => {
			if (!quiz) return next({ code: 404 });
			if (quiz.author.id === req.user.id) req.user.authorized = true;
			req.quiz = quiz;
			next();
		})
		.catch(next);
});

router.get('/', ({ query, user }, res, next) => {
	helpers
		.getQuizzes(query.topic, user)
		.then((response) => {
			res.status(200).json(response);
		})
		.catch(next);
});

router.get('/topics', (req, res, next) => {
	helpers
		.getTopics()
		.then((response) => {
			res.status(200).json(response);
		})
		.catch(next);
});

router.get('/:quizId', ({ quiz }, res, next) => {
	res.status(200).json(quiz);
});

router.get('/:quizId/scores', ({ quiz }, res, next) => {
	helpers.getQuizScores(quiz.id).then((response) => res.status(200).json(response)).catch(next);
});

router.get('/:quizId/posts', ({ quiz, user }, res, next) => {
	helpers.getQuizPosts(quiz.id, user.id).then((response) => res.status(200).json(response)).catch(next);
});

router.patch('/:quizId/edit', ({ quiz, body, user }, res, next) => {
	if (!user.authorized) return next({ code: 401 });
	if (invalidQuiz(body, true)) return next({ code: 400 });
	helpers
		.updateQuiz(body, quiz.id)
		.then((response) => {
			if (!response) return next({ code: 404 });
			res.status(200).json(response);
		})
		.catch(next);
});

router.patch('/:quizId', ({ quiz, body, user }, res, next) => {
	if (!user.id) return next({ code: 401 });
	if (invalidUserQuizUpdate(body)) return next({ code: 400 });
	helpers
		.userQuizUpdate(body, user.id, quiz.id)
		.then((response) => {
			if (!response) return next({ code: 400 });
			res.status(200).json(response);
		})
		.catch(next);
});

router.post('/', ({ body, user }, res, next) => {
	if (invalidQuiz(body)) return next({ code: 400 });
	if (!user.id) next({ code: 401 });
	body.author = user.id;
	helpers
		.createQuiz(body)
		.then((response) => {
			if (!response) return next({ code: 404 });
			res.status(200).json(response);
		})
		.catch(next);
});

router.delete('/:quizId', ({ quiz, body, user }, res, next) => {
	if (!user.authorized) return next({ code: 401 });
	helpers.deleteQuiz(quiz.id).then((response) => {
		if (!response) return next({ code: 404 });
		res.status(200).json({ message: 'Quiz successfully deleted.' });
	});
});

router.use('/:quizId/questions', questionRouter);

module.exports = router;
