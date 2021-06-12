require('dotenv').config();
const knex = require('knex');
const knexConfig = require('../knexfile.js');

const environment = process.env.NODE_ENV || 'development';
// const environment = 'development';
console.log(environment);

module.exports = knex(knexConfig[environment]);
