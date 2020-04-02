const forwardQuery = require('./geocoding/forward');
const intersectionQuery = require('./geocoding/intersection');
const { 
  cleanAddress,
  parseIntersection
} = require('./geocoding/utils');

exports.forwardQuery = async function( address ) {
  const cleaned = cleanAddress(address);
  const intersection = parseIntersection(cleaned);
  let response;

  if (intersection) {
    response = await intersectionQuery(intersection);
  } else {
    response = await forwardQuery(cleaned);
  }
  
  return response;
}

exports.reverseQuery = require('./geocoding/reverse');
exports.batchQuery = require('./geocoding/batch');