"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
exports.__esModule = true;
exports.logDebug = exports.LOG_MARKER = exports.setLog = exports.log = void 0;
var serverlessLog_1 = require("serverless-offline/dist/serverlessLog");
__createBinding(exports, serverlessLog_1, "default", "log");
__createBinding(exports, serverlessLog_1, "setLog");
exports.LOG_MARKER = '[sls-offline-streams]';
exports.logDebug = process.env.SLS_DEBUG !== undefined || process.env.SLS_STREAMS_DEBUG !== undefined ?
    console.log.bind(null, exports.LOG_MARKER) :
    function () { return null; };
