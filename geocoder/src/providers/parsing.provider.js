const service = require('axios').create({
  baseURL: process.env.PARSING_BASE_URL
});

async function isAvailable() {
  try {
    const { data: { status } } = await service.get('/');
    
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