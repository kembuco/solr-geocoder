/* eslint-disable no-async-promise-executor */
const { getData } = require('../providers/http.provider');

async function queryStreets( params ) {
  const { response } = await getData('/streets/select', { 
    params: {
      fl: process.env.SOLR_QUERY_STREETS_FL,
      sort: process.env.SOLR_QUERY_STREETS_SORT,
      rows: process.env.SOLR_QUERY_STREETS_ROWS,
      debugQuery: process.env.SOLR_QUERY_DEBUG,
      ...params
    }
  });

  return response;
}
exports.queryStreets = queryStreets;

/**
 * This function takes a list of params maps and runs them sequentially as
 * queryStreets calls. When it gets a response from one of the calls it stops
 * processing and returns the response
 * 
 * @param  {...any} paramsList List of params maps that will get passed into queryStreets function
 */
function queryStreetsWaterfall( ...paramsList ) {
  const passes = paramsList.map(params => () => queryStreets(params));

  return waterfallQuery(...passes);
}
exports.queryStreetsWaterfall = queryStreetsWaterfall;

/**
 * This function takes a list of params maps and runs them in parallel as
 * queryStreets calls. It will return a list of responses.
 * 
 * @param  {...any} paramsList List of params maps that will get passed into queryStreets function
 */
function queryStreetsParallel( ...paramsList ) {
  const queries = paramsList.map(params => () => queryStreets(params));

  return parallelQuery(...queries);
}
exports.queryStreetsParallel = queryStreetsParallel;

async function queryAddresses( params ) {
  const { response } = await getData('/addresses/select', { 
    params: {
      fl: process.env.SOLR_QUERY_ADDRESS_FL,
      rows: process.env.SOLR_QUERY_ADDRESS_ROWS,
      sort: process.env.SOLR_QUERY_ADDRESS_SORT,
      debugQuery: process.env.SOLR_QUERY_DEBUG,
      ...params
    }
  });

  return response;
}
exports.queryAddresses = queryAddresses;

/**
 * This function takes a list of params maps and runs them sequentially as
 * queryAddresses calls. When it gets a response from one of the calls it stops
 * processing and returns the response.
 * 
 * @param  {...any} paramsList List of params maps that will get passed into queryAddresses function
 */
function queryAddressesWaterfall( ...paramsList ) {
  const queries = paramsList.map(params => () => queryAddresses(params));

  return waterfallQuery(...queries);
}
exports.queryAddressesWaterfall = queryAddressesWaterfall;

/**
 * This function takes a list of params maps and runs them in parallel as
 * queryAddresses calls. It will return a list of responses.
 * 
 * @param  {...any} paramsList List of params maps that will get passed into queryAddresses function
 */
function queryAddressesParallel( ...paramsList ) {
  const queries = paramsList.map(params => () => queryAddresses(params));

  return parallelQuery(...queries);
}
exports.queryAddressesParallel = queryAddressesParallel;

/**
 * Runs a list of queries in series. If one of the queries returns documents,
 * this function will short circuit and return the docs.
 * 
 * @param  {...Function} queries A series of query functions to call
 */
function waterfallQuery( ...queries ) {
  return new Promise(async ( resolve, reject ) => {
    try {
      let response;

      for ( let query of queries ) {
        response = await query();

        if ( response.numFound > 0 ) {
          break;
        }
      }

      resolve(response);
    } catch ( e ) {
      reject(e);
    }
  });
}
exports.waterfallQuery = waterfallQuery;

/**
 * Runs a list of queries in parallel. Returns a list of all the responses.
 * 
 * @param  {...Function} passes A list of query functions to call
 */
function parallelQuery( ...queries ) {
  const promises = queries.map(query => query());
  
  return Promise.all(promises);
}
exports.parallelQuery = parallelQuery;
