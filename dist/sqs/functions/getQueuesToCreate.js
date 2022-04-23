"use strict";
exports.__esModule = true;
var mergeQueueDefinitions_1 = require("./mergeQueueDefinitions");
var getQueuesToCreate = function (config) {
    return function (resourceQueueDefinitions, configQueueDefinitions) {
        var createdConfigDefinitions = configQueueDefinitions.filter(function (queue) { return queue.create !== false; });
        var definitionsToCreate = config.sqs.createQueuesFromResources ?
            createdConfigDefinitions.concat(resourceQueueDefinitions) :
            createdConfigDefinitions;
        // Merge duplicates
        return (0, mergeQueueDefinitions_1["default"])(definitionsToCreate);
    };
};
exports["default"] = getQueuesToCreate;
