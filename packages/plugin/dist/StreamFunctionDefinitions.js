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
exports.__esModule = true;
exports.getFunctionDefinitionsWithStreamsEvents = void 0;
var getFunctionDefinitionsWithStreamsEvents = function (serverless, type) {
    var service = serverless.service;
    var rawFunctionsConfig = serverless.configurationInput.functions;
    var zipWithIndex = function (v, i) { return [v, i]; };
    var parseFilterPatterns = function (functionName, eventIndex) {
        var _a, _b, _c;
        return (_c = (_b = (_a = rawFunctionsConfig[functionName]) === null || _a === void 0 ? void 0 : _a.events[eventIndex]) === null || _b === void 0 ? void 0 : _b.stream) === null || _c === void 0 ? void 0 : _c.filterPatterns;
    };
    var isValidStreamsEvent = function (event) {
        var _a;
        return (!type && event.sqs || event.stream) ||
            (type === 'DYNAMO' && ((_a = event === null || event === void 0 ? void 0 : event.stream) === null || _a === void 0 ? void 0 : _a.type) === 'dynamodb') ||
            (type === 'SQS' && (event === null || event === void 0 ? void 0 : event.sqs));
    };
    var toSqsStreamsEventMapping = function (event) { return ({
        type: 'SQS',
        sourceEvent: event
    }); };
    var toDynamoStreamsEventMapping = function (functionName, event, eventIndex) { return ({
        type: 'DYNAMO',
        sourceEvent: __assign(__assign({}, event), { stream: __assign(__assign({}, event.stream), { filterPatterns: event.filterPatterns ? parseFilterPatterns(functionName, eventIndex) : undefined }) })
    }); };
    var toStreamsEventMapping = function (functionName, event, eventIndex) {
        if (event.sqs)
            return toSqsStreamsEventMapping(event);
        if (event.stream)
            return toDynamoStreamsEventMapping(functionName, event, eventIndex);
        throw Error("Unable to parse streams event mapping");
    };
    var parseFunctionWithStreamsEvents = function (functionName) {
        var functionDef = service.getFunction(functionName);
        return __assign(__assign({ functionName: functionName }, functionDef), { events: functionDef.events
                .map(zipWithIndex)
                .filter(function (_a) {
                var e = _a[0];
                return isValidStreamsEvent(e);
            })
                .map(function (_a) {
                var e = _a[0], i = _a[1];
                return toStreamsEventMapping(functionName, e, i);
            }) });
    };
    var hasStreamsEvents = function (functionDef) { return functionDef.events.length > 0; };
    var zipWithName = function (functionDef) { return [functionDef.functionName, functionDef]; };
    return Object.fromEntries(service.getAllFunctions()
        .map(parseFunctionWithStreamsEvents)
        .filter(hasStreamsEvents)
        .map(zipWithName));
};
exports.getFunctionDefinitionsWithStreamsEvents = getFunctionDefinitionsWithStreamsEvents;
