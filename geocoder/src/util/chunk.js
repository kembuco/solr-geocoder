/**
 * This function takes an array [1, 2, 3, 4, 5, 6] and turns it into a
 * multidemensional array [[1, 2], [3, 4], [5, 6]] of supplied size.
 * 
 * @param {Array} array Array to chunk
 * @param {Number} size Size of chunks
 */
function chunk(array, size) {
  let result = []
  
  for (let i = 0; i < array.length; i += size) {
    let chunk = array.slice(i, i + size);
    
    result.push(chunk);
  }
  
  return result;
}
module.exports = chunk;