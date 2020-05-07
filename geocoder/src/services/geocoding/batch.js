/* eslint-disable no-async-promise-executor */
const forwardQuery = require('./forward');
const chunkAddresses = require('../../util/chunk');

/**
 * This function takes a list of addresses and geocodes them by searching for them in Solr.
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
        const responses = await Promise.all(
          chunk.map(findAddress)
        );

        // Update numFound with documents that have a geocoded address
        numFound += responses.filter(_ => _.gaddr).length;

        docs = [ ...docs, ...responses ];
      }    

      resolve({ numFound, docs });
    } catch ( e ) {
      reject(e);
    }
  });
}
module.exports = batchQuery;

// GOAL: 32/50, 188ms avg
async function findAddress( oaddr ) {
  let { docs: [ doc ] } = await forwardQuery( oaddr, { rows: 1 } );
  
  return {
    oaddr,
    score: 0,
    ...doc
  };
}