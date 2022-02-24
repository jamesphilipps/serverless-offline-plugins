"use strict";
exports.__esModule = true;
var getFunctionQueueDefinitions_1 = require("./getFunctionQueueDefinitions");
var PluginConfiguration_1 = require("../../PluginConfiguration");
var sqsEventMapping = function (sourceEvent) { return ({
    type: 'SQS',
    sourceEvent: sourceEvent
}); };
var functionMapping = function (functionName, events) { return ({
    functionName: functionName,
    handler: 'FOO',
    events: events
}); };
describe('getFunctionQueueDefinitions', function () {
    var func = (0, getFunctionQueueDefinitions_1["default"])((0, PluginConfiguration_1.getDefaultPluginConfiguration)(), {});
    it('parses queues correctly from functions', function () {
        var functionsWithSqsEvents = {
            f1: functionMapping('f1', [
                sqsEventMapping({ sqs: { arn: 'arn:aws:sqs:eu-west-1:444455556666:queue1' } })
            ]),
            f2: functionMapping('f2', [
                sqsEventMapping({ sqs: { arn: 'arn:aws:sqs:eu-west-1:444455556666:queue2.fifo' } })
            ])
        };
        var queueDefs = func(functionsWithSqsEvents);
        expect(queueDefs.length).toBe(2);
        expect(queueDefs[0].name).toBe('queue1');
        expect(queueDefs[0].fifo).toBeFalsy();
        expect(queueDefs[0].handlerFunctions).toEqual(['f1']);
        expect(queueDefs[0].resourceKey).toBeUndefined();
        expect(queueDefs[0].delaySeconds).toBeUndefined();
        expect(queueDefs[0].visibilityTimeout).toBeUndefined();
        expect(queueDefs[1].name).toBe('queue2.fifo');
        expect(queueDefs[1].fifo).toBeTruthy();
        expect(queueDefs[1].handlerFunctions).toEqual(['f2']);
        expect(queueDefs[1].resourceKey).toBeUndefined();
        expect(queueDefs[1].delaySeconds).toBeUndefined();
        expect(queueDefs[1].visibilityTimeout).toBeUndefined();
    });
    it('merges queue definitions for the same queue', function () {
        var functionsWithSqsEvents = {
            f1: functionMapping('f1', [
                sqsEventMapping({ sqs: { arn: 'arn:aws:sqs:eu-west-1:444455556666:queue1' } })
            ]),
            f2: functionMapping('f2', [
                sqsEventMapping({ sqs: { arn: 'arn:aws:sqs:eu-west-1:444455556666:queue1' } })
            ]),
            f3: functionMapping('f3', [
                sqsEventMapping({ sqs: { arn: 'arn:aws:sqs:eu-west-1:444455556666:queue1' } })
            ])
        };
        var queueDefs = func(functionsWithSqsEvents);
        expect(queueDefs.length).toBe(1);
        expect(queueDefs[0].name).toBe('queue1');
        expect(queueDefs[0].fifo).toBeFalsy();
        expect(queueDefs[0].handlerFunctions).toEqual(['f1', 'f2', 'f3']);
        expect(queueDefs[0].resourceKey).toBeUndefined();
        expect(queueDefs[0].delaySeconds).toBeUndefined();
        expect(queueDefs[0].visibilityTimeout).toBeUndefined();
    });
});
