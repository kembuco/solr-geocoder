const { queryStreetsParallel } = require('../../search/queries');
const { findIntersections } = require('../../database/streets');
const { containsPhrase } = require('../../search/query-builder');

module.exports = async function intersectionQuery( intersection ) {
  const [ left, right ] = await queryStreetsParallel(
    sreetsQuery(intersection.left),
    sreetsQuery(intersection.right)
  );

  return await processIntersection(left, right);
}

function sreetsQuery( street ) {
  return { q: containsPhrase('name', street) };
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