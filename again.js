var express = require('express');
var expressApp = express();
var expressWs = require('express-ws')(expressApp);

expressApp.use(function (req, res, next) {
	console.log('middleware');
	req.testing = 'testing';
	return next();
});

expressApp.use(express.static(__dirname + '/public'));

expressApp.ws('/', function(webSocketServer, req) {
	webSocketServer.on('message', function incoming(message) {
		console.log('received: %s', message);
		webSocketServer.send(`echo: ${message}`);
	});
	webSocketServer.on("close", function () {
		console.log("websocket connection close");
	});
	webSocketServer.on('connection', function connection(ws) {
		console.info("websocket connection open");
		ws.send('wellcome');
	});
	console.log('socket', req.testing);
});

expressApp.listen(80);
