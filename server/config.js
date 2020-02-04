var fs = require('fs');
var parseString = require('xml2js').parseString;

var config = {

	jwt_secret: 'newages',

	encrypt_algorithm: 'newagesmb',
	encrypt_pass: 'aes-256-cbc',
	image_bucket_name: 'nomo-base-files',
	image_bucket_thumb: 'nomo-base-files',
	file_bucket_name: 'nomo-base-files',
	video_bucket_name: 'nomo-base-videos',
	s3_url: 'https://s3.amazonaws.com/',
	site_url: 'https://dev.uspowersavers.com/',
	base_url: "http://10.10.10.91:7575/",
	DATE_TIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
	DATE_FORMAT: 'YYYY-MM-DD',
	TIME_FORMAT: 'HH:mm:ss',

	page_limit: 10,

	accountSid: 'ACba47f8a2bf8ebbf2dc5721f9d9bbd0e4',
	authToken: '18fab25e3a2bb4f0d9f0a0cbd3046230',
	twilio_from_number: '+18564062054',

	getConfig: function (callback) {
		fs.readFile('config.xml', function (err, data) {
			parseString(data, function (err, result) {
				callback(result.preferences);
			});
		});
	}, 
	getSettings: function (callback) {
		fs.readFile('settings.xml', function (err, data) {
			parseString(data, function (err, result) {
				callback(result.preferences);
			});
		});
	}

}

module.exports = config;