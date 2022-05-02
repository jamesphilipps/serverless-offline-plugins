"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var mergeQueueDefinitions_1 = require("./mergeQueueDefinitions");
var logging_1 = require("../../logging");
var utils_1 = require("../utils");
var bindHandlersToQueues = function (config, resources, queues, functionsWithSqsEvents) {
    (0, logging_1.logDebug)("binding handlers to queues");
    var getSqsEvents = function (f) { return f.events.filter(function (e) { return e.type === 'SQS'; }); };
    var queueMap = Object.fromEntries(queues.flatMap(function (queue) {
        return __spreadArray([queue.name], queue.aliases, true).map(function (alias) { return [alias, queue]; });
    } //
    ));
    (0, logging_1.logDebug)("queueMap=".concat(JSON.stringify(queueMap)));
    var eventMappings = Object.entries(functionsWithSqsEvents)
        .map(function (_a) {
        var _ = _a[0], func = _a[1];
        return [func.functionName, getSqsEvents(func)];
    });
    // Create a new queue definition for each eventMapping, cloned from the active queue definition, then merge
    // the duplicate definitions together to combine the handlers
    return (0, mergeQueueDefinitions_1["default"])(eventMappings.flatMap(function (_a) {
        var functionName = _a[0], eventMappings = _a[1];
        return eventMappings.map(function (e) {
            var sourceEvent = e.sourceEvent;
            var arn = sourceEvent.sqs.arn;
            var arnStr = typeof arn === 'object' ? JSON.stringify(arn) : arn;
            var targetQueueName = (0, utils_1.getQueueNameFromArn)(config, resources)(sourceEvent.sqs.arn);
            var originalQueueDef = queueMap[targetQueueName];
            (0, logging_1.logDebug)("Bind queue (arn='".concat(arnStr, "', targetQueueName='").concat(targetQueueName, "', originalQueueDef=").concat(JSON.stringify(originalQueueDef)));
            if (originalQueueDef) {
                return __assign(__assign({}, originalQueueDef), { handlerFunctions: [functionName] });
            }
            else {
                // Warn the user or error if there isn't an active queue definition for this event binding
                var message = "No queue definition with arn: '".concat(arnStr, "' found, but it was referenced by an event mapping in function: '").concat(functionName, "'");
                if (config.sqs.errorOnMissingQueueDefinition)
                    throw Error(message);
                else
                    (0, logging_1.log)("".concat(logging_1.LOG_MARKER, " WARNING: ").concat(message));
                return undefined;
            }
        }).filter(function (v) { return !!v; });
    }));
};
exports["default"] = bindHandlersToQueues;
