const service = require('axios').create({
  baseURL: `${process.env.PARSING_BASE_URL}/v1`
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

async function expand( address ) {
  return service.get(`/v1/expand/${address}`);
}
exports.expand = expand;

async function parse( address ) {
  return service.get(`/v1/parse/${address}`);
}
exports.parse = parse;