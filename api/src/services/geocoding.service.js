const forwardQuery = require('./geocoding/forward');
const intersectionQuery = require('./geocoding/intersection');
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

  response.oaddr = address;
  
  return response;
}

// TODO: Add oaddr to reverse query and clean addresses
exports.reverseQuery = require('./geocoding/reverse');
// TODO: clean addresses
exports.batchQuery = require('./geocoding/batch');