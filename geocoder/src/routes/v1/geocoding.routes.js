const {
  batchQuery,
  forwardQuery,
  reverseQuery,
  suggestQuery
} = require('../../services/geocoding.service');
const {
  forwardSchema,
  reverseSchema
} = require('./geocoding.schemas');

module.exports = async function (fastify) {
  fastify.get('/geocode/suggest/:address', forwardSchema(), async ({ params: { address }, query }) => {
    return suggestQuery(address, query);
  });

  fastify.get('/geocode/forward/:address', forwardSchema(), async ({ params: { address }, query }) => {
    return forwardQuery(address, query);
  });

  fastify.get('/geocode/reverse/:point', reverseSchema(), async ({ params: { point }, query }) => {
    return reverseQuery(point, query);
  });

  fastify.post('/geocode/batch', async ({ body }) => {
    return batchQuery(body.addresses);
  });
}