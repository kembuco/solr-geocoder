const { queryGeocoder } = require('../../search/queries');

module.exports = async function reverseQuery( latlon, debug = false ) {
  const { data } = await queryGeocoder({
    d: process.env.SOLR_QUERY_REVERSE_RADIUS,
    q: '*:*',
    pt: latlon,
    fq: '{!bbox}',
    sfield: 'LatLon',
    sort: 'geodist() asc',
    fl: `${process.env.SOLR_QUERY_ADDRESS_FL},dist:geodist()`,
    debugQuery: debug || process.env.SOLR_QUERY_DEBUG
  });

  return data;
}