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

async function forwardQuery( address ) {
  const response = await queryAddressesWaterfall(
    beginsWithQuery(address),
    phraseQuery(address),
    fuzzyQuery(address)
  );
  
  response.oaddr = address;
  response.docs.forEach(( doc ) => {
    doc.score = scoreGeocode(address, doc.gaddr);
  });

  return response
}
module.exports = forwardQuery;

function toQuery( q ) {
  return { q };
}

// Very fast and precise. Satisfies the "autosuggest" case
function beginsWithQuery( address ) {
  const simple = squish(address);
  const expanded = squish(expandDirections(address));

  return toQuery(beginsWith('address_s', simple, expanded));
}

// A bit slower, but has good accuracy on phrases
function phraseQuery( address ) {
  return toQuery(containsPhrase('address', address));
}

// A bit slower, but finds stuff the others can't
function fuzzyQuery( address ) {
  const tokens = address.split(/\s|,/g).filter(t => t);

  return toQuery(fuzzy('address', ...tokens));
}