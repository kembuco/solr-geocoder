const axios = require('axios').create({
  baseURL: process.env.SOLR_URL
});

exports.client = axios;
exports.getData = ( url, opts ) => axios.get( url, opts ).then(({ data }) => data);
exports.postData = ( url, data, opts ) => axios.post( url, data, opts ).then(({ data }) => data);