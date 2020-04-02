const { queryAddresses } = require('../../search/queries');

module.exports = async function reverseQuery( latlon ) {
  return await queryAddresses({
    d: process.env.SOLR_QUERY_REVERSE_RADIUS,
    q: '*:*',
    pt: latlon,
    fq: '{!bbox}',
    sfield: 'latlon',
    sort: 'geodist() asc',
    fl: `${process.env.SOLR_QUERY_ADDRESS_FL},dist:geodist()`,
    debugQuery: process.env.SOLR_QUERY_DEBUG
  });
}