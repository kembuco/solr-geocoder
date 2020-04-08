const { Promise: ZooKeeper } = require('zookeeper');
const logger = require('./logging.provider');
const rr = require('./solr/round-robin');

let initialized = false;
let retryAttempts = 0;
let selectHost;

function updateHosts( hosts ) {
 selectHost = rr(hosts);
}

function createClient() {
  const config = {
      connect: process.env.SOLR_ZK_HOST,
      timeout: process.env.SOLR_ZK_TIMEOUT || 10000,
      debug_level: ZooKeeper.ZOO_LOG_LEVEL_WARN,
      host_order_deterministic: false
  };

  return new ZooKeeper(config);
}

const monitor = ( client ) => ( type, state, path ) => {
  if (type === 4) {
    monitorLiveNodes(client);
  } else {
    logger.error(`Received invalid updated state. ${JSON.stringify({ path, type, state })}`);
  }
}

async function monitorLiveNodes( client ) {
  const nodes = await client.w_get_children('/live_nodes', monitor(client));
  const hosts = nodes.map(node => node.replace(/_solr/, ''));

  logger.info(`Solr client now using hosts: ${JSON.stringify(hosts)}`);

  updateHosts(hosts);
}

function init() {
  return new Promise(( resolve ) => {
    const client = createClient();
    
    selectHost = updateHosts([ process.env.SOLR_DEFAULT_HOST ])
  
    client.on('close', () => {
      logger.info(`ZooKeeper connection closed (${process.env.SOLR_ZK_HOST})`);
    });
  
    client.on('connect', async () => {
      initialized = true;
  
      monitorLiveNodes( client );

      resolve(true);

      logger.info(`ZooKeeper connection established (${process.env.SOLR_ZK_HOST})`);
    });
  
    client.init({});
  
    setTimeout(() => {
      if ( initialized === false ) {
        client.close();
  
        if ( retryAttempts < (+process.env.SOLR_ZK_RETRY_MAX_ATTEMPTS || 10) ) {
          retryAttempts += 1;
  
          setTimeout(init, (+process.env.SOLR_ZK_RETRY_INTERVAL || 10000));
        }
        
        resolve(false);

        logger.error(`Could not connect to ZooKeeper. Using default host: ${process.env.SOLR_DEFAULT_HOST}`);
      }
    }, +process.env.SOLR_ZK_CONNECT_TIMEOUT || 3000);
  });
}
exports.init = init;

function loadBalancedUrl() {
  let host = process.env.SOLR_DEFAULT_HOST || '127.0.0.1:8983';
  let protocol = process.env.SOLR_PROTOCOL || 'http';
  let path = process.env.SOLR_PATH || '/solr';

  if ( initialized ) {
    host = selectHost();
  } else {
    logger.error('ZooKeeper has not been initialized. Returning default Solr URL');    
  }

  return `${protocol}://${host}${path}`;
}
exports.loadBalancedUrl = loadBalancedUrl;