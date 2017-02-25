#!/usr/bin/env node

const EventEmitter = require('events');

/* -------------------------------------------------------------------------- */

module.exports = (wsServer) => {
	let connections = [];
	let getStableConnections = () => {
		connections = connections.reduce( (stableConnections, connection) => {
			if (!connection.connected){
				return;
			}
			stableConnections.push(connection);
		}, []);
		return connections;
	}

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

		// Connection events
		webSocketConnection.on('message', (message) => {
			if (message.type !== 'utf8') {
				return;
			}
			let messageStr = message.utf8Data;
			console.log('webSocketEvents received: %s', messageStr);
			/** echo protocol
			webSoketsConnection.send(`echo: ${messageStr}`);
			// */
			// /** echo broadcast protocol
			wsServer.emit('broadcast', 'ws on the floor echo: ${messageStr}');
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
		this.on('send', (message) => {
			this.webSoketsConnection.send(message);
		});
	});
	wsServer.on('close', (webSocketConnection, closeReason, description) => {
		console.log(`WS Connection terminated with '${description}'`);
		connections = getStableConnections();
	});
	// extra server events
	wsServer.on('broadcast', (message) => {
		console.info("Broadcasting");
		let msgCount = getStableConnections().reduce( (msgCount, connection) => {
			if (!connection.connected){
				return;
			}
			connection.emit('send', message);
			msgCount++;
		}, 0);
		console.info(`Broadcasted to ${msgCount} connections`);
	});

	return {
		wsServer: wsServer,
		get wsConnections() { return getStableConnections() },
	};
}
