"use strict";
exports.__esModule = true;
exports.mapBy = exports.keyMerge = exports.extractResourceNameFromArn = exports.getHandlersAsLambdaFunctionDefinitions = exports.getPluginConfiguration = void 0;
var constants_1 = require("./constants");
var getPluginConfiguration = function (serverless) { return serverless.service.custom[constants_1.SLS_CUSTOM_OPTION]; };
exports.getPluginConfiguration = getPluginConfiguration;
var getHandlersAsLambdaFunctionDefinitions = function (serverless) {
    var service = serverless.service;
    return service.getAllFunctions()
        .map(function (functionKey) { return ({
        functionKey: functionKey,
        functionDefinition: service.getFunction(functionKey)
    }); });
};
exports.getHandlersAsLambdaFunctionDefinitions = getHandlersAsLambdaFunctionDefinitions;
var extractResourceNameFromArn = function (arnExtract, getNameFromResources) { return function (arn) {
    var getNameFromResourcesOrError = function (resourceName) {
        if (!resourceName)
            throw Error("No resource defined with key: '".concat(arn[0], "'. Add a resource with this key'"));
        return resourceName;
    };
    var arnStr = typeof arn == 'string' ? arn : JSON.stringify(arn);
    if (typeof arn === 'string') {
        // If arn starts with arn: then this is an AWS Arn and can be parsed. Otherwise, it is probably an output
        // reference and can be used directly
        return arn.startsWith("arn:") ? arnExtract(arn.split(":")) : arn;
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
        if (keys.length === 1) {
            var key = keys[0].trim();
            switch (key) {
                case "Fn::GetAtt":
                    var getAttResourceName = getNameFromResources(arn[key][0]);
                    return getNameFromResourcesOrError(getAttResourceName);
                case "Ref":
                    var refResourceName = getNameFromResources(arn[key]);
                    return getNameFromResourcesOrError(refResourceName);
                case "Fn::ImportValue":
                    return arn[key];
            }
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
// TODO: test
var mapBy = function (vals, keyFunc) { return Object.fromEntries(vals.map(function (v) { return [keyFunc(v), v]; })); };
exports.mapBy = mapBy;
