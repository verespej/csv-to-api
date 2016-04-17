var _q = require('q');
var _bunyan = require('bunyan');
var _uuid = require('uuid');
var _fs = require('fs');
var _express = require('express');
var _body_parser = require('body-parser');
var _multer = require('multer');
var _upload = _multer({ dest: 'tmp_store/' });
var _csv_to_json = require('csvtojson').Converter;
var _s3 = require('./app_modules/s3');
var cors = require('cors')

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

	var aws_key_id = process.env.AWS_KEY_ID;
	if (typeof(aws_key_id) !== 'string' || aws_key_id.length < 1) {
		throw new Error('Must set a string value for AWS_KEY_ID');
	}
	var aws_key = process.env.AWS_KEY;
	if (typeof(aws_key) !== 'string' || aws_key.length < 1) {
		throw new Error('Must set a string value for AWS_KEY');
	}
	var aws_region = process.env.AWS_REGION;
	if (typeof(aws_region) !== 'string' || aws_region.length < 1) {
		throw new Error('Must set a string value for AWS_REGION');
	}
	var s3_bucket = process.env.S3_BUCKET;
	if (typeof(s3_bucket) !== 'string' || s3_bucket.length < 1) {
		throw new Error('Must set a string value for S3_BUCKET');
	}

	return {
		log_level: log_level,
		aws_key_id: aws_key_id,
		aws_key: aws_key,
		aws_region: aws_region,
		s3_bucket: s3_bucket
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

// TODO allow all CORS, we can lock this down later
app.use(cors());

app.post('/api/data', _upload.single('datafile'), function(req, res, next) {
	convert_csv_to_json(req.log, req.file.path).then(function(json_obj) {
		return _s3.upsert(req.log, req.file.filename, json_obj);
	}).then(function() {
		return _q.ninvoke(_fs, 'unlink', req.file.path);
	}).done(function() {
		res.json({ url: '/api/data/' + req.file.filename });
		next();
	}, function(err) {
		req.log.error({ err: err });
		res.status(500).send('Internal error');
		next(err);
	});
});

function convert_csv_to_json(log, csv_file) {
	var d = _q.defer();

	var csv_converter = new _csv_to_json();

	csv_converter.on('end_parsed', function (json_obj) {
		d.resolve(json_obj);
	});

	csv_converter.on('error', function(err_msg, err_data) {
		log.error({ err_msg: err_msg, err_data: err_data }, 'Error converting CSV to JSON');
		d.reject(new Error(err_msg));
	});

	_fs.createReadStream(csv_file).pipe(csv_converter);

	return d.promise;
}

app.get('/api/data/:id', function(req, res, next) {
	if (!/^[a-z0-9]+$/.test(req.params.id)) {
		res.status(400).send('Invalid ID');
		next(new Error('Invalid ID'));
		return;
	}

	_s3.retrieve(req.log, req.params.id).done(function(json_obj) {
		res.json(json_obj);
		next();
	}, function(err) {
		req.log.error(err);
		if (err.code === 'NoSuchKey') {
			res.status(404).send('Not found');
		} else {
			res.status(500).send('Internal error');
		}
		next(err);
	});
});

app.set('port', (process.env.PORT || 5000));

_s3.init(_log, _config.aws_key_id, _config.aws_key, _config.aws_region, _config.s3_bucket).then(function() {
	_log.info('Starting server');
	return _q.ninvoke(app, 'listen', app.get('port'));
}).then(function() {
	_log.info('Express server started on port ' + app.get('port'));
}).catch(function(err) {
	_log.error('Something horrible happened', err);
});
