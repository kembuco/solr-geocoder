const { queryAddresses } = require('../../search/queries');
const { scoreGeocode } = require('./utils');
const {
  boost,
  eq,
  required
} = require('../../search/query-builder');
const { parse: parseAddress } = require('../../providers/parsing.provider');

async function forwardQuery( address, options ) {
  let response;

  if ( options.broaden ) {
    response = await broadForwardQuery(address, options);
  } else  {
    response = await narrowForwardQuery(address, options);
  }

  response.docs.forEach(( doc ) => {
    doc.score = scoreGeocode(address, doc.gaddr);
  });

  return response;
}
module.exports = forwardQuery;

async function narrowForwardQuery( address, options ) {
  const {
    house_number,
    road,
    unit,
    city,
    state, 
    postcode
  } = await parseAddress(address);

  const boosters = [unit, city, state, postcode].filter(Boolean);
  const street = road.split(' ');
  const values = [
    required(eq('address_number', house_number)),
    required(eq('street', ...street.map(required))),
    boost(eq('address', ...boosters), 2),
  ].join(' ');

  return queryAddresses(toQuery(values), options);
}

async function broadForwardQuery( address, options ) {
  return queryAddresses(toQuery(eq('address', address), options));
}

function toQuery( q, options = {} ) {
  const fields = process.env.SOLR_QUERY_ADDRESS_FL;

  return {
    q,    
    fl: options.fields ? `${fields},${options.fields}` : fields,
    rows: process.env.SOLR_QUERY_ADDRESS_ROWS,
    sort: process.env.SOLR_QUERY_ADDRESS_SORT,
    debugQuery: process.env.SOLR_QUERY_DEBUG,
  };
}