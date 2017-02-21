const mqtt = require('mqtt');
const config = require('./.config');

let clientMqtt	= mqtt.connect(`mqtt://${config.mqttHost}:${config.mqttPort}`, {
	username	: config.mqttUser,
	password	: config.mqttPwd,
})
clientMqtt.on('error', function (err) {
	console.error('[MQTT error]');
	console.error(err);
})
clientMqtt.on('connect', function () {
	console.log('MQTT connect');
	clientMqtt.subscribe('dab/#');
})
clientMqtt.on('message', function (topic, message) {
	// message is Buffer
	let topicStr = topic.toString();
	let messageStr = message.toString();

	if (!sharedWS){
		return;
	}
	sharedWS.send( JSON.stringify({
		mqtt: {
			topic: topicStr,
			message: messageStr,
		},
	}) );
});

console.log("mqtt client created");

/* ------------------------------------------------------------------------ */

const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 80});

let sharedWS = false;

wss.on('connection', function connection(ws) {
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
