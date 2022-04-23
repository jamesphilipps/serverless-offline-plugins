"use strict";
exports.__esModule = true;
var mergeQueueDefinitions_1 = require("./mergeQueueDefinitions");
var getAdditionalQueueDefinitions = function (config) {
    var _a;
    var toQueueDef = function (v) {
        var name = v.name, visibilityTimeout = v.visibilityTimeout, delaySeconds = v.delaySeconds;
        return ({
            name: name,
            visibilityTimeout: visibilityTimeout,
            delaySeconds: delaySeconds,
            fifo: name.endsWith(".fifo"),
            handlerFunctions: []
        });
    };
    var additionalQueues = ((_a = config.sqs) === null || _a === void 0 ? void 0 : _a.additionalQueues) || [];
    return (0, mergeQueueDefinitions_1["default"])(additionalQueues.map(toQueueDef));
};
exports["default"] = getAdditionalQueueDefinitions;
