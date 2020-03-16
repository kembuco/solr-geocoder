function toParams( address ) {
  return {
    q: toQuery(address),
    fl: process.env.SOLR_QUERY_FL,
    sort: process.env.SOLR_QUERY_SORT,
    debugQuery: process.env.SOLR_QUERY_DEBUG
  }  
}
exports.toParams = toParams;

function toQuery( address ) {
  const fn = (typeof address === 'string') ? addressStringToQuery : addressObjectToQuery;

  return fn(address);
}
exports.toQuery = toQuery;

function addressStringToQuery( address ) {
  const simple = squash(address);
  const expanded = squash(expand(address));

  return `AddrComplete:${simple}* || AddrComplete:${expanded}*`;
}

function addressObjectToQuery({
  AddressNumber,
  StreetNamePreDirectional,
  StreetName
}) {
  return `AddrNum:${AddressNumber} && PreDir:${StreetNamePreDirectional} && StreetNameS:${StreetName}*`;
}

/**
 * Removes all whitespace from the address
 * 
 * @param {String} address A single-line address
 */
function squash( address ) {
  return address.replace(/\s/g, '');
}

/**
 * This is purely a cheap optimization. It helps cast a broader net when 
 * doing autocomplete without having to use synonyms on the solr side of things.
 * 
 * @param {String} address A single-line address
 */
function expand( address ) {;

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