const { client } = require('../providers/http.provider');

exports.queryGeocoder = function queryGeocoder( params, debug ) {
  return client.get('/geocoder/select', { 
    params: {
      ...params,
      fl: process.env.SOLR_QUERY_ADDRESS_FL,
      sort: process.env.SOLR_QUERY_ADDRESS_SORT,
      rows: process.env.SOLR_QUERY_ADDRESS_ROWS,
      debugQuery: debug || process.env.SOLR_QUERY_DEBUG
    }
  });
};

exports.queryStreets = function queryStreets( params, debug ) {
  return client.get('/streets/select', { 
    params: {
      ...params,
      fl: process.env.SOLR_QUERY_STREETS_FL,
      sort: process.env.SOLR_QUERY_STREETS_SORT,
      rows: process.env.SOLR_QUERY_STREETS_ROWS,
      debugQuery: debug || process.env.SOLR_QUERY_DEBUG
    }
  });
};

exports.queryAddresses = function queryAddresses( params, debug) {
  return client.get('/addresses/select', { 
    params: {
      ...params,
      fl: 'lat:latitude,lon:longitude,gaddr:address_s',
      rows: 1
    }
  });
}