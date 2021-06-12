const db = require('../dbConfig');
const _ = require('lodash');

module.exports = {
	async getQuizzes(topic, user) {
		if (topic) {
			let topic = db('topics').where('id', topic).orWhere('name', topic).select('id');
			return db('quizzes').where('topic_id', topic);
		}

		let posts = db
			.select(db.raw('count(quiz_id)::integer'))
			.from('posts')
			.whereRaw('quiz_id = q.id')
			.as('post_count');

		// console.log('posts', posts);

		let questions = db
			.select(db.raw('count(quiz_id):integer'))
			.from('questions')
			.whereRaw('quiz_id = q.id')
			.as('question_count');

		// console.log('Qs', questions);

		if (user.id) {
			let vote = db
				.select('vote')
				.from('users_quizzes')
				.where('user_id', user.id)
				.andWhereRaw('quiz_id = q.id')
				.as('user_vote');

			let score = db
				.select('score')
				.from('users_quizzes')
				.where('user_id', user.id)
				.andWhereRaw('quiz_id = q.id')
				.as('score');

			let favorite = db
				.select('favorite')
				.from('users_quizzes')
				.where('user_id', user.id)
				.andWhereRaw('quiz_id = q.id')
				.as('favorite');

			return db('quizzes as q')
				.join('topics as t', 'q.topic_id', 't.id')
				.join('users as u', 'q.author', 'u.id')
				.select(
					'q.id',
					'q.title',
					'q.votes',
					'q.description',
					'q.time_limit_seconds',
					'q.question_time_limit',
					'u.username as author',
					'u.img_url as author_img',
					't.name as topic'
					// questions
					// posts,
					// vote,
					// score,
					// favorite,
				);
		} else {
			return db('quizzes as q')
				.join('topics as t', 'q.topic_id', 't.id')
				.join('users as u', 'q.author', 'u.id')
				.select(
					'q.id',
					'q.title',
					'q.votes',
					'q.description',
					'q.time_limit_seconds',
					'q.question_time_limit',
					'u.username as author',
					'u.img_url as author_img',
					't.name as topic'
					// questions
					// posts,
				);
		}
	},

	async getQuiz(quiz_id, user) {
		let quiz = await db('quizzes as q')
			.where('q.id', quiz_id)
			.join('topics as t', 'q.topic_id', 't.id')
			.select(
				'q.id',
				'q.title',
				'q.votes',
				'q.description',
				'q.time_limit_seconds',
				'q.question_time_limit',
				'q.author',
				't.name as topic'
			)
			.first();

		if (!quiz) return;
		if (user.id) {
			let user_quiz = await db('users_quizzes').where({ user_id: user.id, quiz_id }).first();
			if (user_quiz) {
				quiz = {
					...quiz,
					user_vote: user_quiz.vote,
					favorite: user_quiz.favorite ? true : false,
					score: user_quiz.score
				};
			} else {
				quiz = { ...quiz, user_vote: 0, favorite: false, score: 0 };
			}
		}
		let author = await db('users').where('id', quiz.author).select('id', 'username', 'img_url').first();
		let questions = await db('questions')
			// .select(db.raw('count(quiz_id)::integer'))
			// .select()
			.groupBy('quiz_id')
			.where({ quiz_id })
			.first();
		if (questions) {
			quiz.question_count = questions.count;
		} else {
			quiz.question_count = 0;
		}
		quiz.author = author;
		return quiz;
	},
	getTopics() {
		return db('topics');
	},
	async getTopicId(name) {
		let topic = await db('topics').where(db.raw('LOWER("name") = ?', name.toLowerCase())).select('id').first();
		if (!topic) {
			let [ id ] = await db('topics').returning('id').insert({ name });
			return id;
		} else {
			return topic.id;
		}
	},

	getQuizScores(id) {
		return db('users_quizzes as uq')
			.join('users as u', 'uq.user_id', 'u.id')
			.where('uq.quiz_id', id)
			.select('u.username', 'u.img_url', 'uq.score', 'uq.quiz_id');
	},
	getQuizPosts(quiz_id, user_id) {
		let comments = db
			.select(db.raw('count(post_id)::integer'))
			.from('comments')
			.whereRaw('post_id = p.id')
			.as('comment_count');

		if (user_id) {
			let vote = db
				.select('vote')
				.from('users_posts')
				.where({ user_id })
				.andWhereRaw('post_id = p.id')
				.as('user_vote');
			let favorite = db
				.select('favorite')
				.from('users_posts')
				.where({ user_id })
				.andWhereRaw('post_id = p.id')
				.as('favorite');
			return db('posts as p')
				.where('p.quiz_id', quiz_id)
				.join('users as u', 'u.id', 'p.author')
				.leftJoin('topics as t', 'p.topic_id', 't.id')
				.select(
					'p.id',
					'p.quiz_id as quiz',
					'p.title',
					'p.body',
					'p.votes',
					't.name as topic',
					'p.created_at',
					'u.username as author',
					'u.img_url as author_img',
					// comments,
					vote,
					favorite
				);
		}

		return db('posts as p')
			.where('p.quiz_id', quiz_id)
			.join('users as u', 'u.id', 'p.author')
			.leftJoin('topics as t', 'p.topic_id', 't.id')
			.select(
				'p.id',
				'p.quiz_id as quiz',
				'p.title',
				'p.body',
				'p.votes',
				't.name as topic',
				'p.created_at',
				'u.username as author',
				'u.img_url as author_img'
				// comments
			);
	},
	async createQuiz({ title, author, time_limit_seconds, topic, description, question_time_limit }) {
		let topic_id = await this.getTopicId(topic);

		return db('quizzes').returning('id').insert({
			title,
			author,
			time_limit_seconds,
			topic_id,
			description,
			question_time_limit
		});
	},
	async updateQuiz(
		{
			topic = undefined,
			title = undefined,
			time_limit_seconds = undefined,
			question_time_limit = undefined,
			description = undefined
		},
		id
	) {
		let topic_id = undefined;
		if (topic) {
			topic_id = await this.getTopicId(topic);
		}
		return db('quizzes')
			.where({ id })
			.returning('id')
			.update({ topic_id, title, time_limit_seconds, question_time_limit, description });
	},
	deleteQuiz(id) {
		return db('quizzes').where({ id }).del();
	},
	async userQuizUpdate({ vote = undefined, score = null, favorite = undefined }, user_id, quiz_id) {
		let entry = await db('users_quizzes').where({ user_id }).andWhere({ quiz_id }).first();

		if (!entry) {
			let body = { ..._.omitBy({ vote, score, favorite }, _.isUndefined), user_id, quiz_id };
			if (vote) {
				if (vote === 1) await db('quizzes').where('id', quiz_id).increment('votes', 1);
				if (vote === -1) await db('quizzes').where('id', quiz_id).decrement('votes', 1);
			}
			return db('users_quizzes').returning('id').insert(body);
		}
		if (score) {
			let questions = await db('questions').where({ quiz_id });
			if (score > questions.length) return;
		}

		if (vote !== undefined && vote !== entry.vote) {
			let difference = Math.abs(vote - entry.vote);

			if (vote < entry.vote) await db('quizzes').where('id', quiz_id).decrement('votes', difference);
			else await db('quizzes').where('id', quiz_id).increment('votes', difference);
		}

		return db('users_quizzes').returning('id').where({ quiz_id, user_id }).update({ vote, score, favorite });
	}
};
