const { Pool, types } = require('pg');
const config = require('../config/database.config');

types.setTypeParser(1700, parseFloat);

module.exports = new Pool( config );