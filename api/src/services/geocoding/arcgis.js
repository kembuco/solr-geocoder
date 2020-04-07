const axios = require('axios').create({
  baseURL: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer'
});

async function findAddressCandidates( address ) {
  const { data } = await axios.get('/findAddressCandidates', {
    params: {
      f: 'json',
      countryCode: 'USA',
      outFields: 'Subregion, Region',
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
      state: attributes.Region,
      score
    }))
  }
}
module.exports = findAddressCandidates;