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
var bindHandlersToQueues_1 = require("./bindHandlersToQueues");
describe('bindHandlersToQueues', function () {
    var createFunction = function (functionName, handler, queueArns) {
        var _a;
        return (_a = {},
            _a[functionName] = {
                functionName: functionName,
                handler: handler,
                events: queueArns.map(function (arn) { return ({
                    type: "SQS",
                    sourceEvent: { sqs: { arn: arn } }
                }); })
            },
            _a);
    };
    var arn = function (queueName) { return "arn:aws:sqs:eu-west-1:444455556666:".concat(queueName); };
    var queueDef = function (name) { return ({
        name: name,
        fifo: false,
        handlerFunctions: [],
        queueUrl: 'http://localhost',
        queueArn: arn(name)
    }); };
    it('binds and merges handlers', function () {
        var functions = __assign(__assign({}, createFunction('func1', 'handler1', [arn('queue1'), arn('queue2')])), createFunction('func2', 'handler2', [arn('queue2'), arn('queue3')]));
        var queues = [
            queueDef('queue1'),
            queueDef('queue2'),
            queueDef('queue3'),
        ];
        var config = { sqs: { errorOnMissingQueueDefinition: true } };
        var boundQueues = (0, bindHandlersToQueues_1["default"])(config, {}, queues, functions);
        expect(boundQueues.length).toBe(3);
        expect(boundQueues[0]).toEqual(__assign(__assign({}, queues[0]), { handlerFunctions: ['func1'] }));
        expect(boundQueues[1]).toEqual(__assign(__assign({}, queues[1]), { handlerFunctions: ['func1', 'func2'] }));
        expect(boundQueues[2]).toEqual(__assign(__assign({}, queues[2]), { handlerFunctions: ['func2'] }));
    });
    it('throws error if errorOnMissingQueueDefinition=true and queue missing', function () {
        var functions = __assign({}, createFunction('func1', 'handler1', [arn('queue2')]));
        var queues = [
            queueDef('queue1'),
        ];
        var config = { sqs: { errorOnMissingQueueDefinition: true } };
        expect(function () { return (0, bindHandlersToQueues_1["default"])(config, {}, queues, functions); })
            .toThrow("No queue definition with arn: '".concat(arn('queue2'), "' found, but it was referenced by an event mapping in function: 'func1'"));
    });
    it('does not error if errorOnMissingQueueDefinition=false and queue missing', function () {
        var functions = __assign({}, createFunction('func1', 'handler1', [arn('queue2')]));
        var queues = [
            queueDef('queue1'),
        ];
        var config = { sqs: { errorOnMissingQueueDefinition: false } };
        var boundQueues = (0, bindHandlersToQueues_1["default"])(config, {}, queues, functions);
        expect(boundQueues.length).toBe(0);
    });
    it('scans resources for Ref arn', function () {
        var functions = __assign({}, createFunction('func1', 'handler1', [arn('queue2')]));
        var resources = {
            k3: { name: "RES3" },
            k4: { name: "RES4" }
        };
        var queues = [
            queueDef('queue1'),
        ];
        var config = { sqs: { errorOnMissingQueueDefinition: false } };
        var boundQueues = (0, bindHandlersToQueues_1["default"])(config, {}, queues, functions);
        expect(boundQueues.length).toBe(0);
    });
});
