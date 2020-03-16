const { parseAddress } = require('../services/parsing.service');
const { toParams } = require('../services/query.service');
const axios = require('axios').create({
  baseURL: process.env.SOLR_URL
});

module.exports = async function (fastify, options) {  
  fastify.get('/geocode/:address', async ({ params }, reply) => {
    // First, try to geocode the address string
    let geocode = await axios.get('/select', { params: toParams(params.address) });

    // Second, parse the address into it's parts for a more expansive search
    if ( !geocode.data.response.numFound ) {
      const parsed = await parseAddress(params.address);
      
      geocode = await axios.get('/select', { params: toParams(parsed) });
    }
    
    return geocode.data;
  });
}