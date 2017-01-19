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
	clientMqtt.subscribe('ADMIN');
	clientMqtt.subscribe('devices');
})
clientMqtt.on('message', function (topic, message) {
	// message is Buffer
	console.log(message.toString());
	switch (topic.toString()){
		case 'devices/report':
			// retrieve sensor report
			break;
		case 'ADMIN':
			switch (message.toString()) {
				case 'echo':
					clientMqtt.publish(topic, 'ack');
					break;
				default:
			}
			break;
		default:
	}
})
