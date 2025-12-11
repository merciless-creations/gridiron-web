/**
 * Gracefully stop the mock server
 * Created by sxd15
 */
const http = require('http');

const port = process.env.PORT || 3001;

const opts = {
  host: 'localhost',
  port: port,
  path: '/stop',
  method: 'GET'
};

const req = http.request(opts, function (res) {
  console.log('shutdown statusCode: ', res.statusCode);
});

req.on('error', function (e) {
  console.log('req error: ', e.message);
});

req.end();
