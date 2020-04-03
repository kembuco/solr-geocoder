const { 
  forwardQuery,
  reverseQuery,
  batchQuery
} = require('../../services/geocoding.service');
const {
  parseAddress
} = require('../../services/address-parsing.service');
const {
  forwardSchema,
  reverseSchema
} = require('./geocoding.schemas');

module.exports = async function (fastify) {
  fastify.get('/geocode/forward/:address', forwardSchema(), async ({ params, query }) => {
    return await forwardQuery(params.address, query);
  });

  fastify.get('/geocode/parse/:address', async ({ params }) => {
    return await parseAddress(params.address);
  });

  fastify.get('/geocode/reverse/:point', reverseSchema(), async ({ params, query }) => {
    return await reverseQuery(params.point, query);
  });

  fastify.post('/geocode/batch', async ({ body }) => {
    return await batchQuery(body.addresses);
  });
}