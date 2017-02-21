
const WebSocket = require('ws');
let webSocketServer = false;
let sharedWS = false;

function webSocketBuilder(httpServer) {
	webSocketServer = new WebSocket.Server({server: httpServer});

	webSocketServer.on('connection', function connection(ws) {
		console.info("websocket connection open");
		ws.send('wellcome');
		sharedWS = ws;

		ws.on('message', function incoming(message) {
			console.log('received: %s', message);
			ws.send(`echo: ${message}`);
		});

		ws.on("close", function () {
			sharedWS = false;
			console.log("websocket connection close");
		});
	});

	console.log("websocket server created");
	return {
		webSocketServer: webSocketServer,
		sharedWS: sharedWS,
	}
}

module.exports = {
	webSocketBuilder: webSocketBuilder,
};
