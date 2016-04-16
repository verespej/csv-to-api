# CSV to API
Converts spreadsheets to APIs

## Usage

### Start the server
```sh
> git clone https://github.com/verespej/csv-to-api
> npm install
> set AWS_KEY_ID={Your AWS Key ID}
> set AWS_KEY={Your AWS Key}
> set AWS_REGION={Your desired AWS region}
> set S3_BUCKET={Your desired S3 bucket name}
> npm start
```

### Do a quick test
```sh
> curl -F "datafile=@test_data/awesomeness.csv" http://127.0.0.1:5000/api/data
> curl http://127.0.0.1:5000/{path returned by previous call}
```
