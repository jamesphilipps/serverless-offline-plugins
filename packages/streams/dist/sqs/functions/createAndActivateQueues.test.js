"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var client_sqs_1 = require("@aws-sdk/client-sqs");
var aws_sdk_client_mock_1 = require("aws-sdk-client-mock");
var createAndActivateQueues_1 = require("./createAndActivateQueues");
var testHelpers_1 = require("../testHelpers");
describe('createAndActivateQueues', function () {
    var sqsClientMock = (0, aws_sdk_client_mock_1.mockClient)(client_sqs_1.SQSClient);
    var sqsClient = sqsClientMock;
    beforeEach(function () {
        sqsClientMock.reset();
    });
    var createConfig = function (createFromResources) { return ({
        localQueueManagement: { createFromResources: createFromResources }
    }); };
    var onListQueuesReturn = function (_sqsClientMock, QueueUrls) {
        _sqsClientMock.on(client_sqs_1.ListQueuesCommand).resolves({ QueueUrls: QueueUrls });
    };
    var onGetQueueDetailsReturn = function (_sqsClientMock, details) {
        _sqsClientMock.on(client_sqs_1.GetQueueAttributesCommand, { QueueUrl: details.url }).resolves({
            Attributes: {
                QueueName: details.name,
                QueueUrl: details.url,
                QueueArn: details.arn
            }
        });
    };
    var onCreateQueueReturn = function (_sqsClientMock, queue) {
        var _a, _b;
        _sqsClientMock.on(client_sqs_1.CreateQueueCommand, {
            QueueName: queue.name,
            Attributes: {
                VisibilityTimeout: (_a = queue.visibilityTimeout) === null || _a === void 0 ? void 0 : _a.toString(),
                DelaySeconds: (_b = queue.delaySeconds) === null || _b === void 0 ? void 0 : _b.toString(),
                FifoQueue: queue.fifo
            }
        }).resolves({ QueueUrl: (0, testHelpers_1.createQueueUrl)(queue.name) });
    };
    var noOpCreateSqsClient = function () { return Promise.reject("Attempt to invoke no-op"); };
    it('does nothing if no defined or existing queues', function () { return __awaiter(void 0, void 0, void 0, function () {
        var config, definedQueues, activeQueues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = createConfig(false);
                    definedQueues = [];
                    onListQueuesReturn(sqsClientMock, []);
                    return [4 /*yield*/, (0, createAndActivateQueues_1["default"])(noOpCreateSqsClient, config, sqsClient, definedQueues)];
                case 1:
                    activeQueues = _a.sent();
                    expect(sqsClientMock.commandCalls(client_sqs_1.CreateQueueCommand).length).toBe(0);
                    expect(activeQueues.length).toBe(0);
                    return [2 /*return*/];
            }
        });
    }); });
    it('does nothing if queues defined, not creating queues and no existing queues', function () { return __awaiter(void 0, void 0, void 0, function () {
        var config, definedQueues, activeQueues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = createConfig(false);
                    definedQueues = [
                        (0, testHelpers_1.queueDef)({ name: 'Queue1' })
                    ];
                    onListQueuesReturn(sqsClientMock, []);
                    return [4 /*yield*/, (0, createAndActivateQueues_1["default"])(noOpCreateSqsClient, config, sqsClient, definedQueues)];
                case 1:
                    activeQueues = _a.sent();
                    expect(sqsClientMock.commandCalls(client_sqs_1.CreateQueueCommand).length).toBe(0);
                    expect(activeQueues.length).toBe(0);
                    return [2 /*return*/];
            }
        });
    }); });
    it('does not create queue if create=false', function () { return __awaiter(void 0, void 0, void 0, function () {
        var config, definedQueues, activeQueues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = createConfig(true);
                    definedQueues = [
                        (0, testHelpers_1.queueDef)({ name: 'Queue1', create: false })
                    ];
                    onListQueuesReturn(sqsClientMock, []);
                    return [4 /*yield*/, (0, createAndActivateQueues_1["default"])(noOpCreateSqsClient, config, sqsClient, definedQueues)];
                case 1:
                    activeQueues = _a.sent();
                    expect(sqsClientMock.commandCalls(client_sqs_1.CreateQueueCommand).length).toBe(0);
                    expect(activeQueues.length).toBe(0);
                    return [2 /*return*/];
            }
        });
    }); });
    it('does not create queue if queue is from resources and createQueueFromResources=false', function () { return __awaiter(void 0, void 0, void 0, function () {
        var config, definedQueues, activeQueues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = createConfig(false);
                    definedQueues = [
                        (0, testHelpers_1.queueDef)({ name: 'Queue1', source: 'RESOURCES' })
                    ];
                    onListQueuesReturn(sqsClientMock, []);
                    return [4 /*yield*/, (0, createAndActivateQueues_1["default"])(noOpCreateSqsClient, config, sqsClient, definedQueues)];
                case 1:
                    activeQueues = _a.sent();
                    expect(sqsClientMock.commandCalls(client_sqs_1.CreateQueueCommand).length).toBe(0);
                    expect(activeQueues.length).toBe(0);
                    return [2 /*return*/];
            }
        });
    }); });
    it('does not create queue if queue exists', function () { return __awaiter(void 0, void 0, void 0, function () {
        var config, definedQueues, existingQueue1, activeQueues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = createConfig(true);
                    definedQueues = [
                        (0, testHelpers_1.queueDef)({ name: 'Queue1' })
                    ];
                    existingQueue1 = (0, testHelpers_1.existingQueue)({ name: 'Queue1' });
                    onListQueuesReturn(sqsClientMock, [existingQueue1.url]);
                    onGetQueueDetailsReturn(sqsClientMock, existingQueue1);
                    return [4 /*yield*/, (0, createAndActivateQueues_1["default"])(noOpCreateSqsClient, config, sqsClient, definedQueues)];
                case 1:
                    activeQueues = _a.sent();
                    expect(sqsClientMock.commandCalls(client_sqs_1.CreateQueueCommand).length).toBe(0);
                    expect(activeQueues.length).toBe(1);
                    expect(activeQueues[0].name).toEqual(existingQueue1.name);
                    expect(activeQueues[0].sqsClient).toBe(sqsClientMock);
                    expect(activeQueues[0].url).toEqual(existingQueue1.url);
                    expect(activeQueues[0].arn).toEqual(existingQueue1.arn);
                    return [2 /*return*/];
            }
        });
    }); });
    it('creates queue if queue does not  exist', function () { return __awaiter(void 0, void 0, void 0, function () {
        var config, queueDef1, definedQueues, createdQueue, activeQueues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = createConfig(true);
                    queueDef1 = (0, testHelpers_1.queueDef)({ name: 'Queue1' });
                    definedQueues = [queueDef1];
                    onListQueuesReturn(sqsClientMock, []);
                    onCreateQueueReturn(sqsClientMock, queueDef1);
                    createdQueue = (0, testHelpers_1.existingQueue)({ name: queueDef1.name });
                    onGetQueueDetailsReturn(sqsClientMock, createdQueue);
                    return [4 /*yield*/, (0, createAndActivateQueues_1["default"])(noOpCreateSqsClient, config, sqsClient, definedQueues)];
                case 1:
                    activeQueues = _a.sent();
                    expect(sqsClientMock.commandCalls(client_sqs_1.CreateQueueCommand).length).toBe(1);
                    expect(activeQueues.length).toBe(1);
                    expect(activeQueues[0].name).toEqual(queueDef1.name);
                    expect(activeQueues[0].sqsClient).toBe(sqsClientMock);
                    expect(activeQueues[0].url).toEqual(createdQueue.url);
                    expect(activeQueues[0].arn).toEqual(createdQueue.arn);
                    return [2 /*return*/];
            }
        });
    }); });
    it('creates remote queue if uri specified', function () { return __awaiter(void 0, void 0, void 0, function () {
        var config, queueDef1, definedQueues, remoteQueueDef, remoteQueueClientMock, remoteQueueClient, createSqsClientMock, activeQueues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = createConfig(true);
                    queueDef1 = (0, testHelpers_1.queueDef)({
                        name: 'Queue1',
                        endpoint: 'https://sqs.eu-west-2.amazonaws.com',
                        url: 'https://sqs.eu-west-2.amazonaws.com/4445555666/Queue1',
                        source: "CONFIG",
                        targetType: "REMOTE"
                    });
                    definedQueues = [queueDef1];
                    onListQueuesReturn(sqsClientMock, []);
                    remoteQueueDef = (0, testHelpers_1.existingQueue)({
                        name: 'Queue1',
                        url: 'https://sqs.eu-west-2.amazonaws.com/4445555666/Queue1',
                        arn: 'arn:aws:sqs:eu-west-2:444455556666:Queue1'
                    });
                    remoteQueueClientMock = (0, aws_sdk_client_mock_1.mockClient)(client_sqs_1.SQSClient);
                    remoteQueueClient = remoteQueueClientMock;
                    onGetQueueDetailsReturn(remoteQueueClientMock, remoteQueueDef);
                    createSqsClientMock = jest.fn();
                    createSqsClientMock.mockReturnValue(remoteQueueClient);
                    return [4 /*yield*/, (0, createAndActivateQueues_1["default"])(createSqsClientMock, config, sqsClient, definedQueues)];
                case 1:
                    activeQueues = _a.sent();
                    expect(sqsClientMock.commandCalls(client_sqs_1.CreateQueueCommand).length).toBe(0);
                    expect(createSqsClientMock).toBeCalledTimes(1);
                    expect(createSqsClientMock).toBeCalledWith("eu-west-2", "https://sqs.eu-west-2.amazonaws.com");
                    expect(activeQueues.length).toBe(1);
                    expect(activeQueues[0].name).toEqual(queueDef1.name);
                    expect(activeQueues[0].sqsClient).toBe(remoteQueueClientMock);
                    expect(activeQueues[0].url).toEqual(remoteQueueDef.url);
                    expect(activeQueues[0].arn).toEqual(remoteQueueDef.arn);
                    return [2 /*return*/];
            }
        });
    }); });
});
