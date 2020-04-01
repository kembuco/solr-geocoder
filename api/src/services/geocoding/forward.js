const { queryGeocoder } = require('../../search/queries');
const intersectionQuery = require('./intersection');
const {
  cleanAddress,
  expandDirections
} = require('./utils');
const {
  and,
  beginsWith,
  boost,
  eq,
  fuzzy,
  group,
  like,
  or
} = require('../../search/query-builder');
const squish = require('../../util/squish');

module.exports = async function forwardQuery( address, debug = false ) {
  let geocode;

  address = cleanAddress(address);

  geocode = await intersectionQuery(address, debug);

  // Try to geocode the address string
  if ( !geocode || !geocode.data.response.numFound ) {
    geocode = await queryGeocoder({ q: addressStringToQuery(address) }, debug);
  }

  // Parse the address into it's parts for a more expansive search
  if ( !geocode.data.response.numFound ) {
    const parsed = await parseAddress(address);
    
    geocode = await queryGeocoder({ q: addressObjectToQuery(parsed) }, debug);
  }
  
  // Return anything we can find in any field based on the address
  if ( !geocode.data.response.numFound ) {
    geocode = await queryGeocoder({ q: returnAythingQuery(address) }, debug);
  }
  
  return geocode.data;
}

function addressStringToQuery( address ) {
  const simple = squish(address);
  const expanded = squish(expandDirections(address));

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