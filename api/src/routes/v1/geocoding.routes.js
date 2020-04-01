const { 
  forwardQuery,
  reverseQuery,
  batchQuery
} = require('../../services/geocoding.service');

module.exports = async function (fastify, options) {
  fastify.get('/geocode/forward/:address', async ({ params, query }, reply) => {
    return await forwardQuery(params.address, query.debug || false);
  });

  fastify.get('/geocode/reverse/:latlon', async ({ params, query }, reply) => {
    return await reverseQuery(params.latlon, query.debug || false);
  });

  fastify.post('/geocode/batch', async ({ body }, reply) => {
    return await batchQuery(body.addresses);
  });
}