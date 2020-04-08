require('dotenv').config();

const fastify = require('fastify')({ 
  logger: {
    prettyPrint: true,
    level: process.env.LOG_LEVEL
  }
});
const { init } = require('./src/providers/solr.provider');

fastify.register(require('./src/routes/v1/geocoding.routes'), { prefix: 'v1' });

const start = async () => {
  try {
<<<<<<< HEAD
    await init();
=======
>>>>>>> f6396a9... Backup Plan A - proxy all calls to ArcGIS World Geocoding Service.
    await fastify.listen(process.env.API_PORT);
  } catch (err) {
    fastify.log.error(err);

    process.exit(1);
  }
}
start();