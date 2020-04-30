const { 
  expand: expandAddress,
  parse: parseAddress
} = require('../../providers/parsing/parsing.local');

module.exports = async function ( fastify ) {
  fastify.get('/status', async () => ({ status: 'ok' }));
  fastify.get('/expand/:address', async ({ params: { address } }) => expandAddress(address));
  fastify.get('/parse/:address', async ({ params: { address } }) => parseAddress(address));
};