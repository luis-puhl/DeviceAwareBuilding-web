#!/usr/bin/env node
/**
 * Some random example found in:
 * http://stackoverflow.com/questions/16392260/which-websocket-library-to-use-with-node-js
**/

var WebSocketServer = require("ws").Server;
var http = require("http");
var express = require("express");

const serverPort = 80;
const expressPort = 9000;

/* -------------------------------------------------------------------------- */

var app = express();
app.use(express.static(__dirname+ "/../"));
app.get('/someGetRequest', function(req, res, next) {
   console.log('receiving get request');
   res.end();
});
app.post('/somePostRequest', function(req, res, next) {
   console.log('receiving post request');
   res.end();
});
app.listen(expressPort); //port 80 need to run as root

console.log("app listening on %d ", expressPort);

/* -------------------------------------------------------------------------- */

var server = http.createServer(app);
server.listen(serverPort);

console.log("http server listening on %d", serverPort);

/* -------------------------------------------------------------------------- */

var userId;
var wss = new WebSocketServer({server: server});
wss.on("connection", function (ws) {
	console.info("websocket connection open");

	var timestamp = new Date().getTime();
	userId = timestamp;

	ws.send(JSON.stringify({
		msgType:"onOpenConnection",
		msg:{
			connectionId:timestamp
		},
	}));


	ws.on("message", function (data, flags) {
		console.log("websocket received a message");

		ws.send(JSON.stringify({
			msg: {
				connectionId:userId
			},
			data: data,
			flags: flags,
		}));
	});

	ws.on("close", function () {
		console.log("websocket connection close");
	});
});
console.log("websocket server created");
