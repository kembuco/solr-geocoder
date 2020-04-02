/* eslint-disable no-async-promise-executor */
const { queryAddresses } = require('../../search/queries');
const { scoreGeocode } = require('./utils');
const { eq } = require('../../search/query-builder');
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
        numFound += responses.reduce(( acc, doc ) => acc + Math.round(doc.score * .01), 0);

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
 *    a comma in the address. ("101 S. Main St.", "Denver", "CO", "80222") 
 *    Where the first component is required.
 * 2. If nothing is found, it then does a more expensive query by splitting the
 *    first component by white space ("101", "S.", "Main", "St.") along with the
 *    last component (usually zipcode) and or'ing them in the query.
 * 
 * Example queries:
 * 1. +address:"101 S. Main St." address:"Denver" address:"CO", address:"80222"
 * 2. address:101 address:S. address:Main address:St. address:80222
 * 
 * @param {String} address Takes a single address and geocodes it
 */
async function findAddress( address ) {
  const defaultDoc = {
    oaddr: address
  };

  let doc = await waterfallQuery(
    () => firstPass(address),
    () => secondPass(address)
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

async function waterfallQuery( ...passes ) {
  return new Promise(async ( resolve, reject ) => {
    try {
      for ( let pass of passes ) {
        let [ doc ] = await pass();

        if ( doc ) {
          resolve(doc);
          break;
        }
      }

      resolve(null);
    } catch ( e ) {
      reject(e);
    }
  });
}

function firstPass( address ) {
  const components = address.split(',');

  return queryComponents(components, requiredAugmentation);
}

function secondPass( address ) {
  const components = address.split(',');
  const firstComponentTokens = components[0].split(/\s*/g);
  const lastComponent = components.slice(components.length - 1);

  return queryComponents([ ...firstComponentTokens, ...lastComponent ]);
}

async function queryComponents( components, augment = noopAugmentation ) {
  let { docs } = await queryAddresses({
    q: augment(toQuery(components))
  });

  return docs;
}

function requiredAugmentation( query ) {
  return `+${query}`;
}

function noopAugmentation( query ) {
  return query;
}

function toQuery( components ) {
  return components.map(toCriteria).join(' ');
}

function toCriteria( component ) {
  return eq('address', component);
}