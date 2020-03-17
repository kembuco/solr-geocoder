#! /usr/bin/env node
const fs = require('fs');
const readline = require('readline');

let dupes = 0;
let header = true;
const seen = {};
const time = Date.now();
const writer = fs.createWriteStream('AllAddressesDeduped.csv')
const reader = readline.createInterface({
  input: fs.createReadStream('AllAddresses.csv')
});

reader.on('line', function(line) {
  if ( header ) {
    return header = false;
  }

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
  ] = line.replace(/^\"|\s|\"$/gi, '').split('","');
  const address = `${AddrNum}${NumSuf}${PreDir}${PreType}${StreetName}${PostType}${PostDir}${UnitType}${UnitNumber}${PlaceName}${Zipcode}`;

  if ( seen[address] ) {
    dupes += 1;
  } else {
    seen[address] = 1;
    writer.write(line + '\n');
  }
});

reader.on('close', function() {
  writer.close();
  console.log(`Processed ${dupes} dupes in ${Date.now() - time}ms`)
});