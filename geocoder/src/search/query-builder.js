/**
 * Creates a query string where field should equal value exactly.
 * 
 * @param {String} field Field to search on
 * @param {String} value Value to search for
 */
function eq( field, value ) {
  return value ? `${field}:(${value})` : '';
}
exports.eq = eq;

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