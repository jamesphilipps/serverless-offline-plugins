"use strict";
exports.__esModule = true;
exports.validateConfig = exports.getDefaultPluginConfiguration = void 0;
var getDefaultPluginConfiguration = function () { return ({
    dynamodb: {
        enabled: false
    },
    sqs: {
        enabled: false,
        createQueuesFromResources: true,
        removeExistingQueuesOnStart: true,
        purgeExistingQueuesOnStart: false,
        errorOnMissingQueueDefinition: true,
        queues: [],
        pollConfig: {
            strategy: 'backoff',
            drainQueues: false,
            messageBatchSize: 10,
            backoffType: 'double',
            minIntervalMs: 100,
            maxIntervalMs: 5000
        }
    }
}); };
exports.getDefaultPluginConfiguration = getDefaultPluginConfiguration;
var validateConfig = function (config) {
    var pollConfig = config.sqs.pollConfig;
    if (!new Set(['fixed-inteval', 'backoff']).has(pollConfig.strategy)) {
        throw Error("Unknown polling strategy: '".concat(pollConfig.strategy));
    }
    if (!new Set(['double', 'step']).has(pollConfig.backoffType)) {
        throw Error("Unknown polling backoffType: '".concat(pollConfig.backoffType));
    }
    return config;
};
exports.validateConfig = validateConfig;
