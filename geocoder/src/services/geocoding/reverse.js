const { queryAddresses } = require('../../search/queries');

module.exports = async function reverseQuery( point, options ) {
  const fields = options.components ? process.env.SOLR_QUERY_ADDRESS_FL_COMPONENTS : process.env.SOLR_QUERY_ADDRESS_FL;

  return await queryAddresses({
    d: process.env.SOLR_QUERY_REVERSE_RADIUS,
    q: '*:*',
    pt: point,
    fq: '{!bbox}',
    sfield: 'point',
    sort: 'geodist() asc',
    fl: `${fields},dist:geodist()`,
    debugQuery: process.env.SOLR_QUERY_DEBUG
  });
}