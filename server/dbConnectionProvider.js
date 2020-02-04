var mysql = require('mysql');
var connectionString = require('./dbConnectionString');
var dbConnectionProvider = {

	getMysqlConnection: function () {
		var connection = mysql.createConnection(connectionString.dbConnectionString.connection);
		connection.connect(function (err) {
			if (err) { throw err; }

		});
		return connection;
	},
	closeMysqlConnection: function (currentConnection) {

		if (currentConnection) {
			currentConnection.end(function (err) {
				if (err) { throw err; }

			})
		}

	}

}

module.exports.dbConnectionProvider = dbConnectionProvider;