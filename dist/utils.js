"use strict";
exports.__esModule = true;
exports.keyMerge = exports.extractResourceNameFromArn = exports.getHandlersAsLambdaFunctionDefinitions = exports.getPluginConfiguration = void 0;
var constants_1 = require("./constants");
var logging_1 = require("./logging");
var getPluginConfiguration = function (serverless) { return serverless.service.custom[constants_1.SLS_CUSTOM_OPTION]; };
exports.getPluginConfiguration = getPluginConfiguration;
var getHandlersAsLambdaFunctionDefinitions = function (serverless) {
    var toFunctionDef = function (functionKey) { return ({
        functionKey: functionKey,
        functionDefinition: service.getFunction(functionKey)
    }); };
    var service = serverless.service;
    return service.getAllFunctions()
        .map(toFunctionDef);
};
exports.getHandlersAsLambdaFunctionDefinitions = getHandlersAsLambdaFunctionDefinitions;
var extractResourceNameFromArn = function (arnExtract, getNameFromResources, resourceNameMappingPath, getNameFromMappings) { return function (arn) {
    var getNameFromResourcesOrError = function (resourceName) {
        if (!resourceName)
            throw Error("No resource defined with key: '".concat(arn[0], "'. Add a resource with this key'"));
        return resourceName;
    };
    var getNameFromMappingsOrError = function (resourceName) {
        if (!resourceName)
            throw Error("No resource name mapping for arn: '".concat(arnStr, "'. Add a mapping at '").concat(resourceNameMappingPath, "'"));
        return resourceName;
    };
    var arnStr = typeof arn == 'string' ? arn : JSON.stringify(arn);
    (0, logging_1.logDebug)("extractResourceNameFromArn: '".concat(arnStr, "'"));
    if (typeof arn === 'string') {
        if (arn.startsWith("arn:")) {
            // AWS Arn. Parse the resource name from the string
            return arnExtract(arn.split(":"));
        }
        else {
            // Probably an output reference. Use directly as a key to the defined mappings
            return getNameFromMappingsOrError(getNameFromMappings(arn));
        }
    }
    else if (Array.isArray(arn)) {
        if (arn.length === 2) {
            // An attribute reference to a resource defined within the stack. Check the defined resources
            var resourceName = getNameFromResources(arn[0]);
            return getNameFromResourcesOrError(resourceName);
        }
    }
    else if (typeof arn === 'object') {
        // A function reference. Use the value as a key to the defined mappings
        var keys = Object.keys(arn);
        if (keys.length === 1 && keys[0].trim() === "Fn::ImportValue") {
            return getNameFromMappingsOrError(getNameFromMappings(arn[keys[0]]));
        }
    }
    throw Error("Cannot resolve arn: '".concat(arnStr, "' to a resource name"));
}; };
exports.extractResourceNameFromArn = extractResourceNameFromArn;
// TODO: test
var keyMerge = function (getKey, merge) { return function (data) {
    return Object.entries(data
        .map(function (v) { return Object.fromEntries([[getKey(v), v]]); })
        .reduce(function (acc, entry) {
        var v = Object.entries(entry)[0][1];
        return merge(acc, v);
    }, {})).map(function (entry) { return entry[1]; });
}; };
exports.keyMerge = keyMerge;
