const { expand: { expandAddress }, parser: { parseAddress } } = require('node-postal');

module.exports = async function ( fastify ) {
  fastify.get('/expand/:address', async ({ params: { address } }) => {
    return await expandAddress(address);
  });

  fastify.get('/parse/:address', async ({ params: { address } }) => {
    const parsed = await parseAddress(address);

    return parsed.reduce(( result, { component, value }) => {
      result[component] = value;
      
      return result;
    }, {});
  });
}