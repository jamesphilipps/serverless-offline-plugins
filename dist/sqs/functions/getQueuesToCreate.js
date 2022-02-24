"use strict";
exports.__esModule = true;
var mergeQueueDefinitions_1 = require("./mergeQueueDefinitions");
var getQueuesToCreate = function (config) { return function (resourceQueueDefinitions, functionQueueDefinitions, additionalQueueDefinitions) {
    var alwaysCreatedDefinitions = functionQueueDefinitions.concat(additionalQueueDefinitions);
    var definitionsToCreate = config.sqs.createQueuesFromResources ?
        alwaysCreatedDefinitions.concat(resourceQueueDefinitions) :
        alwaysCreatedDefinitions;
    // Merge duplicates
    return (0, mergeQueueDefinitions_1["default"])(definitionsToCreate);
}; };
exports["default"] = getQueuesToCreate;
