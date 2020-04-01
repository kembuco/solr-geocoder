const { client, getData } = require('../providers/http.provider');

exports.queryGeocoder = async function queryGeocoder( params, debug ) {
  const { response } = await getData('/geocoder/select', { 
    params: {
      ...params,
      fl: process.env.SOLR_QUERY_ADDRESS_FL,
      sort: process.env.SOLR_QUERY_ADDRESS_SORT,
      rows: process.env.SOLR_QUERY_ADDRESS_ROWS,
      debugQuery: debug || process.env.SOLR_QUERY_DEBUG
    }
  });
  
  return response;
};

exports.queryStreets = async function queryStreets( params, debug ) {
  const { response } = await getData('/streets/select', { 
    params: {
      ...params,
      fl: process.env.SOLR_QUERY_STREETS_FL,
      sort: process.env.SOLR_QUERY_STREETS_SORT,
      rows: process.env.SOLR_QUERY_STREETS_ROWS,
      debugQuery: debug || process.env.SOLR_QUERY_DEBUG
    }
  });

  return response;
};

exports.queryAddresses = async function queryAddresses( params, debug) {
  const { response } = await getData('/addresses/select', { 
    params: {
      ...params,
      fl: 'lat:latitude,lon:longitude,gaddr:address_s',
      rows: 1
    }
  });

  return response;
}