require('dotenv').config();

const fastify = require('fastify')({ 
  logger: {
    prettyPrint: true,
    level: process.env.LOG_LEVEL
  }
});
const { isAvailable } = require('./src/providers/parsing.provider');
const { init } = require('./src/providers/solr.provider');

fastify.register(require('./src/routes/v1/geocoding.routes'), { prefix: 'v1' });
fastify.register(require('./src/routes/v1/parsing.routes'), { prefix: 'v1' });

const start = async () => {
  try {
    const available = await isAvailable();

    if ( !available ) {
      fastify.log.error(`Parsing service is not available at ${process.env.PARSING_REMOTE_URL}. Functionality will be degraded.`);
    }

    await init();
    await fastify.listen(process.env.API_PORT, '0.0.0.0');
  } catch (err) {
    fastify.log.error(err);

    process.exit(1);
  }
}
start();