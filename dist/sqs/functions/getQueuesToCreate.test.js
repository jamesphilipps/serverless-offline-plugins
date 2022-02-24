"use strict";
exports.__esModule = true;
var PluginConfiguration_1 = require("../../PluginConfiguration");
var getQueuesToCreate_1 = require("./getQueuesToCreate");
var queueDef = function (name, handlerFunctions, resourceKey) { return ({
    resourceKey: resourceKey,
    name: name,
    handlerFunctions: handlerFunctions,
    fifo: name.endsWith('.fifo')
}); };
var resourceQueueDef = function (name, resourceKey) { return queueDef(name, [], resourceKey); };
var functionQueueDef = function (name, handlerFunctions) { return queueDef(name, handlerFunctions); };
var additionalQueueDef = function (name) { return queueDef(name, []); };
describe('getQueuesToCreate', function () {
    describe('createQueuesFromResources is false', function () {
        var config = (0, PluginConfiguration_1.getDefaultPluginConfiguration)();
        config.sqs.createQueuesFromResources = false;
        var func = (0, getQueuesToCreate_1["default"])(config);
        it('uses only function queues if no additional queues specified', function () {
            var resourceQueueDefinitions = [resourceQueueDef('rqueue1', 'rq1'),];
            var functionQueueDefinitions = [functionQueueDef('fqueue1', ['f1']),];
            var queues = func(resourceQueueDefinitions, functionQueueDefinitions, []);
            expect(queues.length).toBe(1);
            expect(queues).toEqual(functionQueueDefinitions);
        });
        it('uses only function queues and additional queues', function () {
            var resourceQueueDefinitions = [resourceQueueDef('rqueue1', 'rq1'),];
            var functionQueueDefinitions = [functionQueueDef('fqueue1', ['f1']),];
            var additionalQueueDefinitions = [additionalQueueDef('aqueue1')];
            var queues = func(resourceQueueDefinitions, functionQueueDefinitions, additionalQueueDefinitions);
            expect(queues.length).toBe(2);
            expect(queues[0]).toEqual(functionQueueDefinitions[0]);
            expect(queues[1]).toEqual(additionalQueueDefinitions[0]);
        });
        it('merges function queues', function () {
            var resourceQueueDefinitions = [resourceQueueDef('rqueue1', 'rq1'),];
            var functionQueueDefinitions = [
                functionQueueDef('fqueue1', ['f1']),
                functionQueueDef('fqueue1', ['f2']),
                functionQueueDef('fqueue2', ['f2']),
            ];
            var queues = func(resourceQueueDefinitions, functionQueueDefinitions, []);
            expect(queues.length).toBe(2);
            expect(queues[0].name).toEqual('fqueue1');
            expect(queues[0].handlerFunctions).toEqual(['f1', 'f2']);
            expect(queues[1].name).toEqual('fqueue2');
            expect(queues[1].handlerFunctions).toEqual(['f2']);
        });
    });
    describe('createQueuesFromResources is true', function () {
        var config = (0, PluginConfiguration_1.getDefaultPluginConfiguration)();
        config.sqs.createQueuesFromResources = true;
        var func = (0, getQueuesToCreate_1["default"])(config);
        it('uses resource and function queues if no additional queues specified', function () {
            var resourceQueueDefinitions = [resourceQueueDef('rqueue1', 'rq1'),];
            var functionQueueDefinitions = [functionQueueDef('fqueue1', ['f1']),];
            var queues = func(resourceQueueDefinitions, functionQueueDefinitions, []);
            expect(queues.length).toBe(2);
            expect(queues[0]).toEqual(functionQueueDefinitions[0]);
            expect(queues[1]).toEqual(resourceQueueDefinitions[0]);
        });
        it('uses resource, function and additional queues if no additional queues specified', function () {
            var resourceQueueDefinitions = [resourceQueueDef('rqueue1', 'rq1'),];
            var functionQueueDefinitions = [functionQueueDef('fqueue1', ['f1']),];
            var additionalQueueDefinitions = [additionalQueueDef('aqueue1')];
            var queues = func(resourceQueueDefinitions, functionQueueDefinitions, additionalQueueDefinitions);
            expect(queues.length).toBe(3);
            expect(queues[0]).toEqual(functionQueueDefinitions[0]);
            expect(queues[1]).toEqual(additionalQueueDefinitions[0]);
            expect(queues[2]).toEqual(resourceQueueDefinitions[0]);
        });
        it('merges function queues', function () {
            var resourceQueueDefinitions = [resourceQueueDef('rqueue1', 'rq1'),];
            var functionQueueDefinitions = [
                functionQueueDef('fqueue1', ['f1']),
                functionQueueDef('fqueue1', ['f2']),
                functionQueueDef('fqueue2', ['f2']),
            ];
            var queues = func(resourceQueueDefinitions, functionQueueDefinitions, []);
            expect(queues.length).toBe(3);
            expect(queues[0].name).toEqual('fqueue1');
            expect(queues[0].handlerFunctions).toEqual(['f1', 'f2']);
            expect(queues[1].name).toEqual('fqueue2');
            expect(queues[1].handlerFunctions).toEqual(['f2']);
            expect(queues[2].name).toEqual('rqueue1');
            expect(queues[2].handlerFunctions).toEqual([]);
        });
    });
});
