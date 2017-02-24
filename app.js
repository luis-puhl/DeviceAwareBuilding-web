const http = require('http');

const webroot = './public';
const webport = 80;

const child_process = require('child_process');
let httpServerChild = child_process.exec(`http-server ${webroot} -p ${webport} -s`);
httpServerChild.on('error', (err) => {
	console.error(`httpServerChild ERROR: ${err}`);
});
httpServerChild.on('close', (code) => {
	console.log(`child process exited with code ${code}`);
});
httpServerChild.stdout.setEncoding('utf8');
httpServerChild.stderr.on('data', (data) => {
	/* for future use */
	console.error(`stderr: ${data}`);
});
httpServerChild.stdout.on('data', (data) => {
	/* for future use */
	console.log(`http-server: ${data}`);
});


/* ----------------------------------------------------------------------	 */
let WebSocketServer = require('websocket').server;

const alteranteHTTPport = 8080;

let server = http.createServer(function(req, res){
	// your normal server code
	console.log(`${new Date()} Received request for ${req.url}`);
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end('<h1>Hello world from socket.io</h1>');
});
server.listen(alteranteHTTPport, function() {
	console.log(`${new Date()} Server is listening on port ${alteranteHTTPport}`);
});

let wsServer = new WebSocketServer({
	httpServer: server,
	// You should not use autoAcceptConnections for production
	// applications, as it defeats all standard cross-origin protection
	// facilities built into the protocol and the browser.	You should
	// *always* verify the connection's origin and decide whether or not
	// to accept it.
	autoAcceptConnections: false
});

function originIsAllowed(origin) {
	// put logic here to detect whether the specified origin is allowed.
	return true;
}

function protocolIsAllowed(protocols) {
	console.log(`Got those protocols: ${JSON.stringify(protocols)}`);
	return true;
}

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
