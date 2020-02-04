
var dbConnectionString = {

	connection:
		{

			host: process.env.HOST1,
			
			user: process.env.USER1,

			password: process.env.PASSWORD1,

			database: process.env.DATABASE,

			dateStrings: true

		}

}

module.exports.dbConnectionString = dbConnectionString;