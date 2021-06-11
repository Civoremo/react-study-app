// Update with your config settings.
require('dotenv').config();
const pg = require('pg');
pg.defaults.ssl = false;

module.exports = {
	development: {
		client: 'pg',
		connection: {
			filename: './db/db.sqlite3'
		},
		pool: {
			afterCreate: function(conn, cb) {
				conn.run('PRAGMA foreign_keys = ON', cb);
			}
		},

		useNullAsDefault: true,
		migrations: {
			directory: './db/migrations',
			tableName: 'dbmigrations'
		}
		// seeds: { directory: './db/seeds' }
	},

	// staging: {
	//   client: 'postgresql',
	//   connection: {
	//     database: 'my_db',
	//     user:     'username',
	//     password: 'password'
	//   },
	//   pool: {
	//     min: 2,
	//     max: 10
	//   },
	//   migrations: {
	//     tableName: 'knex_migrations'
	//   }
	// },

	production: {
		client: 'pg',
		connection: process.env.DATABASE_URL,
		// pool: {
		// 	min: 2,
		// 	max: 10
		// },
		migrations: {
			// tableName: 'knex_migrations'
			directory: './db/migrations'
		},
		seeds: { directory: './db/seeds' }
	}
};
