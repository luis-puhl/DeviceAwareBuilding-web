var express = require('express');
var expressApp = express();

const webRoot = '/public';
const webPort = 80;

expressApp.use(express.static(__dirname + webRoot));

expressApp.listen(webPort);
