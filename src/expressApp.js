
const http = require("http");
const express = require("express");

const httpPort = 80;

let expressApp = express();
expressApp.use(express.static(__dirname + '/public'));
// expressApp.listen(httpPort);

// console.log("expressApp listening on %d ", httpPort);

let httpServer;
try {
	httpServer = http.createServer(expressApp);
	httpServer.on('error', (e) => {
		console.error("httpServer FAIL to listening on %d", httpPort);
		console.error(e);
		process.exit();
	});
	httpServer.listen(httpPort);
} catch (e) {
	console.error("httpServer FAIL to listening on %d", httpPort);
	console.error(e);
	process.exit();
}
console.log("httpServer listening on %d", httpPort);


module.exports = {
	httpPort: httpPort,
	expressApp: expressApp,
	httpServer: httpServer,
};
