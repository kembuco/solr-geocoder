const {
  boolean,
  object,
  string
} = require('fluent-schema');

function forwardSchema() {
  const query = object().prop('components', boolean());
  const params = object().prop('address', string().required().minLength(1));
  
  return schema(query, params);
}
exports.forwardSchema = forwardSchema;

function reverseSchema() {
  const pointRegex = /(-?\d{0,2}\.?\d+), *(-?\d{0,3}\.?\d+)/;
  const query = object().prop('components', boolean());
  const params = object().prop('point', string().required().pattern(pointRegex));
  
  return schema(query, params);
}
exports.reverseSchema = reverseSchema;

// TODO: does this warrant a util file?
function schema( query, params ) {
  return {
    schema: {
      query,
      params
    }
  };
}