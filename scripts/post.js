const path = require('path');
const runScript = require('./run-script');

const command = path.resolve(__dirname, '..', 'solr/bin/post');

module.exports = async function post({ core, params, files }) {
  const message = 'Loading address data...';
  const args = [ `-c ${core}`, `-params "${params}"`, files ];

  return runScript({ message, command, args });
};