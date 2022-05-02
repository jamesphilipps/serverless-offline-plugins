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
var PluginConfiguration_1 = require("../../PluginConfiguration");
var getQueuesToCreate_1 = require("./getQueuesToCreate");
var queueDef = function (name, handlerFunctions, resourceKey, create) { return ({
    resourceKey: resourceKey,
    name: name,
    aliases: [],
    handlerFunctions: handlerFunctions,
    create: create,
    fifo: name.endsWith('.fifo')
}); };
var resourceQueueDef = function (name, resourceKey) { return queueDef(name, [], resourceKey); };
var functionQueueDef = function (name, handlerFunctions) { return queueDef(name, handlerFunctions); };
var configQueueDef = function (name, create) { return queueDef(name, [], undefined, create); };
describe('getQueuesToCreate', function () {
    describe('createQueuesFromResources is false', function () {
        var config = (0, PluginConfiguration_1.getDefaultPluginConfiguration)();
        config.sqs.createQueuesFromResources = false;
        var func = (0, getQueuesToCreate_1["default"])(config);
        it('uses only config queues', function () {
            var resourceQueueDefinitions = [resourceQueueDef('rqueue1', 'rq1'),];
            var configQueueDefinitions = [configQueueDef('cqueue1')];
            var queues = func(resourceQueueDefinitions, configQueueDefinitions);
            expect(queues.length).toBe(1);
            expect(queues[0]).toEqual(configQueueDefinitions[0]);
        });
        it('does not create queues where create=false', function () {
            var configQueueDefinitions = [
                configQueueDef('cqueue1'),
                __assign(__assign({}, configQueueDef('cqueue3')), { create: false }),
            ];
            var queues = func([], configQueueDefinitions);
            expect(queues.length).toBe(1);
            expect(queues[0].name).toEqual('cqueue1');
        });
    });
    describe('createQueuesFromResources is true', function () {
        var config = (0, PluginConfiguration_1.getDefaultPluginConfiguration)();
        config.sqs.createQueuesFromResources = true;
        var func = (0, getQueuesToCreate_1["default"])(config);
        it('uses resource and config queues', function () {
            var resourceQueueDefinitions = [resourceQueueDef('rqueue1', 'rq1'),];
            var configQueueDefinitions = [configQueueDef('cqueue1')];
            var queues = func(resourceQueueDefinitions, configQueueDefinitions);
            expect(queues.length).toBe(2);
            expect(queues[0]).toEqual(configQueueDefinitions[0]);
            expect(queues[1]).toEqual(resourceQueueDefinitions[0]);
        });
        it('does not create queues where create=false', function () {
            var configQueueDefinitions = [
                configQueueDef('cqueue1'),
                __assign(__assign({}, configQueueDef('cqueue3')), { create: false }),
            ];
            var queues = func([], configQueueDefinitions);
            expect(queues.length).toBe(1);
            expect(queues[0].name).toEqual('cqueue1');
        });
    });
});
