const { 
  forwardQuery,
  reverseQuery,
  batchQuery
} = require('../services/query.service');

module.exports = async function (fastify, options) {
  fastify.get('/geocode/forward/:address', async ({ params, query }, reply) => {
    const { response } = await forwardQuery(params.address, query.debug || false);

    return response;
  });

  fastify.get('/geocode/reverse/:latlon', async ({ params, query }, reply) => {
    const { response } = await reverseQuery(params.latlon, query.debug || false);

    return response;
  });

  fastify.post('/geocode/batch', async ({ body }, reply) => {
    const { response } = await batchQuery(body.addresses);

    return response;
  });
}