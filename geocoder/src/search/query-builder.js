/**
 * Creates a query string where field should begin with value.
 * 
 * @param {String} field Field to search on
 * @param {...String} values Values to search for
 */
function beginsWith( field, ...values ) {
  const value = values && values.map(v => `${v}*`).join(' ');

  return value ? eq(field, value) : '';
}
exports.beginsWith = beginsWith;

/**
* Returns supplied value with Solr "boost" syntax
* 
* @param {String} value Value to boost
* @param {Number} amount Amount to boost
*/
function boost( value, amount ) {
  return value ? `${value}^${amount}` : '';
}
exports.boost = boost;

/**
 * Creates a query string where field contains value as a phrase.
 * 
 * @param {String} field Field to search on
 * @param {...String} values Values to search for
 */
function containsPhrase( field, ...values ) {
  const value = values && values.map(v => `"${v}"`).join(' ');

  return value ? eq(field, value) : '';
}
exports.containsPhrase = containsPhrase;

/**
* Creates a query string where field should equal value exactly.
* 
* @param {String} field Field to search on
* @param {...String} values Values to search for
*/
function eq( field, ...values ) {
  const value = values && values.join(' ');

  return value ? `${field}:(${value})` : '';
}
exports.eq = eq;

/**
 * Creates a query string where field is "fuzzy like" value.
 * 
 * @param {String} field Field to search on
 * @param {...String} values Values to search for
 */
function fuzzy( field, ...values ) {
  const value = values && values.map(v => `${v}~`).join(' ');

  return value ? eq(field, value) : '';
}
exports.fuzzy = fuzzy;

/**
 * Returns the supplied value with Solr "required" syntax
 * 
 * @param {String} value Value which is to be required
 */
function required( value ) {
  return value ? `+${value}` : '';
}
exports.required = required;