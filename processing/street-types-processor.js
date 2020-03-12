const fs = require('fs');
const csv = require('csv');
const util = require('util');
const parseCsv = util.promisify(csv.parse);

(async () => {
  fs.writeFileSync('./street-type-synonyms.txt', '');

  const input = fs.readFileSync('./StreetTypes.csv');
  const output = await parseCsv(input);
  
  let entries;
  output.forEach(async ( line ) => {
    if ( line[0] ) {
      if ( entries ) {
        fs.appendFileSync('./street-type-synonyms.txt', Array.from(entries).join(',') + '\n');
      }

      entries = new Set(line);
    } else {
      line.forEach(( entry ) => entry && entries.add(entry));
    }
  })
})();