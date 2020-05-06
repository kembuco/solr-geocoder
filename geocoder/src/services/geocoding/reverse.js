const { queryAddresses } = require('../../search/queries');

const scores = [
  { range: [0, 20], score: 100 },
  { range: [21, 40], score: 90 },
  { range: [41, 60], score: 80 },
  { range: [61, 80], score: 70 },
];

module.exports = async function reverseQuery( point, options ) {
  const addressFields = process.env.SOLR_QUERY_ADDRESS_FL;
  const fields = options.fields ? `${addressFields},${options.fields}` : addressFields;
  const response = await queryAddresses({
    d: options.radius || process.env.SOLR_QUERY_REVERSE_RADIUS,
    q: '*:*',
    pt: point,
    fq: '{!bbox}',
    sfield: 'point',
    sort: 'geodist() asc',
    fl: `${fields},dist:geodist()`,
    debugQuery: process.env.SOLR_QUERY_DEBUG
  });

  response.docs.forEach(( doc ) => {
    const distance = doc.dist * 1000;
    const { score } = scores.find(({ range }) => range[0] <= distance && distance <= range[1]) || {};

    doc.score = score || 0;
  });

  return response;
}