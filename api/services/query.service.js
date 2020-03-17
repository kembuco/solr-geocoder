const { parseAddress } = require('../services/parsing.service');
const axios = require('axios').create({
  baseURL: process.env.SOLR_URL
});

const {
  and,
  beginsWith,
  boost,
  eq,
  fuzzy,
  group,
  or
} = require('../util/query.util');

async function query( address, debug = false ) {
  // First, try to geocode the address string
  let geocode = await querySolr(addressStringToQuery(address), debug);

  // Second, parse the address into it's parts for a more expansive search
  if ( !geocode.data.response.numFound ) {
    const parsed = await parseAddress(address);
    
    geocode = await querySolr(addressObjectToQuery(parsed), debug);

    if ( !geocode.data.response.numFound ) {
      geocode = await querySolr(returnAythingQuery(address), debug);
    }
  }
  
  return geocode.data;
}
exports.query = query;

async function querySolr( q, debug ) {
  return await axios.get('/select', { 
    params: {
      q,
      fl: process.env.SOLR_QUERY_FL,
      sort: process.env.SOLR_QUERY_SORT,
      debugQuery: debug || process.env.SOLR_QUERY_DEBUG
    }
  });
}

function addressStringToQuery( address ) {
  const simple = squish(address);
  const expanded = squish(expand(address));


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
    eq('StreetNameS', squish(StreetName)),
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
    eq('StreetNameS', squish(StreetName)),
    eq('PreDir', StreetNamePreDirectional),
    eq('PreType', StreetNamePreType),
    eq('PostDir', StreetNamePostDirectional),
    eq('PostType', StreetNamePostType)
  );
  const simple = and(
    eq('AddrNum', AddressNumber),
    eq('StreetNameS', squish(StreetName))
  );

  return or(
    group(full),
    group(street),
    group(simple)
  );
}

function returnAythingQuery( terms ) {
  const squished = squish(terms);

  return or(
    group(
      or(
        boost(eq('AddrNum', squished), 2),
        fuzzy('AddrNum', squished)
      )
    ),
    group(
      or(
        boost(eq('StreetNameS', squished), 2),
        fuzzy('StreetNameS', squished)
      )
    ),
    group(
      or(
        boost(eq('PlaceNameS', squished), 2),
        fuzzy('PlaceNameS', squished)
      )
    ),
    group(
      or(
        boost(eq('ZipcodeS', squished), 2),
        fuzzy('ZipcodeS', squished)
      )
    ),
    fuzzy('AddrComplete', terms)
  )
}

/**
 * Removes all whitespace from the address
 * 
 * @param {String} address A single-line address
 */
function squish( address = '' ) {
  return address.replace(/\s|,/g, '');
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