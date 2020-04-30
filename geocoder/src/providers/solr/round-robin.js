let index = 0;
let pool;

/**
 * A very simplistic function that chooses the next item in the pool. If
 * the end of the pool has been reached, it starts again from the beginning.
 * 
 * @param {Array} candidates A list of candidates to choose from
 */
function roundRobin( candidates = []) {
  pool = candidates;

  return () => {
    if ( index == pool.length - 1 ) {
      index = 0;
    } else {
      index += 1;
    }

    return pool[index];
  }
}
module.exports = roundRobin;
