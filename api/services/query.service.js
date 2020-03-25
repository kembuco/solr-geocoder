const { parseAddress } = require('./parsing.service');
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
  like,
  or
} = require('../util/solr.query.util');
const { findIntersections } = require('../util/db.roads.util');
const isIntersection = /([\w-,\. ]+)(?:&|\s+AND\s+)([\w-,\. ]+)/i;

async function queryAddresses( q, debug ) {
  return await axios.get('/geocoder/select', { 
    params: {
      q,
      fl: process.env.SOLR_QUERY_ADDRESS_FL,
      sort: process.env.SOLR_QUERY_ADDRESS_SORT,
      rows: process.env.SOLR_QUERY_ADDRESS_ROWS,
      debugQuery: debug || process.env.SOLR_QUERY_DEBUG
    }
  });
}

async function queryRoads( q, debug ) {
  return await axios.get('/roads/select', { 
    params: {
      q,
      fl: process.env.SOLR_QUERY_ROADS_FL,
      sort: process.env.SOLR_QUERY_ROADS_SORT,
      rows: process.env.SOLR_QUERY_ROADS_ROWS,
      debugQuery: debug || process.env.SOLR_QUERY_DEBUG
    }
  });
}

async function forwardQuery( address, debug = false ) {
  let geocode;

  address = cleanAddress(address);

  // See if the address is an intersection query
  const intersection = getIntersection(address);
  if ( intersection ) {
    const [ left, right ] = await Promise.all([
      queryRoads(roadToQuery(intersection.left), debug),
      queryRoads(roadToQuery(intersection.right), debug)
    ]);

    geocode = await processIntersection(left.data.response, right.data.response);
  }

  // Try to geocode the address string
  if ( !geocode || !geocode.data.response.numFound ) {
    geocode = await queryAddresses(addressStringToQuery(address), debug);
  }

  // Parse the address into it's parts for a more expansive search
  if ( !geocode.data.response.numFound ) {
    const parsed = await parseAddress(address);
    
    geocode = await queryAddresses(addressObjectToQuery(parsed), debug);
  }
  
  // Return anything we can find in any field based on the address
  if ( !geocode.data.response.numFound ) {
    geocode = await queryAddresses(returnAythingQuery(address), debug);
  }
  
  return geocode.data;
}
exports.forwardQuery = forwardQuery;

async function reverseQuery( latlon, debug = false ) {
  const { data } = await axios.get('/geocoder/select', { 
    params: {
      d: process.env.SOLR_QUERY_REVERSE_RADIUS,
      q: '*:*',
      pt: latlon,
      fq: '{!bbox}',
      sfield: 'LatLon',
      sort: 'geodist() asc',
      fl: `${process.env.SOLR_QUERY_ADDRESS_FL},dist:geodist()`,
      debugQuery: debug || process.env.SOLR_QUERY_DEBUG
    }
  });

  console.log(data);

  return data;
}
exports.reverseQuery = reverseQuery;

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

function roadToQuery( road ) {
  return or(
    like('nameS', squish(road)),
    eq('name', road)
  )
}

function getIntersection( address ) {
  let [ match, left = '', right = '' ] = address.match(isIntersection) || [];
  
  left = left.trim();
  right = right.trim();

  return left && right && { left, right };
}

async function processIntersection( left, right ) {
  let docs = [];

  if (left.numFound, right.numFound) {
    const leftIds = left.docs.map(({ id }) => id);
    const rightIds = right.docs.map(({ id }) => id);

    docs = await findIntersections(leftIds, rightIds);
  }
  
  return { 
    data: { 
      response: {
        docs,
        numFound: docs.length
      }
    }
  }
}

/**
 * Removes all whitespace from the address
 * 
 * @param {String} address A single-line address
 */
function squish( address = '' ) {
  return address.replace(/[\s,]/g, '');
}

function cleanAddress( address = '' ) {
  return address.replace(/[\+\-\!\(\)\{\}\[\]\^\"\~\*\?\:\\\/]|\&{2,}|\|{2,}/g, '');
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