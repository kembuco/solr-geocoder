const { queryStreets } = require('../../search/queries');
const { findIntersections } = require('../../database/streets');
const { parseIntersection } = require('./utils');
const {
  eq,
  like,
  or
} = require('../../search/query-builder');
const squish = require('../../util/squish');

module.exports = async function intersectionQuery( address, debug = false ) {
  return new Promise(async ( resolve, reject ) => {
    const intersection = parseIntersection(address);
  
    if ( intersection ) {
      const [ left, right ] = await Promise.all([
        queryStreets({ q: roadToQuery(intersection.left) }, debug),
        queryStreets({ q: roadToQuery(intersection.right) }, debug)
      ]);
  
      resolve(await processIntersection(left.data.response, right.data.response));
    } else {
      resolve(null);
    }
  });
}

function roadToQuery( road ) {
  return or(
    like('nameS', squish(road)),
    eq('name', road)
  )
}

async function processIntersection( left, right ) {
  let docs = [];

  if (left.numFound, right.numFound) {
    const leftIds = left.docs.map(({ id }) => id);
    const rightIds = right.docs.map(({ id }) => id);

    docs = await findIntersections(leftIds, rightIds);
  }
  
  return { 
    data: { 
      response: {
        docs,
        numFound: docs.length
      }
    }
  }
}