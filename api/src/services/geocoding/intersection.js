const { queryStreets } = require('../../search/queries');
const { findIntersections } = require('../../database/streets');
const {
  eq,
  like,
  or
} = require('../../search/query-builder');
const squish = require('../../util/squish');

module.exports = async function intersectionQuery( intersection, debug = false ) {
  const [ left, right ] = await Promise.all([
    queryStreets({ q: roadToQuery(intersection.left) }, debug),
    queryStreets({ q: roadToQuery(intersection.right) }, debug)
  ]);

  return await processIntersection(left, right);
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
    numFound: docs.length,
    docs
  }
}