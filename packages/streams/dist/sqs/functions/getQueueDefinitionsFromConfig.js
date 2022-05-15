"use strict";
exports.__esModule = true;
var mergeQueueDefinitions_1 = require("./mergeQueueDefinitions");
var getQueueDefinitionsFromConfig = function (config) {
    var _a;
    var configQueues = ((_a = config.sqs) === null || _a === void 0 ? void 0 : _a.queues) || [];
    return (0, mergeQueueDefinitions_1["default"])(configQueues.map(function (v) {
        var name = v.name, aliases = v.aliases, visibilityTimeout = v.visibilityTimeout, delaySeconds = v.delaySeconds;
        return {
            name: name,
            aliases: aliases || [],
            visibilityTimeout: visibilityTimeout,
            delaySeconds: delaySeconds,
            fifo: name.endsWith(".fifo"),
            handlerFunctions: []
        };
    }));
};
exports["default"] = getQueueDefinitionsFromConfig;
