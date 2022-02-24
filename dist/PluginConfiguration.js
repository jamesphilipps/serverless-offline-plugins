"use strict";
exports.__esModule = true;
exports.getDefaultPluginConfiguration = void 0;
var constants_1 = require("./constants");
var getDefaultPluginConfiguration = function () { return ({
    dynamodb: {
        enabled: false
    },
    sqs: {
        enabled: false,
        createQueuesFromResources: true,
        removeExistingQueuesOnStart: true,
        purgeExistingQueuesOnStart: false,
        pollInterval: constants_1.DEFAULT_SQS_POLL_INTERVAL_MS,
        queueNames: {},
        additionalQueues: []
    }
}); };
exports.getDefaultPluginConfiguration = getDefaultPluginConfiguration;
