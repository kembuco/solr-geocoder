const axios = require('axios');
const client = axios.create({
  baseURL: process.env.SOLR_URL
});

module.exports = async function (fastify, options) {  
  fastify.get('/geocode/:address', async ({ params }, reply) => {
    const { address } = params;
    const dirre = /\s+(N|E|W|S|NE|SE|SW|NW)(\s+|,|\.)/gi;
    const directions = {
      n: 'North',
      e: 'East',
      w: 'West',
      s: 'South',
      ne: 'North East',
      se: 'South East',
      sw: 'South West',
      nw: 'North West'
    }
    // Simple expansion to save a call
    const expanded = address.replace(dirre, (m, d) => directions[d.toLowerCase()]).replace(/\s/g, '');
    
    let time = Date.now();
    let geocode = await client.get('/select', {
      params: {
        q: `AddrComplete:${address.replace(/\s/g, '')}* || AddrComplete:${expanded}*`,
        fl: 'AddrComplete,Latitude,Longitude,score',
        sort: 'AddrNum ASC,PreDir ASC,PreType ASC,StreetNameS ASC,PostType ASC,PostDir ASC,PlaceNameS ASC,ZipcodeS ASC'
      }
    });
    console.log(`${Date.now() - time}ms`);

    const { PythonShell } = require('python-shell');
    const runPython = require('util').promisify(PythonShell.run);
    let options = {
      mode: 'json',
      pythonPath: '/Users/kevin/dev/simplefish/cdor/solr-geocoder/api/.venv/bin/python',
      pythonOptions: ['-u'], // get print results in real-time
      scriptPath: '/Users/kevin/dev/simplefish/cdor/solr-geocoder/api',
      args: [ address ]
    };

    if ( !geocode.data.response.numFound ) {
      time = Date.now();
      const [ response ] = await runPython('parseAddress.py', options);
      console.log(`${Date.now() - time}ms`);
      
      // TODO: Obvs this needs to be expanded
      const {
        AddressNumber,
        StreetNamePreDirectional,
        StreetName
      } = response;

      geocode = await client.get('/select', {
        params: {
          q: `AddrNum:${AddressNumber}&&PreDir:${StreetNamePreDirectional}&&StreetName:${StreetName}*`,
          fl: 'AddrComplete,Latitude,Longitude,score',
          sort: 'AddrNum ASC,PreDir ASC,PreType ASC,StreetNameS ASC,PostType ASC,PostDir ASC,PlaceNameS ASC,ZipcodeS ASC'
        }
      });
    }
    
    return geocode.data;
  });
}