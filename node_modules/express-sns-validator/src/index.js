const SnsValidator = require('sns-validator')
const middleware = require('./middleware')

module.exports = () => middleware(new SnsValidator())
