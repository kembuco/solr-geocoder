const { 
  expand: expandAddress,
  parse: parseAddress
} = require('../../providers/parsing.provider');

module.exports = async function ( fastify ) {
  fastify.get('/expand/:address', async ({ params: { address } }) => expandAddress(address));
  fastify.get('/parse/:address', async ({ params: { address } }) => parseAddress(address));
};