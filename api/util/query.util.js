/**
 * Creates a query string where field should equal value exactly.
 * 
 * @param {String} field Field to search on
 * @param {String} value Value to search for
 */
function eq( field, value ) {
  return value ? `${field}:${value}` : '';
};
exports.eq = eq;

/**
 * Creates a query string where field should begin with value.
 * 
 * @param {String} field Field to search on
 * @param {String} value Value to search for
 */
function beginsWith( field, value ) {
  return value ? `${eq(field, value)}*` : '';
}
exports.beginsWith = beginsWith;

/**
 * This funciton "AND"s two clauses together.
 * 
 * @param {String} left Left side of the && query
 * @param {String} right Right side of the && query
 */
function and( left, right ) {
  return `${left} && ${right}`;
}
exports.and = and;

/**
 * This function "OR"s two clauses together.
 * 
 * @param {String} left Left side of the || query
 * @param {String} right Right side of the || query
 */
function or( left, right ) {
  return `${left} || ${right}`;
}
exports.or = or;

/**
 * This function creates a grouping for a clause.
 * 
 * @param {String} left Left side of the && query
 * @param {String} right Right side of the && query
 */
function group( clause ) {
  return `(${clause})`;
}
exports.group = group;