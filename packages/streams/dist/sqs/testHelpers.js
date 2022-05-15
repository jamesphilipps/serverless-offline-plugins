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
exports.existingQueue = exports.createQueueArn = exports.createQueueUrl = exports.TEST_ENDPOINT = exports.activeQueueDef = exports.queueDef = void 0;
var queueDef = function (_a) {
    var _b = _a.aliases, aliases = _b === void 0 ? [] : _b, _c = _a.create, create = _c === void 0 ? true : _c, delaySeconds = _a.delaySeconds, _d = _a.endpoint, endpoint = _d === void 0 ? exports.TEST_ENDPOINT : _d, _e = _a.fifo, fifo = _e === void 0 ? false : _e, _f = _a.handlerFunctions, handlerFunctions = _f === void 0 ? [] : _f, name = _a.name, resourceKey = _a.resourceKey, _g = _a.source, source = _g === void 0 ? 'CONFIG' : _g, _h = _a.targetType, targetType = _h === void 0 ? 'LOCAL' : _h, url = _a.url, visibilityTimeout = _a.visibilityTimeout;
    return ({
        aliases: aliases,
        create: create,
        delaySeconds: delaySeconds,
        endpoint: endpoint,
        fifo: fifo,
        handlerFunctions: handlerFunctions,
        name: name,
        resourceKey: resourceKey,
        source: source,
        targetType: targetType,
        url: url,
        visibilityTimeout: visibilityTimeout
    });
};
exports.queueDef = queueDef;
var activeQueueDef = function (sqsClient, input) { return (__assign(__assign({ sqsClient: sqsClient }, (0, exports.queueDef)(input)), { url: (0, exports.createQueueUrl)(input.name), arn: (0, exports.createQueueArn)(input.name) })); };
exports.activeQueueDef = activeQueueDef;
exports.TEST_ENDPOINT = 'http://www.example.com/';
var createQueueUrl = function (name) { return "".concat(exports.TEST_ENDPOINT, "/").concat(name); };
exports.createQueueUrl = createQueueUrl;
var createQueueArn = function (name) { return "arn:aws:sqs:eu-west-1:444455556666:".concat(name); };
exports.createQueueArn = createQueueArn;
var existingQueue = function (_a) {
    var name = _a.name, url = _a.url, arn = _a.arn;
    return ({
        name: name,
        url: url || (0, exports.createQueueUrl)(name),
        arn: arn || (0, exports.createQueueArn)(name)
    });
};
exports.existingQueue = existingQueue;
