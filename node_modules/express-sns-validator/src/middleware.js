const assert = require('assert')
const httpError = require('http-errors')

module.exports = (validator) => (req, res, next) => {
  assert.equal(typeof req.body, 'object', 'Expected req.body to be an object (missing body-parser middleware?)')
  assert.equal(typeof validator.validate, 'function', 'Expected validator to have a "validate" method')

  validator.validate(req.body, (err) => {
    if (err) {
      next(httpError(400, 'Invalid SNS notification: ' + err.message))
    } else {
      next()
    }
  })
}
