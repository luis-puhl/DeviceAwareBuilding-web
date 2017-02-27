#!/usr/bin/env node

const mqtt = require('mqtt');

/* -------------------------------------------------------------------------- */

module.exports = (config) => {
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
		console.log(`MQTT message: [${topicStr}] ${messageStr}`);
	});
	clientMqtt.on('send', function (topic, message) {
		console.log(`MQTT send to ${topic}: ${message}`);
		clientMqtt.publish(topic, message);
	});

	console.log("mqtt client created");
	return clientMqtt;
}
