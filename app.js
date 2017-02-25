#!/usr/bin/env node

const http = require('http');
const websocket = require('websocket');
const express = require('express');
const EventEmitter = require('events');

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

/* -------------------------------------------------------------------------- */

class webSocketsMqttEventsEmitter extends EventEmitter {
	constructor(mqttClient, webSocketsServer){
		super();
		this.on('mqtt-send', (message) =>{
			// do send by MQTT
		});
		this.on('mqtt-recieved', (message) =>{
			// do logic
			// do send to WS
		});
		this.on('ws-send', (message) =>{
			// do send by WS
		});
		this.on('ws-recieved', (message) =>{
			// do logic
			// do send to MQTT
		});
		webSocketsServer.emit('broadcast', 'mqtt-ws on the floor');
	}
}

/* -------------------------------------------------------------------------- */

const config = require('./.config');
const mqttHandler = require('./src/mqttHandler.js');
clientMqtt = mqttHandler(config);

const webSocketsMqttEvents = new webSocketsMqttEventsEmitter(clientMqtt, wsServer);
