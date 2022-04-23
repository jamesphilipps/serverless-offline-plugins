"use strict";
exports.__esModule = true;
exports.getQueueDefinitionsFromResources = exports.getQueueNameFromArn = exports.getQueueNameFromArnParts = exports.getQueueNameFromArnString = void 0;
var constants_1 = require("../constants");
var utils_1 = require("../utils");
// TODO: test
var getQueueNameFromArnString = function (arn) { return (0, exports.getQueueNameFromArnParts)(arn.split(":")); };
exports.getQueueNameFromArnString = getQueueNameFromArnString;
var getQueueNameFromArnParts = function (parts) { return parts[5]; };
exports.getQueueNameFromArnParts = getQueueNameFromArnParts;
var getQueueNameFromArn = function (config, resources) { return function (arn) {
    return (0, utils_1.extractResourceNameFromArn)(exports.getQueueNameFromArnParts, function (key) { return (0, exports.getQueueDefinitionsFromResources)(resources)
        .filter(function (queue) { return queue.resourceKey === key; })
        .map(function (queue) { return queue.name; })
        .find(function (_) { return true; }); }, "custom.".concat(constants_1.SLS_CUSTOM_OPTION, ".sqs.queueNames"), function (key) { var _a, _b; return (_b = (_a = config.sqs) === null || _a === void 0 ? void 0 : _a.queueNames) === null || _b === void 0 ? void 0 : _b[key]; })(arn);
}; };
exports.getQueueNameFromArn = getQueueNameFromArn;
var getQueueDefinitionsFromResources = function (resources) {
    if (!resources) {
        return [];
    }
    return Object.entries(resources)
        .filter(function (_a) {
        var _ = _a[0], v = _a[1];
        return (v === null || v === void 0 ? void 0 : v.Type) === 'AWS::SQS::Queue';
    })
        .map(function (_a) {
        var _b, _c, _d, _e;
        var resourceKey = _a[0], v = _a[1];
        return ({
            resourceKey: resourceKey,
            name: (_b = v === null || v === void 0 ? void 0 : v.Properties) === null || _b === void 0 ? void 0 : _b.QueueName,
            fifo: (_c = v === null || v === void 0 ? void 0 : v.Properties) === null || _c === void 0 ? void 0 : _c.FifoQueue,
            visibilityTimeout: (_d = v === null || v === void 0 ? void 0 : v.Properties) === null || _d === void 0 ? void 0 : _d.VisibilityTimeout,
            delaySeconds: (_e = v === null || v === void 0 ? void 0 : v.Properties) === null || _e === void 0 ? void 0 : _e.DelaySeconds,
            handlerFunctions: []
        });
    });
};
exports.getQueueDefinitionsFromResources = getQueueDefinitionsFromResources;
