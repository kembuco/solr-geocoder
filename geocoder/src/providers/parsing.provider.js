let implementation;

if ( ( process.env.PARSING_USE_LOCAL || 'false' ).toLowerCase() === 'true' ) {
  implementation = require('./parsing/parsing.local');
} else {
  implementation = require('./parsing/parsing.remote');
}

module.exports = implementation;