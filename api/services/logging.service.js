const pino = require('pino');

const logger = pino({
  prettyPrint: true,
  level: process.env.LOG_LEVEL
});

module.exports = logger;