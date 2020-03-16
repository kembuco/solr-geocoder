const {
  and,
  beginsWith,
  eq,
  group,
  or
} = require('../util/query.util');

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


  return or(
    beginsWith('AddrComplete', simple),
    beginsWith('AddrComplete', expanded)
  );
}

function addressObjectToQuery({
  AddressNumber, // address number
  AddressNumberSuffix, // a modifier after an address number, e.g 'B', '1/2'
  StreetName, // street name, excluding type & direction
  StreetNamePreDirectional, // a direction before a street name, e.g. 'North', 'S'
  StreetNamePreModifier, // a modifier before a street name that is not a direction, e.g. 'Old'
  StreetNamePreType, // a street type that comes before a street name, e.g. 'Route', 'Ave' 
  StreetNamePostDirectional, // a direction after a street name, e.g. 'North', 'S'
  StreetNamePostModifier, // a modifier after a street name, e.g. 'Ext'
  StreetNamePostType, // a street type that comes after a street name, e.g. 'Avenue', 'Rd'
  OccupancyType, // a type of occupancy within a building, e.g. 'Suite', 'Apt', 'Floor'
  OccupancyIdentifier, // the identifier of an occupancy, often a number or letter
  PlaceName, // city
  StateName, // state
  ZipCode, // zipcode
}) {
  const full = and(
    eq('AddrNum', AddressNumber),
    eq('NumSuf', AddressNumberSuffix),
    eq('StreetNameS', StreetName),
    eq('PreDir', StreetNamePreDirectional),
    eq('PreType', StreetNamePreType),
    eq('PostDir', StreetNamePostDirectional),
    eq('PostType', StreetNamePostType),
    eq('UnitType', OccupancyType),
    eq('UnitNumber', OccupancyIdentifier),
    eq('PlaceNameS', PlaceName),
    eq('ZipcodeS', ZipCode)
  );
  const street = and(
    eq('AddrNum', AddressNumber),
    eq('NumSuf', AddressNumberSuffix),
    eq('StreetNameS', StreetName),
    eq('PreDir', StreetNamePreDirectional),
    eq('PreType', StreetNamePreType),
    eq('PostDir', StreetNamePostDirectional),
    eq('PostType', StreetNamePostType)
  );
  const anything = and(
    eq('AddrNum', AddressNumber),
    eq('StreetNameS', StreetName)
  );

  return or(
    group(full),
    group(street),
    group(anything)
  );
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