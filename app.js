#!/usr/bin/env node

const http = require('http');
const websocket = require('websocket');
const express = require("express");

/* -------------------------------------------------------------------------- */

const webRoot = __dirname + '/public';
const webPort = 80;

/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */

const expressHandler = require('./src/expressHandler.js');
expressHandler(express, expressApp, {webRoot: webRoot});

/* -------------------------------------------------------------------------- */

const websocketHandler = require('./src/websocketHandler.js');
websocketHandler(wsServer);

/* -------------------------------------------------------------------------- */

httpServer.listen(webPort);
