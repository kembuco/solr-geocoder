#! /usr/bin/env node
const fs = require('fs');
const readline = require('readline');

let header = true;
const seen = {};
const time = Date.now();
const writer = fs.createWriteStream('AllAddressesProcessed.csv')
const reader = readline.createInterface({
  input: fs.createReadStream('AllAddresses.csv')
});
const indexes = {
  OBJECTID: 0,
  Longitude: 1,
  Latitude: 2,
  AddrNum: 3,
  NumSuf: 4,
  PreDir: 5,
  PreType: 6,
  StreetName: 7,
  PostType: 8,
  PostDir: 9,
  UnitType: 10,
  UnitNumber: 11,
  AddrFull: 12,
  PlaceName: 13,
  Zipcode: 14,
  County: 15,
  LatLon: 16,
  AddrComplete: 17
};

reader.on('line', function(line) {
  if ( header ) {
    return header = false;
  }

  let fields = line.trim().replace(/^\"|\"$/g, '').split('","');

  if ( fields.length < 16 ) {
    return /* not enough fields */;
  }
  
  fields = fields.map((field, index) => {
    // Trim all fields
    field = field.trim();

    if ( field ) {
      if ( index == indexes.PlaceName ) {
        // Remove ", co" from cities
        field = field.replace(/,*\s*CO$/i, '');
        
        // Title case cities that are full capped
        if ( field.match(/\s*[A-Z]+\s*/g).join('').length == field.length ) {
          field = field.replace(/\w\S*/g, ( txt ) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        }
      }

      if ( index == indexes.Zipcode ) {
        // Remove any alpha characters from zipcodes
        field = field.replace(/[A-Z]/i, '');
      }

      if ( index == indexes.StreetName || index == indexes.AddrFull ) {
        // Normalize ordinals on numbers
        field = field.replace(/\d+(St|Nd|Rd|Th)/, ( match ) => match.toLocaleLowerCase());
      }

      // Remove <Null> from all fields
      field = field.replace(/\s*<Null>\s*/gi, '');

      return field;
    }
  });

  const [
    OBJECTID,
    Longitude,
    Latitude,
    AddrNum,
    NumSuf,
    PreDir,
    PreType,
    StreetName,
    PostType,
    PostDir,
    UnitType,
    UnitNumber,
    AddrFull,
    PlaceName,
    Zipcode,
    County
  ] = fields;
  const address = `${AddrNum}${NumSuf}${PreDir}${PreType}${StreetName}${PostType}${PostDir}${UnitType}${UnitNumber}${PlaceName}${Zipcode}`;

  // Create a LatLon, AddrComplete fields
  fields.push([Latitude, Longitude].filter(Boolean).join(','));
  fields.push([AddrFull, PlaceName, 'CO', Zipcode].filter(Boolean).join(', '));

  if ( !seen[address] ) {
    seen[address] = 1;

    writer.write(`"${fields.join('","')}"` + '\n');
  }
});

reader.on('close', function() {
  writer.close();

  console.log(`Processed in ${Date.now() - time}ms`)
});