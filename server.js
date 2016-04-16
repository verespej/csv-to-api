var _q = require('q');
var _bunyan = require('bunyan');
var _uuid = require('uuid');
var _express = require('express');
var _body_parser = require('body-parser');

var _config = (function() {
	var log_level = process.env.LOG_LEVEL;
	if (typeof(log_level) === 'undefined') {
		log_level = 'info';
	} else if (log_level !== 'trace' &&
		log_level !== 'debug' &&
		log_level !== 'info' &&
		log_level !== 'warn' &&
		log_level !== 'error' &&
		log_level !== 'fatal') {
		throw new Error('Log level must be one of the following string values: trace, debug, info, warn, error, fatal');
	}

	return {
		log_level: log_level
	};
})();

var _log = new _bunyan({
	name: 'job-scraper',
	streams: [
		{
			stream: process.stdout,
			level: _config.log_level
		},
		{
			path: 'errors.log',
			level: 'error',
			type: 'rotating-file',
			period: '1d',
			count: 5
		}
	],
	serializers: _bunyan.stdSerializers
});

var app = _express();
app.use(_body_parser.json());
app.use(_body_parser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
	req.id = _uuid.v4();
	req.log = _log.child({ req_id: req.id });
	res.setHeader('X-Request-Id', req.id);

	_log.debug({ req_id: req.id, req: req }, 'Received request');

	res.on('finish', function() {
		req.log.debug({
			headers: res._headers,
			statusCode: res.statusCode,
			statusMessage: res.statusMessage
		}, 'Response sent');
	});

	res.on('close', function() {
		req.log.debug('Connection terminated');
	});

	next();
});
app.use(_express.static(__dirname + '/static'));

app.set('port', (process.env.PORT || 5000));

_log.info('Starting server');
app.listen(app.get('port'), function() {
	_log.info('Express server started on port ' + app.get('port'));
});
