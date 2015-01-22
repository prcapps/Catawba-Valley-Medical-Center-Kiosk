var express = require('express');
var app = express();

var path = require('path');

app.set('port', (process.env.PORT || 3000));

var http = require('http').Server(app);

app.use('/',express.static(path.join(__dirname, '')));


http.listen( (process.env.PORT || 3000), function(){
  console.log('listening on *:'+  (process.env.PORT || 3000) );
});
