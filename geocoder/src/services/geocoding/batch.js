/* eslint-disable no-async-promise-executor */
const { queryAddressesWaterfall } = require('../../search/queries');
const { scoreGeocode } = require('./utils');
const { 
  eq,
  fuzzy
 } = require('../../search/query-builder');
const chunkAddresses = require('../../util/chunk');

// TODO: throttle and test. we don't want to kill our poor solr instance.

/**
 * This function takes a list of addresses and geocodes them by searching
 * for them in Solr.
 * 
 * @param {Array<String>} addresses List of addresses to search for.
 */
function batchQuery( addresses ) {
  return new Promise(async ( resolve, reject ) => {
    let chunks = chunkAddresses(addresses, process.env.BATCH_CHUNK_SIZE);
    let numFound = 0;
    let docs = [];

    try {
      for ( let chunk of chunks ) {
        const responses = await Promise.all(chunk.map(findAddress));

        // Update numFound with documents that have a score. Based on our threshold,
        // document scores will either be 0 or > 70, hence the round function.
        numFound += responses.reduce(( accumulator, doc ) => accumulator + Math.round(doc.score * .01), 0);

        docs = [ ...docs, ...responses ];
      }    

      resolve({ numFound, docs });
    } catch ( e ) {
      reject(e);
    }
  });
}
module.exports = batchQuery;

/**
 * Takes a single line address (i.e. 101 S. Main St., Denver, CO, 80222) and 
 * searches Solr for it in two parts:
 * 
 * 1. It does phrase queries based on the different components, separated by
 *    a comma in the address. ("101 S. Main St.", "Denver", "CO", "80222"). The
 *    first component is required.
 * 2. If nothing is found, it then does a more expensive query by splitting the
 *    first component by white space ("101", "S.", "Main", "St.") along with the
 *    last component (usually zipcode) and or'ing them in the query.
 * 
 * Example queries:
 * 1. address:("101 S. Main St." "Denver" "CO" "80222")
 * 2. address:(101~ S~ Main~ St~ 80222~)
 * 
 * @param {String} address Takes a single address and geocodes it
 */
async function findAddress( address ) {
  const defaultDoc = { oaddr: address };
  const components = address.split(',');
  let { docs: [ doc ] } = await queryAddressesWaterfall(
    phraseQuery(components),
    fuzzyQuery(components)
  );
  let score = scoreGeocode(address, doc.gaddr);

  if ( doc && score < process.env.BATCH_SCORE_TOLERANCE ) {
    score = 0;
    doc = defaultDoc;
  }
  
  return doc ? {
    ...doc,
    ...defaultDoc,
    score
  } : defaultDoc;
}

function toQuery( q ) {
  return { q, rows: 1 };
}

function phraseQuery([ firstComponent, ...components ]) {
  const value = `+"${firstComponent}" ${components.map(v => `"${v}"`).join(' ')}`;
  
  // Make the first component required by adding a "+" before it
  return toQuery(eq('address', value));
}

function fuzzyQuery([ firstComponent, ...components ]) {
  // Split the first component on spaces, filter out falsy values
  const firstComponentTokens = firstComponent.split(/\s/).filter(t => t);
  let lastComponent = components.slice(components.length - 1);

  return toQuery(fuzzy('address', ...[...firstComponentTokens, ...lastComponent]));
}