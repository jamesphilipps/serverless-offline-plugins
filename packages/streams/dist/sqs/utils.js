"use strict";
exports.__esModule = true;
exports.getQueueNameFromArn = exports.getQueueNameFromArnParts = exports.getQueueNameFromArnString = void 0;
var utils_1 = require("../utils");
var getDefinedQueues_1 = require("./functions/getDefinedQueues");
// TODO: test
var getQueueNameFromArnString = function (arn) { return (0, exports.getQueueNameFromArnParts)(arn.split(":")); };
exports.getQueueNameFromArnString = getQueueNameFromArnString;
var getQueueNameFromArnParts = function (parts) { return parts[5]; };
exports.getQueueNameFromArnParts = getQueueNameFromArnParts;
var getQueueNameFromArn = function (resources) { return function (arn) {
    return (0, utils_1.extractResourceNameFromArn)(exports.getQueueNameFromArnParts, function (key) { return (0, getDefinedQueues_1.getQueueDefinitionsFromResources)(resources)
        .filter(function (queue) { return queue.resourceKey === key; })
        .map(function (queue) { return queue.name; })
        .find(function (_) { return true; }); })(arn);
}; };
exports.getQueueNameFromArn = getQueueNameFromArn;
