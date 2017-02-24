const http = require('http');
const express = require('express');
const expressWs = require('express-ws');

const webRoot = './public';
const webPort = 80;
const webSocketsOptions = {
	// You should not use autoAcceptConnections for production
	// applications, as it defeats all standard cross-origin protection
	// facilities built into the protocol and the browser.	You should
	// *always* verify the connection's origin and decide whether or not
	// to accept it.
	autoAcceptConnections: false,
};
const ewsOptions = {
	wsOptions: webSocketsOptions,
};

let httpServer = http.createServer();
let expressApp = express();
let ewsApp = expressWs(expressApp, httpServer, ewsOptions);

expressApp.use(function (req, res, next) {
	console.log('middleware');
	req.testing = 'testing';
	return next();
});

expressApp.use(express.static(__dirname + webRoot));

expressApp.ws('/', function(webSocketServer, req) {
	webSocketServer.on('message', function incoming(message) {
		console.log(`received: ${message}`);
		webSocketServer.send(`echo: ${message}`);
	});
	webSocketServer.on('close', function () {
		console.log('websocket connection close');
	});
	webSocketServer.on('connection', function connection(ws) {
		console.info('websocket connection open');
		ws.send('wellcome');
	});
	console.log(`socket req.testing=${req.testing}`);
});

expressApp.listen(webPort);
httpServer.on('close', () => console.log(`httpServer now CLOSED`));
httpServer.on('close', () => console.log(`httpServer now CLOSED`));
httpServer.on('listening', () => console.log(`Now listen to ${httpServer.address()}:${webPort}`));
