const { 
  forwardQuery,
  reverseQuery,
  batchQuery
} = require('../../services/geocoding.service');
const {
  parseAddress
} = require('../../services/address-parsing.service');

module.exports = async function (fastify) {
  fastify.get('/geocode/forward/:address', async ({ params }) => {
    return await forwardQuery(params.address);
  });

  fastify.get('/geocode/parse/:address', async ({ params }) => {
    return await parseAddress(params.address);
  });

  fastify.get('/geocode/reverse/:latlon', async ({ params }) => {
    return await reverseQuery(params.latlon);
  });

  fastify.post('/geocode/batch', async ({ body }) => {
    return await batchQuery(body.addresses);
  });
}