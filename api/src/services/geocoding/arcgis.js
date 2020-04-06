const axios = require('axios').create({
  baseURL: process.env.AWGS_URL
});

function processCandidates( candidates ) {
  return {
    numFound: candidates.length,
    docs: candidates.map(({ address, location, score, attributes }) => ({
      gaddr: address,
      lat: location.y,
      lon: location.x,
      county: attributes.Subregion,
      state: attributes.Region,
      score
    }))
  }
}

async function findAddressCandidates( address ) {
  const { data } = await axios.get('/findAddressCandidates', {
    params: {
      f: 'json',
      countryCode: 'USA',
      outFields: 'Subregion, Region',
      singleLine: address
    }
  });

  return processCandidates(data.candidates);
}
exports.findAddressCandidates = findAddressCandidates;

async function reverseGeocode( latitude, longitude ) {
  const { data } = await axios.get('/reverseGeocode', {
    params: {
      f: 'json',
      countryCode: 'USA',
      outFields: 'Subregion, Region',
      location: `${longitude},${latitude}`
    }
  });
  const { address = {}, location = {} } = data;

  return processCandidates([{
    location,
    score: 100,
    address: address.Match_addr,
    attributes: {
      Subregion: address.Subregion,
      Region: address.Region
    }
  }]);
}
exports.reverseGeocode = reverseGeocode;
