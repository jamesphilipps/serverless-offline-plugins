"use strict";
exports.__esModule = true;
var utils_1 = require("../utils");
var mergeQueueDefinitions_1 = require("./mergeQueueDefinitions");
var getFunctionQueueDefinitions = function (config, resources) {
    return function (functionsWithSqsEvents) {
        var getSqsEvents = function (f) { return f.events.filter(function (e) { return e.type === 'SQS'; }); };
        var toQueueDef = function (f, e) {
            var sourceEvent = e.sourceEvent;
            var queueName = (0, utils_1.getQueueNameFromArn)(config, resources)(sourceEvent.sqs.arn);
            return ({
                name: queueName,
                aliases: [],
                fifo: queueName.endsWith(".fifo"),
                handlerFunctions: [f.functionName]
            });
        };
        return (0, mergeQueueDefinitions_1["default"])(Object.entries(functionsWithSqsEvents)
            .flatMap(function (_a) {
            var _ = _a[0], func = _a[1];
            return getSqsEvents(func)
                .map(function (e) { return toQueueDef(func, e); });
        }));
    };
};
exports["default"] = getFunctionQueueDefinitions;
