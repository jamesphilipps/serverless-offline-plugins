"use strict";
exports.__esModule = true;
exports.getPluginConfiguration = void 0;
var constants_1 = require("./constants");
var getPluginConfiguration = function (serverless) { return serverless.service.custom[constants_1.SLS_CUSTOM_OPTION]; };
exports.getPluginConfiguration = getPluginConfiguration;
