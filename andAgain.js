#!/usr/bin/env node

const http = require('http');
const websocket = require('websocket');
const express = require("express");

const webRoot = '/public';
const webPort = 80;

let expressApp = express();
let httpServer = http.createServer(expressApp);
let wsServer = new websocket.server({
	httpServer: httpServer,
	// You should not use autoAcceptConnections for production
	// applications, as it defeats all standard cross-origin protection
	// facilities built into the protocol and the browser.	You should
	// *always* verify the connection's origin and decide whether or not
	// to accept it.
	autoAcceptConnections: false,
});

expressApp.use(express.static(__dirname + webRoot));
expressApp.use(function (req, res, next) {
	console.log(`middleware: ${req.protocol} ${req.method} ${req.originalUrl}`);
	req.testing = 'testing';
	return next();
});

wsServer.on('request', function(request) {
	console.log('Got WS request.');

	let originIsAllowed = (origin) => {
		// put logic here to detect whether the specified origin is allowed.
		return true;
	};
	let protocolIsAllowed = (protocols) => {
		console.log(`Got those protocols: ${JSON.stringify(protocols)}`);
		return true;
	};

	if (!originIsAllowed(request.origin) || !protocolIsAllowed(request.requestedProtocols)) {
		// Make sure we only accept requests from an allowed origin
		request.reject();
		console.log(`WS Connection rejected.`);
		return;
	}

	// var connection = request.accept('echo-protocol', request.origin);
	var connection = request.accept(null, request.origin);
	console.log('Connection accepted.');
	connection.on('message', function(message) {
		if (message.type === 'utf8') {
			console.log('Received Message: ' + message.utf8Data);
			connection.sendUTF(message.utf8Data);
		}
		else if (message.type === 'binary') {
			console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
			connection.sendBytes(message.binaryData);
		}
	});
	connection.on('close', function(reasonCode, description) {
		console.log('Peer ' + connection.remoteAddress + ' disconnected.');
	});
});
wsServer.on('connect', function(webSocketConnection) {
	console.log('Got WS connect.');
});


httpServer.listen(webPort);
