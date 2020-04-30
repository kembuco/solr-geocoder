const forwardQuery = require('./geocoding/forward');
const intersectionQuery = require('./geocoding/intersection');
const { findAddressCandidates } = require('./geocoding/arcgis')
const { 
  cleanAddress,
  parseIntersection
} = require('./geocoding/utils');

exports.forwardQuery = async function( address, options ) {
  const cleaned = cleanAddress(address);
  const intersection = parseIntersection(cleaned);
  let response;

  if (intersection) {
    response = await intersectionQuery(intersection);
  } else {
    response = await forwardQuery(cleaned, options);
  }

  let maxScore = response.docs.reduce(( max, doc ) => Math.max(max, doc.score), 0);

  if ( maxScore < 70 && ( !intersection || !response.docs.length ) ) {
    response = await findAddressCandidates(address);
  }

  response.oaddr = address;
  
  return response;
}

exports.suggestQuery = require('./geocoding/suggest');

// TODO: Add oaddr to reverse query and clean addresses
exports.reverseQuery = require('./geocoding/reverse');
// TODO: clean addresses
exports.batchQuery = require('./geocoding/batch');