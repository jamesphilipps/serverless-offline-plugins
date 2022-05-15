"use strict";
exports.__esModule = true;
var getDefinedQueues_1 = require("./getDefinedQueues");
describe('getDefinedQueues', function () {
    it('gets queue definitions from config', function () {
        var config = {
            queues: [
                { name: 'queue1' },
                { name: 'queue2', visibilityTimeout: 10, delaySeconds: 7 },
                { name: 'queue2' },
                { name: 'queue3.fifo', remote: { queueUrl: "http://sqs.us-east-2.amazonaws.com/4445555666/queue-3.fifo" } },
            ]
        };
        var queueDefs = (0, getDefinedQueues_1["default"])(config, {});
        expect(queueDefs.length).toBe(3);
        expect(queueDefs[0].name).toBe('queue1');
        expect(queueDefs[0].endpoint).toEqual(config.endpoint);
        expect(queueDefs[0].fifo).toBeFalsy();
        expect(queueDefs[0].handlerFunctions).toEqual([]);
        expect(queueDefs[0].resourceKey).toBeUndefined();
        expect(queueDefs[0].delaySeconds).toBeUndefined();
        expect(queueDefs[0].url).toBeUndefined();
        expect(queueDefs[0].visibilityTimeout).toBeUndefined();
        expect(queueDefs[1].name).toBe('queue2');
        expect(queueDefs[1].endpoint).toEqual(config.endpoint);
        expect(queueDefs[1].fifo).toBeFalsy();
        expect(queueDefs[1].handlerFunctions).toEqual([]);
        expect(queueDefs[1].resourceKey).toBeUndefined();
        expect(queueDefs[1].delaySeconds).toEqual(7);
        expect(queueDefs[1].url).toBeUndefined();
        expect(queueDefs[1].visibilityTimeout).toEqual(10);
        expect(queueDefs[2].name).toBe('queue3.fifo');
        expect(queueDefs[2].endpoint).toEqual("http://sqs.us-east-2.amazonaws.com");
        expect(queueDefs[2].fifo).toBeTruthy();
        expect(queueDefs[2].handlerFunctions).toEqual([]);
        expect(queueDefs[2].resourceKey).toBeUndefined();
        expect(queueDefs[2].delaySeconds).toBeUndefined();
        expect(queueDefs[2].url).toEqual("http://sqs.us-east-2.amazonaws.com/4445555666/queue-3.fifo");
        expect(queueDefs[2].visibilityTimeout).toBeUndefined();
    });
    it('gets queue definitions from resources', function () {
        var resources = {
            Queue1: {
                Type: 'AWS::SQS::Queue',
                Properties: { QueueName: "Queue1A" }
            },
            CognitoUser: {
                Type: "AWS::Cognito::UserPoolUser",
                Properties: { UserName: "JohnSmith" }
            },
            Queue2: {
                Type: 'AWS::SQS::Queue',
                Properties: {
                    QueueName: "Queue2A.fifo",
                    FifoQueue: true,
                    VisibilityTimeout: 10,
                    DelaySeconds: 5
                }
            }
        };
        var config = { queues: [] };
        var queueDefs = (0, getDefinedQueues_1["default"])(config, resources);
        expect(queueDefs.length).toBe(2);
        expect(queueDefs[0].aliases).toEqual([]);
        expect(queueDefs[0].delaySeconds).toBeUndefined();
        expect(queueDefs[0].endpoint).toEqual(config.endpoint);
        expect(queueDefs[0].fifo).toBeFalsy();
        expect(queueDefs[0].handlerFunctions).toEqual([]);
        expect(queueDefs[0].name).toBe('Queue1A');
        expect(queueDefs[0].resourceKey).toBe("Queue1");
        expect(queueDefs[0].source).toBe('RESOURCES');
        expect(queueDefs[0].targetType).toBe('LOCAL');
        expect(queueDefs[0].url).toBeUndefined();
        expect(queueDefs[0].visibilityTimeout).toBeUndefined();
        expect(queueDefs[1].aliases).toEqual([]);
        expect(queueDefs[1].delaySeconds).toBe(5);
        expect(queueDefs[1].endpoint).toEqual(config.endpoint);
        expect(queueDefs[1].fifo).toBeTruthy();
        expect(queueDefs[1].handlerFunctions).toEqual([]);
        expect(queueDefs[1].name).toBe('Queue2A.fifo');
        expect(queueDefs[1].resourceKey).toBe("Queue2");
        expect(queueDefs[1].source).toBe('RESOURCES');
        expect(queueDefs[1].targetType).toBe('LOCAL');
        expect(queueDefs[1].url).toBeUndefined();
        expect(queueDefs[1].visibilityTimeout).toBe(10);
    });
});
