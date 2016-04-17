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
//app.use(_body_parser.json());
//app.use(_body_parser.urlencoded({ extended: true }));
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
	var dest = req.file.path + '.json';

	var csv_converter = new _csv_to_json();
	csv_converter.on('end_parsed', function (json) {
		req.log.info({ dest: dest }, 'Writing file');
		_fs.writeFile(dest, JSON.stringify(json), function(err) {
			if (err) {
				req.log.error(err);
				res.status(500).send('Internal error');
				next(err);
			} else {
				req.log.info({ dest: dest }, 'Successfully wrote file')
				res.json({ url: '/api/data/' + req.file.filename + '.json' });
				//_fs.unlinkSync(req.file.path);
				next();
			}
		});
	});
	csv_converter.on('error', function(msg, data) {
		req.log.error({ err_msg: msg, err_data: data });
		res.status(500).send('Internal error');
		next(msg);
	});

	req.log.info('Converting csv to json');
	_fs.createReadStream(req.file.path).pipe(csv_converter);
});

app.get('/api/data/:id', function(req, res, next) {
	// Don't allow ..
	// TODO: Make this handle more nicely
	if (req.params.id.includes('..')) {
		throw new Error('Invalid ID');
	}

	var path = __dirname + '/tmp_store/' + req.params.id;
	req.log.info({ id: req.params.id, path: path }, 'File request');
	_fs.readFile(path, function(err, data) {
		if (err) {
			req.log.error(err);
			if (err.code === 'ENOENT') {
				res.status(404).send('Not found');
			} else {
				res.status(500).send('Internal error');
			}
			next(err);
		} else {
			res.json(JSON.parse(data));
			next();
		}
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
