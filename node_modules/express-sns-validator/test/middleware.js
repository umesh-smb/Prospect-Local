const assert = require('assert')
const sinon = require('sinon')

const mockValidRequest = {
  body: { valid: true }
}

const mockInvalidRequest = {
  body: { valid: false }
}

const mockValidator = {
  validate: (body, next) => {
    if (body.valid) {
      next()
    } else {
      next(new Error('Invalid request'))
    }
  }
}

const middleware = require('../src/middleware')(mockValidator)

describe('express-sns-validator', function() {

  it('should call validator.validate', function(done) {
    const validator = sinon.spy(mockValidator, 'validate')
    middleware(mockValidRequest, null, function(err) {
      assert(validator.calledWith(mockValidRequest.body))
      assert(!err)
      validator.restore()
      done()
    })
  })
  
  it('should pass when the request is valid', function(done) {
    middleware(mockValidRequest, null, function(err) {
      assert(!err)
      done()
    })
  })

  it('should return HTTP 400 when the request is invalid', function(done) {
    middleware(mockInvalidRequest, null, function(err) {
      assert(err)
      assert.equal(err.status, 400)
      done()
    })
  })

  it('should throw when req.body is missing or not an object', function(done) {
    assert.throws(() => middleware({}))
    assert.throws(() => middleware({ body: 'request body string' }))
    done()
  })
})
