require('dotenv').config();

const fastify = require('fastify')({ 
  logger: {
    prettyPrint: true,
    level: process.env.LOG_LEVEL
  }
});

fastify.register(require('./src/routes/v1/parsing.routes'), { prefix: 'v1' });

const start = async () => {
  try {
    await fastify.listen(process.env.API_PORT, '0.0.0.0');
  } catch (err) {
    fastify.log.error(err);

    process.exit(1);
  }
}
start();