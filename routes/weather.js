let express = require('express');
let router = express.Router();
let https = require('https');

router.get('/places', function(req, res, next) {
	https.get('https://api.meteo.lt/v1/places', response => {
		let result = '';
		response.on('data', function(data) {
			result += data.toString();
		});
		response.on('end', function(data) {
			res.send(result);
		});
	});
});

router.get('/places/:place', function(req, res, next) {
	https.get(`https://api.meteo.lt/v1/places/${req.params['place']}/forecasts/long-term`, response => {
		let result = '';

		response.on('data', data => {
			result += data.toString();
		});

		response.on('end', () => {
			res.send(JSON.parse(result));
		});
	});
});

module.exports = router;
