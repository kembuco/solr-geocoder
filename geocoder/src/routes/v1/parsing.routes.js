const { 
  expand: expandAddress,
  parse: parseAddress
} = require('../../providers/parsing.provider');

module.exports = async function ( fastify ) {
  fastify.get('/expand/:address', async ({ params: { address } }) => {
    const expansions = await expandAddress(address);

    return {
      success: true,
      expansions
    }
  });

  fastify.get('/parse/:address', async ({ params: { address } }) => {
    const components = await parseAddress(address);

    return {
      success: true,
      components
    }
  });
};