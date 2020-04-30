const service = require('axios').create({
  baseURL: `${process.env.PARSING_REMOTE_URL}/v1`
});

async function isAvailable() {
  try {
    const { data: { status } } = await service.get('/status');
    
    return status === 'ok';
  } catch ( e ) {
    return false;
  }
}
exports.isAvailable = isAvailable;

async function get( path ) {
  const { data } = await service.get(path);

  return data;
}

function expand( address ) {
  return get(`/expand/${address}`);
}
exports.expand = expand;

function parse( address ) {
  return get(`/parse/${address}`);
}
exports.parse = parse;