const { createDefaultPreset } = require("ts-jest");

module.exports = {
	...createDefaultPreset(),
	testEnvironment: "node",
	setupFiles: ["<rootDir>/tests/setupEnv.js"],
};
