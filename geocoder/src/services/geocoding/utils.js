const compareStrings = require('talisman/metrics/jaro-winkler');
const { parse: parseAddress } = require('../../providers/parsing.provider');

/**
 * Removes all special characters that would disrupt a query.
 * 
 * @param {String} address A single-line address
 */
function cleanAddress( address = '' ) {
  // eslint-disable-next-line no-useless-escape
  return address.replace(/[\+\-\!\(\)\{\}\[\]\^\"\~\*\?\:\\\/]|\&{2,}|\|{2,}/g, '');
}
exports.cleanAddress = cleanAddress;

/**
 * This function takes the user supplied address and the geocoded address
 * and produces a score based on the similarity of the two strings.
 * 
 * @param {String} oaddr User supplied address
 * @param {String} gaddr Geocoded address
 */
async function scoreGeocode( oaddr, gaddr ) {
  const [ o, g ] = await Promise.all([
    parseAddress(oaddr),
    parseAddress(gaddr)
  ]);
  let score = 0;

  score += o.house_number == g.house_number ? 1 : 0;
  score += o.postcode == g.postcode ? 1 : 0;
  score += compareStrings(o.road || o.suburb || '', g.road || g.suburb || '');

  return Number.parseFloat((( score / 3 ) * 100).toFixed(2));
}
exports.scoreGeocode = scoreGeocode;

/**
 * 
 * @param {String} address Address string that could be an intersection
 */
function parseIntersection( address ) {
  // eslint-disable-next-line no-useless-escape
  const regex = /([\w-,\. ]+)(?:&|\s+AND\s+)([\w-,\. ]+)/i;
  // eslint-disable-next-line no-unused-vars
  let [ match, left = '', right = '' ] = address.match(regex) || [];
  
  left = left.trim();
  right = right.trim();

  return left && right && { left, right };
}
exports.parseIntersection = parseIntersection;

function escapeWhitespace( address ) {
  return address.replace(/\s/g, '\\ ');
}
exports.escapeWhitespace = escapeWhitespace;