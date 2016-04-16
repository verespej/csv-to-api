# CSV to API
Converts spreadsheets to APIs

## Usage

### Start the server
```sh
> git clone https://github.com/verespej/csv-to-api
> npm install
> npm start
```

### Do a quick test
```sh
> curl -F "datafile=@README.md" http://127.0.0.1:5000/api/data
> curl http://127.0.0.1:5000/{path returned by previous call}
```
