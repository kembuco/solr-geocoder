const { 
  forwardQuery,
  reverseQuery,
  batchQuery
} = require('../../services/geocoding.service');

module.exports = async function (fastify) {
  fastify.get('/geocode/forward/:address', async ({ params, query }) => {
    return await forwardQuery(params.address, query.debug || false);
  });

  fastify.get('/geocode/reverse/:latlon', async ({ params, query }) => {
    return await reverseQuery(params.latlon, query.debug || false);
  });

  fastify.post('/geocode/batch', async ({ body }) => {
    return await batchQuery(body.addresses);
  });
}