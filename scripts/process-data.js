#! /usr/bin/env node
const readline = require('readline');
const path = require('path');
const ora = require('ora');
const fs = require('fs');

let header = true;
const seen = {};
const time = Date.now();

module.exports = async function processData({ infile, outfilesPattern }) {
  const outPath = path.dirname(infile);
  const perFile = +process.env.DATA_RECORDS_PER_FILE || 300000;
  let counter = 0;
  let spinner;
  let writer;

  function getWriter() {
    if ( counter % perFile == 0 ) {
      const index = (counter / perFile) + 1;
      const outfile = path.resolve(outPath, outfilesPattern.replace(/{index}/g, index));
      
      if ( writer ) {
        writer.close();
      }

      writer = fs.createWriteStream(outfile);
    }

    return writer;
  }

  const response = new Promise(( resolve, reject ) => {
    const reader = readline.createInterface({ input: fs.createReadStream(infile) });
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

    writer = getWriter();
    
    reader.on('line', function(line) {
      if ( header ) {
        return header = false;
      }

      counter += 1;
    
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
    
      // Create LatLon, AddrComplete, Street fields
      fields.push([Latitude, Longitude].filter(Boolean).join(','));
      fields.push([AddrFull, PlaceName, 'CO', Zipcode].filter(Boolean).join(', '));
      fields.push([PreDir, PreType, StreetName, PostType, PostDir].filter(Boolean).join(' '));
    
      if ( !seen[address] ) {
        seen[address] = 1;
    
        getWriter().write(`"${fields.join('","')}"` + '\n');
      }
    });
    
    reader.on('close', function() {
      getWriter().close();

      resolve();
    });
  });

  spinner = ora.promise(response, { text: 'Processing address data...', color: 'green' });

  return response;
}