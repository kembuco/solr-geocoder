const { queryAddresses } = require('../../search/queries');
const { score } = require('./utils');
const chunk = require('../../util/chunk');

// TODO: cleanup code and the unreadable bits.
// TODO: too many nested async funcitons
// TODO: throttle and test. we don't want to kill our poor solr instance
// TODO: document this stuff
module.exports = async function batchQuery( addresses ) {
  return new Promise(async ( resolve, reject ) => {
    // TODO: chunk size should be configurable
    let chunks = chunk(addresses, 250);
    let numFound = 0;
    let docs = [];

    for ( addressChunk of chunks ) {
      const responses = await Promise.all(addressChunk.map(async ( address ) => {
        let addressTokens = address.split(',');
        let q = addressTokens.map(( token, index ) => (
          `${index == 0 ? '+' : ''}address:"${token}"`
        )).join(' ');

        let response = await queryAddresses({ q });
    
        let [ doc ] = response.docs;
    
        if ( doc ) {
          numFound += 1;
        } else {
          addressTokens = [ ...addressTokens[0].split(' '), ...addressTokens.slice(1) ];
          
          q = addressTokens.map(token => `address:"${token}"`).join(' ');
          
          response = await queryAddresses({ q });
        }
    
        [ doc ] = response.docs;
        
        return {
          ...doc,
          score: score(address, doc.gaddr),
          oaddr: address
        };
      }));

      docs = [...docs, ...responses];
    }    

    resolve({ numFound, docs });
  });
}