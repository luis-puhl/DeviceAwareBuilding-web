#!/usr/bin/env node

module.exports = (express, expressApp, config) => {
	expressApp.use(express.static(config.webRoot));
	expressApp.use(function (req, res, next) {
		console.log(`middleware: ${req.protocol} ${req.method} ${req.originalUrl}`);
		req.testing = 'testing';
		return next();
	});
	return expressApp;
}
