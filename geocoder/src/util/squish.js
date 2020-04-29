/**
 * Removes all whitespace from the address
 * 
 * @param {String} address A single-line address
 */
function squish( address = '' ) {
  return address.replace(/[\s,]/g, '');
}
module.exports = squish;