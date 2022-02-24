"use strict";
exports.__esModule = true;
exports.getTableName = exports.getFunctionsWithStreamEvents = void 0;
var logging_1 = require("./logging");
var getFunctionsWithStreamEvents = function (getFunction) { return function (functions) { return functions
    .map(function (functionKey) {
    var functionDefinition = getFunction(functionKey);
    console.log("FUNCDEF", JSON.stringify(functionDefinition));
    return { functionKey: functionKey, functionDefinition: functionDefinition, events: getStreamEvents(functionDefinition) };
})
    .filter(function (_a) {
    var events = _a.events;
    return events.length > 0;
}); }; };
exports.getFunctionsWithStreamEvents = getFunctionsWithStreamEvents;
var getStreamEvents = function (functionDef) { return functionDef.events
    .filter(function (event) { var _a; return ((_a = event === null || event === void 0 ? void 0 : event.stream) === null || _a === void 0 ? void 0 : _a.type) === 'dynamodb'; })
    .map(function (event) { return event; }); };
var getTableName = function (resources) { return function (resourceKey) {
    var _a, _b;
    (0, logging_1.log)(JSON.stringify(resources));
    var tableName = (_b = (_a = resources[resourceKey]) === null || _a === void 0 ? void 0 : _a.Properties) === null || _b === void 0 ? void 0 : _b.TableName;
    if (!tableName)
        throw Error("Could not find table name at '".concat(resourceKey, ".Properties.TableName'"));
    return tableName;
}; };
exports.getTableName = getTableName;
