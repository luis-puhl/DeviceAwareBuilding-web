#!/usr/bin/env node

const EventEmitter = require('events');

/* -------------------------------------------------------------------------- */

class Connections extends Array {
	get stableConnections () {
		let conn = this.reduce( (stableConnections, connection) => {
			if (connection.connected){
				stableConnections.push(connection);
			}
			return stableConnections;
		}, new Connections());
		console.log(`got ${this.length} connectons, ${conn.length} are stable`);
		return conn;
	}
}

/* -------------------------------------------------------------------------- */

module.exports = (wsServer) => {
	let connections = new Connections();

	// server events
	wsServer.on('request', (request) => {
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

		let connection = request.accept(null, request.origin);
		console.log('WS request: connection accepted.');
		return;
	});
	wsServer.on('connect', function(webSocketConnection) {
		console.log('Got WS connect.');
		connections.push(webSocketConnection);
		// Connection events
		webSocketConnection.on('message', (message) => {
			if (message.type !== 'utf8') {
				return;
			}
			let messageStr = message.utf8Data;
			console.log(`webSocketEvents received: ${messageStr}`);
			wsServer.emit('ws-recieved', webSocketConnection, messageStr);
			/** echo protocol
			webSoketsConnection.send(`echo: ${messageStr}`);
			// */
			// /** echo broadcast protocol
			wsServer.emit('broadcast', `ws-echo: ${messageStr}`);
			// */
		});
		webSocketConnection.on('frame', (webSocketFrame) => {
			// not handled by now
		});
		webSocketConnection.on('close', (reasonCode, description) => {
			// will be handled by server events
		});
		webSocketConnection.on('error', (error) => {
			console.error(`WS Connection error: ${error}`);
		});
		webSocketConnection.on('ping', (cancel, data) => {
			// not handled by now
		});
		webSocketConnection.on('pong', (data) => {
			// not handled by now
		});
		// Connection Extra events
		webSocketConnection.on('send', (message) => {
			console.log(`WS send: ${message}`)
			webSocketConnection.send(message);
		});
	});
	wsServer.on('close', (webSocketConnection, closeReason, description) => {
		console.log(`WS Connection terminated with '${description}'`);
	});
	// extra server events
	wsServer.on('broadcast', (message) => {
		console.info("Broadcasting");
		let msgCount = connections.stableConnections.reduce( (msgCount, connection) => {
			connection.emit('send', message);
			return ++msgCount;
		}, 0);
		console.info(`Broadcasted to ${msgCount} connections`);
	});

	return {
		wsServer: wsServer,
		connections: connections,
	};
}
