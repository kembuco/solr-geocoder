const { loadBalancedUrl } = require('./solr.provider');
const axios = require('axios');

function getClient () {
  return axios.create({ baseURL: loadBalancedUrl() });
}

exports.getClient = getClient;
exports.getData = ( url, opts ) => getClient().get( url, opts ).then(({ data }) => data);
exports.postData = ( url, data, opts ) => getClient().post( url, data, opts ).then(({ data }) => data);
