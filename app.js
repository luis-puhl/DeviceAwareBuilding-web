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
		this.mqttClient = mqttClient;
		this.webSocketsServer = webSocketsServer;

		this.mqttClient.on('message', (topic, message) => {
			this.emit('mqtt-recieved', topic, message);
		});
		this.webSocketsServer.on('ws-recieved', (connecntion, message) => {
			this.emit('ws-recieved', message);
		});

		this.on('mqtt-send', (topic, message) =>{
			// do send by MQTT
			this.mqttClient.emit('send', topic, message);
		});
		this.on('mqtt-recieved', (topic, message) =>{
			// do logic

			// message is Buffer
			let topicStr = topic.toString();
			let messageStr = message.toString();

			// do send to WS
			this.emit('ws-send', JSON.stringify({
				mqtt: {
					topic: topicStr,
					message: messageStr,
				},
			}) );
		});
		this.on('ws-send', (message) =>{
			// do send by WS
			this.webSocketsServer.emit('broadcast', message);
		});
		this.on('ws-recieved', (message) => {
			// do logic
			console.log(`ws-recieved: ${message}`)
			let packet;
			try {
				packet = JSON.parse(message.toString());
				console.log(`ws-recieved JSON`);
			} catch (e) {
				console.log(`mqtt-ws cant parse ws message: ${e}`);
				return;
			}

			// do send to MQTT
			console.log(`ws-recieved TO mqtt-send`);
			this.emit('mqtt-send', packet.mqtt.topic, packet.mqtt.message);
		});
	}
}

/* -------------------------------------------------------------------------- */

const config = require('./.config');
const mqttHandler = require('./src/mqttHandler.js');
clientMqtt = mqttHandler(config);

const webSocketsMqttEvents = new webSocketsMqttEventsEmitter(clientMqtt, wsServer);
