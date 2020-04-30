/**
 * This API is purely for a development environment. Libpostal takes a really long time to start up (upwards of 13 seconds). So,
 * you can run the parser as an API so the geocoder doesn't have to load libpostal every time something else changes.
 */
require('dotenv').config();

const fastify = require('fastify')({ 
  logger: {
    prettyPrint: true,
    level: process.env.LOG_LEVEL
  }
});
const { 
  expand: expandAddress,
  parse: parseAddress
} = require('./src/providers/parsing/parsing.local');

fastify.register(async function ( fastify ) {
  fastify.get('/status', async () => ({ status: 'ok' }));
  fastify.get('/expand/:address', async ({ params: { address } }) => expandAddress(address));
  fastify.get('/parse/:address', async ({ params: { address } }) => parseAddress(address));
}, { prefix: 'v1' });

const start = async () => {
  try {
    await fastify.listen(process.env.PARSING_REMOTE_PORT, '0.0.0.0');
  } catch (err) {
    fastify.log.error(err);

    process.exit(1);
  }
}
start();