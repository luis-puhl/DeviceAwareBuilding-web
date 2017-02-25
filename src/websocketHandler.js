#!/usr/bin/env node

const EventEmitter = require('events');

/* -------------------------------------------------------------------------- */

class webSocketEventsEmitter extends EventEmitter {}
const webSocketServerEvents = new webSocketEventsEmitter();
const webSocketEvents = new webSocketEventsEmitter();

/* -------------------------------------------------------------------------- */

// generic server
webSocketServerEvents.on('connection', (ws) => {
	console.info("webSocketServerEvents connection open");
	ws.send('wellcome');
});

// generic connection
webSocketEvents.on('message', function incoming(message, ws) {
	if (message.type !== 'utf8') {
		return;
	}
	let messageStr = message.utf8Data;
	console.log('webSocketEvents received: %s', messageStr);
	ws.send(`echo: ${messageStr}`);
});

// echo protocol
/*
webSocketEvents.on('message', function(message, connection) {
	if (message.type === 'utf8') {
		console.log('Received Message: ' + message.utf8Data);
		connection.sendUTF(message.utf8Data);
	}
	else if (message.type === 'binary') {
		console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
		connection.sendBytes(message.binaryData);
	}
});
*/


/* -------------------------------------------------------------------------- */

module.exports = (wsServer) => {
	wsServer.on('request', function(request) {
		console.log('Got WS request.');

		let originIsAllowed = (origin) => {
			// put logic here to detect whether the specified origin is allowed.
			console.log(`Got this origin: ${JSON.stringify(origin)}`);
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

		var connection = request.accept(null, request.origin);
		console.log('WS request: connection accepted.');

		// per connection config
		webSocketEvents.emit('connect', connection);
		connection.on('message', function(message) {
			webSocketEvents.emit('message', message, connection);
		});
		connection.on('close', function(reasonCode, description) {
			console.log(`Peer ${connection.remoteAddress} disconnected.`);
			webSocketEvents.emit('close', reasonCode, description, connection);
		});
	});
	wsServer.on('connect', function(webSocketConnection) {
		console.log('Got WS connect.');
		webSocketServerEvents.emit('connect', webSocketConnection);
	});

	return wsServer;
}
