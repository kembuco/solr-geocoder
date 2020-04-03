const { queryAddressesWaterfall } = require('../../search/queries');
const { 
  expandDirections,
  scoreGeocode
} = require('./utils');
const {
  beginsWith,
  containsPhrase,
  fuzzy
} = require('../../search/query-builder');
const squish = require('../../util/squish');

async function forwardQuery( address, options ) {
  const response = await queryAddressesWaterfall(
    toQuery(beginsWithCriteria(address), options),
    toQuery(phraseCriteria(address), options),
    toQuery(fuzzyCriteria(address), options)
  );

  response.docs.forEach(( doc ) => {
    doc.score = scoreGeocode(address, doc.gaddr);
  });

  return response
}
module.exports = forwardQuery;

function toQuery( q, options = {} ) {
  return {
    q,    
    fl: options.components ? process.env.SOLR_QUERY_ADDRESS_FL_COMPONENTS : process.env.SOLR_QUERY_ADDRESS_FL,
    rows: process.env.SOLR_QUERY_ADDRESS_ROWS,
    sort: process.env.SOLR_QUERY_ADDRESS_SORT,
    debugQuery: process.env.SOLR_QUERY_DEBUG,
  };
}

// Very fast and precise. Satisfies the "autosuggest" case
function beginsWithCriteria( address ) {
  const simple = squish(address);
  const expanded = squish(expandDirections(address));

  return beginsWith('address_s', simple, expanded);
}

// A bit slower, but has good accuracy on phrases
function phraseCriteria( address ) {
  return containsPhrase('address', address);
}

// A bit slower, but finds stuff the others can't
function fuzzyCriteria( address ) {
  const tokens = address.split(/\s|,/g).filter(t => t);

  return fuzzy('address', ...tokens);
}