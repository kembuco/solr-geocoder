const { expand } = require('../../providers/parsing.provider');
const { beginsWith } = require('../../search/query-builder');
const { toAddressQuery, queryAddresses } = require('../../search/queries');
const { escapeWhitespace } = require('./utils');

async function suggest( address, options ) {
  const expansions = await expand(address);
  const criteria = beginsWith('address_s', ...expansions.map(escapeWhitespace));

  return queryAddresses(toAddressQuery(criteria, options));
}
module.exports = suggest;