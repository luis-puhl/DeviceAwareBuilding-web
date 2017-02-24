const http = require('http');
const express = require('express');
const expressWs = require('express-ws');

const webRoot = '/public';
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

/* ----------------------------------------------------------------------	 */

expressApp.use(function (req, res, next) {
	console.log(`middleware: ${req.protocol} ${req.method} ${req.originalUrl}`);
	req.testing = 'testing';
	return next();
});
expressApp.use(function (req, res, next) {
	if (req.ws !== null && req.ws !== undefined) {
		req.wsHandled = true;
		try {
			/* Unpack the `.ws` property and call the actual handler. */
			middleware(req.ws, req, next);
		} catch (err) {
			/* If an error is thrown, let's send that on to any error handling */
			next(err);
		}
	} else {
		/* This wasn't a WebSocket request, so skip this middleware. */
		next();
	}
});

/* ----------------------------------------------------------------------	 */

expressApp.use(express.static(__dirname + webRoot));

/* ----------------------------------------------------------------------	 */

expressApp.ws('/', function(webSocketServer, req) {
	console.log('Got WS request.');
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
	webSocketServer.on('request', function(request) {
		console.log('Got WS request.');
	});
	console.log(`socket req.testing=${req.testing}`);
});

/* ----------------------------------------------------------------------	 */

function originIsAllowed(origin) {
	// put logic here to detect whether the specified origin is allowed.
	return true;
}

function protocolIsAllowed(protocols) {
	console.log(`Got those protocols: ${JSON.stringify(protocols)}`);
	return true;
}

let wsServer = ewsApp.getWss('/');
wsServer.on('request', function(request) {
	console.log((new Date()) + ' Got WS request.');
	if (!originIsAllowed(request.origin)) {
		// Make sure we only accept requests from an allowed origin
		request.reject();
		console.log(`${new Date()} Connection from origin ${request.origin} rejected.`);
		return;
	}
	if (!protocolIsAllowed(request.requestedProtocols)){

	}

	// var connection = request.accept('echo-protocol', request.origin);
	var connection = request.accept(null, request.origin);
	console.log((new Date()) + ' Connection accepted.');
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
		console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
	});
});
wsServer.on('connect', function(webSocketConnection) {
	console.log((new Date()) + ' Got WS connect.');
});

/* ----------------------------------------------------------------------	 */

expressApp.listen(webPort);
httpServer.on('close', () => console.log(`httpServer now CLOSED`));
httpServer.on('close', () => console.log(`httpServer now CLOSED`));
httpServer.on('listening', () => console.log(`Now listen to ${httpServer.address()}:${webPort}`));
