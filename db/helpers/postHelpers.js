const db = require('../dbConfig');

module.exports = {
	getPosts(user) {
		let comments = db
			.select(db.raw('count(post_id)::integer'))
			.from('comments')
			.whereRaw('post_id = p.id')
			.as('comment_count');
		if (user.id) {
			let vote = db
				.select('vote')
				.from('users_posts')
				.where('user_id', user.id)
				.andWhereRaw('post_id = p.id')
				.as('user_vote');

			let favorite = db
				.select('favorite')
				.from('users_posts')
				.where('user_id', user.id)
				.andWhereRaw('post_id = p.id')
				.as('favorite');

			return db('posts as p')
				.where('p.quiz_id', null)
				.join('users as u', 'u.id', 'p.author')
				.leftJoin('topics as t', 'p.topic_id', 't.id')
				.select(
					'p.id',
					'p.title',
					'p.body',
					'p.votes',
					't.name as topic',
					'p.created_at',
					'u.username as author',
					'u.img_url as author_img',
					vote,
					favorite
					// comments,
				);
		} else {
			return db('posts as p')
				.where('p.quiz_id', null)
				.join('users as u', 'u.id', 'p.author')
				.leftJoin('topics as t', 'p.topic_id', 't.id')
				.select(
					'p.id',
					'p.title',
					'p.body',
					'p.votes',
					't.name as topic',
					'p.created_at',
					'u.username as author',
					'u.img_url as author_img'
					// comments,
				);
		}
	},
	async getPost(id, user) {
		console.log(id, user);
		let post = await db('posts as p')
			.where({ 'p.id': id })
			.leftJoin('topics as t', 'p.topic_id', 't.id')
			.select('p.id', 'p.title', 'p.body', 't.name as topic', 'p.created_at', 'p.author')
			.first();

		if (!post) return null;
		let author = await db('users').where('id', post.author).select('id', 'username', 'img_url').first();
		let comments = await db('comments as c')
			.where('post_id', id)
			.join('users as u', 'u.id', 'c.author')
			.select('c.id', 'c.text', 'u.username as author', 'u.img_url as author_img', 'c.created_at');
		post.author = author;
		post.comments = comments;
		if (user.id) {
			let user_post = await db('users_posts').where({ user_id: user.id, post_id: id }).first();
			if (user_post) {
				post = {
					...post,
					user_vote: user_post.vote,
					favorite: user_post.favorite ? true : false
				};
			} else {
				post = {
					...post,
					user_vote: 0,
					favorite: false
				};
			}
		}
		return post;
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
	async createPost({ title, body, topic, author, quiz }) {
		let topic_id = undefined;
		let quiz_id = undefined;

		if (topic) {
			topic_id = await this.getTopicId(topic);
		}
		if (quiz) {
			quiz = await db('quizzes').where('id', quiz).first();

			if (!quiz) return;
			quiz_id = quiz.id;
			if (topic_id) {
				if (quiz.topic_id !== topic_id) return;
			} else {
				topic_id = quiz.topic_id;
			}
		}

		return db('posts').returning('id').insert({ title, body, topic_id, author, quiz_id });
	},
	updatePost({ title = undefined, body = undefined }, id) {
		return db('posts').where({ id }).returning('id').update({ title, body });
	},
	deletePost(id) {
		return db('posts').where({ id }).del();
	},

	async updateUserPost({ vote = undefined, favorite = undefined }, user_id, post_id) {
		let entry = await db('users_posts').where({ user_id }).andWhere({ post_id }).first();
		if (!entry) {
			if (vote) {
				if (vote === 1) await db('posts').where('id', post_id).increment('votes', 1);
				if (vote === -1) await db('posts').where('id', post_id).decrement('votes', 1);
			}
			return db('users_posts').returning('id').insert({ vote, favorite, user_id, post_id });
		}

		if (vote !== undefined && vote !== entry.vote) {
			let difference = Math.abs(vote - entry.vote);

			if (vote < entry.vote) await db('posts').where('id', post_id).decrement('votes', difference);
			else await db('posts').where('id', post_id).increment('votes', difference);
		}

		return db('users_posts').returning('id').where({ post_id, user_id }).update({ vote, favorite });
	}
};
