"use strict";
exports.__esModule = true;
//TODO: test
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
            aliases: [],
            fifo: (_c = v === null || v === void 0 ? void 0 : v.Properties) === null || _c === void 0 ? void 0 : _c.FifoQueue,
            visibilityTimeout: (_d = v === null || v === void 0 ? void 0 : v.Properties) === null || _d === void 0 ? void 0 : _d.VisibilityTimeout,
            delaySeconds: (_e = v === null || v === void 0 ? void 0 : v.Properties) === null || _e === void 0 ? void 0 : _e.DelaySeconds,
            handlerFunctions: []
        });
    });
};
exports["default"] = getQueueDefinitionsFromResources;
