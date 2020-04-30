const {
  expand: { expandAddress },
  parser: { parseAddress }
} = require('node-postal');

async function isAvailable() {
  return true;
}
exports.isAvailable = isAvailable;

function expand( address ) {
  return [ address, ...expandAddress(address) ];
}
exports.expand = expand;

async function parse( address ) {
  const parsed = await parseAddress(address);

  return parsed.reduce(( result, { component, value }) => {
    result[component] = value;
    
    return result;
  }, {});
}
exports.parse = parse;