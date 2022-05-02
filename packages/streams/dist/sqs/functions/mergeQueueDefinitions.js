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
var utils_1 = require("../../utils");
var mergeQueueDefinitions = function (queueDefinitions) {
    var mergeDistinct = function (v1, v2) { return Array.from(new Set(v1.concat(v2))); };
    var applyMerge = function (acc, v) {
        var _a;
        var k = v.name;
        return __assign(__assign({}, acc), (_a = {}, _a[k] = acc[k] ? __assign(__assign({}, acc[k]), { handlerFunctions: mergeDistinct(acc[k].handlerFunctions, v.handlerFunctions), aliases: mergeDistinct(acc[k].aliases, v.aliases) }) :
            v, _a));
    };
    return (0, utils_1.keyMerge)(function (q) { return q.name; }, applyMerge)(queueDefinitions);
};
exports["default"] = mergeQueueDefinitions;
