require('dotenv').config();

const fastify = require('fastify')({ 
  logger: {
    prettyPrint: true,
    level: process.env.LOG_LEVEL
  }
});

const {
  parseAddress
} = require('./src/services/address-parsing.service');
const {
  forwardSchema,
  reverseSchema
} = require('./src/routes/v1/geocoding.schemas');
const { findAddressCandidates, reverseGeocode } = require('./src/services/geocoding/arcgis')

fastify.register(async function (fastify) {
  fastify.get('/geocode/forward/:address', forwardSchema(), async ({ params }) => {
    return findAddressCandidates(params.address);
  });

  fastify.get('/geocode/parse/:address', async ({ params }) => {
    return await parseAddress(params.address);
  });

  fastify.get('/geocode/reverse/:point', reverseSchema(), async ({ params }) => {
    const [ latitude, longitude ] = params.point.split(',');

    return await reverseGeocode(latitude, longitude);
  });
}, { prefix: 'v1' });

const start = async () => {
  try {
    await fastify.listen(process.env.API_PORT);
  } catch (err) {
    fastify.log.error(err);

    process.exit(1);
  }
}
start();