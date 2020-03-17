const { query } = require('../services/query.service');

module.exports = async function (fastify, options) {
  fastify.get('/geocode/:address', async ({ params }, reply) => {
    const { response } = await query(params.address);

    return response;
  });
  
  fastify.get('/geocode/debug/:address', async ({ params }, reply) => {
    return await query(params.address, true);
  });
}