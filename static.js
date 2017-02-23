var express = require('express');
var expressApp = express();

expressApp.use(express.static(__dirname + '/public'));

expressApp.listen(80);
