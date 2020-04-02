const ss = require('string-similarity');

/**
 * Removes all special characters that would disrupt a query.
 * 
 * @param {String} address A single-line address
 */
function cleanAddress( address = '' ) {
  return address.replace(/[\+\-\!\(\)\{\}\[\]\^\"\~\*\?\:\\\/]|\&{2,}|\|{2,}/g, '');
}
exports.cleanAddress = cleanAddress;

/**
 * This is purely a cheap optimization. It helps cast a broader net when 
 * doing autocomplete without having to use synonyms on the solr side of things.
 * 
 * @param {String} address A single-line address
 */
function expandDirections( address ) {
  const regex = /\s+(N|E|W|S|NE|SE|SW|NW)(\s+|,|\.)/gi;
  const directions = {
    n: 'North',
    e: 'East',
    w: 'West',
    s: 'South',
    ne: 'North East',
    se: 'South East',
    sw: 'South West',
    nw: 'North West'
  };

  return address.replace(regex, (m, d) => directions[d.toLowerCase()])
}
exports.expandDirections = expandDirections;

/**
 * This function takes the user supplied address and the geocoded address
 * and produces a score based on the similarity of the two strings.
 * 
 * @param {String} oaddr User supplied address
 * @param {String} gaddr Geocoded address
 */
function scoreGeocode( oaddr, gaddr ) {
  const normalize = ( addr ) => {
    const tokens = addr.toLowerCase().replace(/ /g, '').split(',');
    
    return [ tokens[0], tokens.pop()].join('');
  };

  return Number.parseFloat((ss.compareTwoStrings(
    normalize(oaddr),
    normalize(gaddr)
  ) * 100).toFixed(2));
}
exports.scoreGeocode = scoreGeocode;

/**
 * 
 * @param {String} address Address string that could be an intersection
 */
function parseIntersection( address ) {
  const regex = /([\w-,\. ]+)(?:&|\s+AND\s+)([\w-,\. ]+)/i;
  let [ match, left = '', right = '' ] = address.match(regex) || [];
  
  left = left.trim();
  right = right.trim();

  return left && right && { left, right };
}
exports.parseIntersection = parseIntersection;