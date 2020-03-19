const runScript = require('./run-script');
const chalk = require('chalk');
const path = require('path');

const solrPath = path.resolve(__dirname, '..', 'solr/bin/solr');

module.exports = function solr( command, message ) {
  async function runSolrScript(args) {
    return runScript({ message, command: solrPath, args });
  }

  async function server({ port }) {
    return runSolrScript([
      command,
      `-p ${port}`
    ]);
  };
  
  async function core({ core, confdir }) {
    return runSolrScript([
      command,
      core && `-c ${core}`,
      confdir && `-d ${confdir}`
    ]);
  }

  if ( ['start', 'restart', 'stop'].includes(command) ) {
    return server;
  } else if ( ['create', 'delete'].includes(command) ) {
    return core;
  }

  console.error(chalk.red(`Command not supported: ${command}`));
};