
const expressApp = require('./src/expressApp.js');

const webSocketBuilder = require('./src/webSocketBuilder.js');
let webSocketServer = webSocketBuilder.webSocketBuilder(expressApp.httpServer);

const config = require('./.config');
let mqttBuilder = require('./src/mqttBuilder.js');
let mqttClient = mqttBuilder.mqttBuilder(config, webSocketServer.sharedWS);
