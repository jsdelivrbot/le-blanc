var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

// Body Parse middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// Set static path
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.send('Hello World');
});


// Finally listen on available port
app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});
