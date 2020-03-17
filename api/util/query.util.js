/**
 * Creates a query string where field should equal value exactly.
 * 
 * @param {String} field Field to search on
 * @param {String} value Value to search for
 */
function eq( field, value ) {
  if ( value && value.split(' ').length > 1 ) {
    value = `"${value}"`;
  }

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
 * An abstraction of a logical operation to keep things DRY.
 * 
 * @param {String} left Left side of the logical expression
 * @param {String} right Right side of the logical expression
 * @param {String} operator Logical operator
 */
function logical( operator, ...operands) {
  const [ left, right ] = operands;
  let response = '';

  if ( !left ) {
    response = right;
  } else if ( !right ) {
    response = left;
  } else if ( !left && !right ) {
    response = '';
  } else {
    response = `${left} ${operator} ${right}`;
  }

  if ( operands.length > 2 ) {
    return logical(...[operator, response, ...operands.slice(2)]);
  } else {
    return response;
  }
}
exports.logical = logical;

/**
 * This funciton "AND"s two clauses together.
 * 
 * @param {String} left Left side of the && query
 * @param {String} right Right side of the && query
 */
function and( ...operands ) {
  return logical(...['&&', ...operands]);
}
exports.and = and;

/**
 * This function "OR"s two clauses together.
 * 
 * @param {String} left Left side of the || query
 * @param {String} right Right side of the || query
 */
function or( ...operands ) {
  return logical(...['||', ...operands]);
}
exports.or = or;

/**
 * This function creates a grouping for a clause.
 * 
 * @param {String} left Left side of the && query
 * @param {String} right Right side of the && query
 */
function group( clause ) {
  return clause ? `(${clause})` : '';
}
exports.group = group;