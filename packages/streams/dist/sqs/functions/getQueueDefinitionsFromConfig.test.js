"use strict";
exports.__esModule = true;
var getQueueDefinitionsFromConfig_1 = require("./getQueueDefinitionsFromConfig");
describe('getQueueDefinitionsFromConfig', function () {
    var func = getQueueDefinitionsFromConfig_1["default"];
    it('parses queues correctly from additional queues', function () {
        var queues = [
            { name: 'queue1' },
            { name: 'queue2', visibilityTimeout: 10, delaySeconds: 7 },
            { name: 'queue2' },
            { name: 'queue3.fifo' },
        ];
        var config = { sqs: { queues: queues } };
        var queueDefs = func(config);
        expect(queueDefs.length).toBe(3);
        expect(queueDefs[0].name).toBe('queue1');
        expect(queueDefs[0].fifo).toBeFalsy();
        expect(queueDefs[0].handlerFunctions).toEqual([]);
        expect(queueDefs[0].resourceKey).toBeUndefined();
        expect(queueDefs[0].delaySeconds).toBeUndefined();
        expect(queueDefs[0].visibilityTimeout).toBeUndefined();
        expect(queueDefs[1].name).toBe('queue2');
        expect(queueDefs[1].fifo).toBeFalsy();
        expect(queueDefs[1].handlerFunctions).toEqual([]);
        expect(queueDefs[1].resourceKey).toBeUndefined();
        expect(queueDefs[1].delaySeconds).toEqual(7);
        expect(queueDefs[1].visibilityTimeout).toEqual(10);
        expect(queueDefs[2].name).toBe('queue3.fifo');
        expect(queueDefs[2].fifo).toBeTruthy();
        expect(queueDefs[2].handlerFunctions).toEqual([]);
        expect(queueDefs[2].resourceKey).toBeUndefined();
        expect(queueDefs[2].delaySeconds).toBeUndefined();
        expect(queueDefs[2].visibilityTimeout).toBeUndefined();
    });
});
