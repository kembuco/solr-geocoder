const axios = require('axios').create({
  baseURL: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer'
});

async function findAddressCandidates( address ) {
  const { data } = await axios.get('/findAddressCandidates', {
    params: {
      f: 'pjson',
      countryCode: 'USA',
      outFields: 'Subregion',
      singleLine: address
    }
  });

  return {
    numFound: data.candidates.length,
    docs: data.candidates.map(({ address, location, score, attributes }) => ({
      gaddr: address,
      lat: location.y,
      lon: location.x,
      county: attributes.Subregion,
      score
    }))
  }
}
module.exports = findAddressCandidates;