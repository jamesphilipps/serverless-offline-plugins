"use strict";
exports.__esModule = true;
exports.getQueueDefinitionsFromResources = void 0;
var mergeQueueDefinitions_1 = require("./mergeQueueDefinitions");
//TODO: test
var getQueueDefinitionsFromConfig = function (config) {
    var configQueues = config.queues || [];
    return configQueues.map(function (queue) { return ({
        aliases: queue.aliases || [],
        delaySeconds: queue.delaySeconds,
        fifo: queue.name.trim().toLowerCase().endsWith(".fifo"),
        handlerFunctions: [],
        name: queue.name,
        queueUrl: queue.queueUrl,
        source: 'CONFIG',
        targetType: queue.queueUrl ? 'REMOTE' : 'LOCAL',
        visibilityTimeout: queue.visibilityTimeout
    }); });
};
var getQueueDefinitionsFromResources = function (resources) {
    if (!resources)
        return [];
    return Object.entries(resources)
        .filter(function (_a) {
        var _ = _a[0], v = _a[1];
        return (v === null || v === void 0 ? void 0 : v.Type) === 'AWS::SQS::Queue';
    })
        .map(function (_a) {
        var _b, _c, _d, _e;
        var resourceKey = _a[0], v = _a[1];
        return ({
            aliases: [],
            delaySeconds: (_b = v === null || v === void 0 ? void 0 : v.Properties) === null || _b === void 0 ? void 0 : _b.DelaySeconds,
            fifo: (_c = v === null || v === void 0 ? void 0 : v.Properties) === null || _c === void 0 ? void 0 : _c.FifoQueue,
            handlerFunctions: [],
            name: (_d = v === null || v === void 0 ? void 0 : v.Properties) === null || _d === void 0 ? void 0 : _d.QueueName,
            resourceKey: resourceKey,
            source: 'RESOURCES',
            targetType: 'LOCAL',
            visibilityTimeout: (_e = v === null || v === void 0 ? void 0 : v.Properties) === null || _e === void 0 ? void 0 : _e.VisibilityTimeout
        });
    });
};
exports.getQueueDefinitionsFromResources = getQueueDefinitionsFromResources;
var getDefinedQueues = function (config, resources) {
    var configQueues = getQueueDefinitionsFromConfig(config);
    var resourcesQueues = (0, exports.getQueueDefinitionsFromResources)(resources);
    var allQueues = configQueues.concat(resourcesQueues);
    return (0, mergeQueueDefinitions_1["default"])(allQueues);
};
exports["default"] = getDefinedQueues;
