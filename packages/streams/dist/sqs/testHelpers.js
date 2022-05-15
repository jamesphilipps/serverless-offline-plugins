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
exports.existingQueue = exports.createQueueArn = exports.createQueueUrl = exports.activeQueueDef = exports.queueDef = void 0;
var queueDef = function (_a) {
    var _b = _a.aliases, aliases = _b === void 0 ? [] : _b, _c = _a.create, create = _c === void 0 ? true : _c, delaySeconds = _a.delaySeconds, _d = _a.fifo, fifo = _d === void 0 ? false : _d, _e = _a.handlerFunctions, handlerFunctions = _e === void 0 ? [] : _e, name = _a.name, queueUrl = _a.queueUrl, resourceKey = _a.resourceKey, _f = _a.source, source = _f === void 0 ? 'CONFIG' : _f, _g = _a.targetType, targetType = _g === void 0 ? 'LOCAL' : _g, visibilityTimeout = _a.visibilityTimeout;
    return ({
        aliases: aliases,
        create: create,
        delaySeconds: delaySeconds,
        fifo: fifo,
        handlerFunctions: handlerFunctions,
        name: name,
        queueUrl: queueUrl,
        resourceKey: resourceKey,
        source: source,
        targetType: targetType,
        visibilityTimeout: visibilityTimeout
    });
};
exports.queueDef = queueDef;
var activeQueueDef = function (input) { return (__assign(__assign({}, (0, exports.queueDef)(input)), { queueUrl: (0, exports.createQueueUrl)(input.name), queueArn: (0, exports.createQueueArn)(input.name) })); };
exports.activeQueueDef = activeQueueDef;
var createQueueUrl = function (name) { return "http://www.example.com/".concat(name); };
exports.createQueueUrl = createQueueUrl;
var createQueueArn = function (name) { return "arn:aws:sqs:eu-west-1:444455556666:".concat(name); };
exports.createQueueArn = createQueueArn;
var existingQueue = function (_a) {
    var name = _a.name, queueUrl = _a.queueUrl, queueArn = _a.queueArn;
    var _queueUrl = queueUrl || (0, exports.createQueueUrl)(name);
    var _queueArn = queueArn || (0, exports.createQueueArn)(name);
    return {
        name: name,
        queueUrl: _queueUrl,
        queueArn: _queueArn
    };
};
exports.existingQueue = existingQueue;
