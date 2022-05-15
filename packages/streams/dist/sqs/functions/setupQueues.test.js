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
var setupQueues_1 = require("./setupQueues");
var PluginConfiguration_1 = require("../../PluginConfiguration");
var queueDef = function (name, handlerFunctions, resourceKey) { return ({
    resourceKey: resourceKey,
    name: name,
    aliases: [],
    handlerFunctions: handlerFunctions,
    fifo: name.endsWith('.fifo')
}); };
var existingQueueDef = function (name) { return ({
    name: name,
    queueUrl: "http://127.0.0.1/".concat(name),
    queueArn: "arn:aws:sqs:eu-west-1:444455556666:".concat(name)
}); };
var resourceQueueDef = function (name, resourceKey) { return queueDef(name, [], resourceKey); };
var functionQueueDef = function (name, handlerFunctions) { return queueDef(name, handlerFunctions); };
describe('setupQueues', function () {
    var sqsClientMock = (0, aws_sdk_client_mock_1.mockClient)(client_sqs_1.SQSClient);
    var sqsClient = sqsClientMock;
    beforeEach(function () {
        sqsClientMock.reset();
    });
    describe('deleteOrPurgeQueuesIfRequired', function () {
        describe('removeExistingQueuesOnStart and purgeExistingQueuesOnStart false', function () {
            var invoke = function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, (0, setupQueues_1.deleteOrPurgeQueuesIfRequired)(sqsClient, false, false)];
            }); }); };
            it('does nothing', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            sqsClientMock.onAnyCommand().rejects({});
                            return [4 /*yield*/, invoke()];
                        case 1:
                            _a.sent();
                            expect(sqsClientMock.calls().length).toBe(0);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('removeExistingQueuesOnStart true and purgeExistingQueuesOnStart false', function () {
            var invoke = function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, (0, setupQueues_1.deleteOrPurgeQueuesIfRequired)(sqsClient, true, false)];
            }); }); };
            it('does nothing if no queues', function () { return __awaiter(void 0, void 0, void 0, function () {
                var QueueUrls;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            QueueUrls = [];
                            sqsClientMock.on(client_sqs_1.ListQueuesCommand).resolves({ QueueUrls: QueueUrls });
                            return [4 /*yield*/, invoke()
                                // Only ListQueuesCommand invoked
                            ];
                        case 1:
                            _a.sent();
                            // Only ListQueuesCommand invoked
                            expect(sqsClientMock.calls().length).toBe(1);
                            expect(sqsClientMock.commandCalls(client_sqs_1.ListQueuesCommand).length).toBe(1);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('invokes delete command for each queue', function () { return __awaiter(void 0, void 0, void 0, function () {
                var QueueUrls;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            QueueUrls = [
                                'http://127.0.0.1/queue1',
                                'http://127.0.0.1/queue2'
                            ];
                            sqsClientMock.on(client_sqs_1.ListQueuesCommand).resolves({ QueueUrls: QueueUrls });
                            return [4 /*yield*/, invoke()];
                        case 1:
                            _a.sent();
                            expect(sqsClientMock.calls().length).toBe(3);
                            expect(sqsClientMock.commandCalls(client_sqs_1.ListQueuesCommand).length).toBe(1);
                            expect(sqsClientMock.commandCalls(client_sqs_1.DeleteQueueCommand).length).toBe(2);
                            expect(sqsClientMock.commandCalls(client_sqs_1.DeleteQueueCommand, { QueueUrl: QueueUrls[0] }).length).toBe(1);
                            expect(sqsClientMock.commandCalls(client_sqs_1.DeleteQueueCommand, { QueueUrl: QueueUrls[1] }).length).toBe(1);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('removeExistingQueuesOnStart false and purgeExistingQueuesOnStart true', function () {
            var invoke = function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, (0, setupQueues_1.deleteOrPurgeQueuesIfRequired)(sqsClient, false, true)];
            }); }); };
            it('does nothing if no queues', function () { return __awaiter(void 0, void 0, void 0, function () {
                var QueueUrls;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            QueueUrls = [];
                            sqsClientMock.on(client_sqs_1.ListQueuesCommand).resolves({ QueueUrls: QueueUrls });
                            return [4 /*yield*/, invoke()
                                // Only ListQueuesCommand invoked
                            ];
                        case 1:
                            _a.sent();
                            // Only ListQueuesCommand invoked
                            expect(sqsClientMock.calls().length).toBe(1);
                            expect(sqsClientMock.commandCalls(client_sqs_1.ListQueuesCommand).length).toBe(1);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('invokes purge command for each queue', function () { return __awaiter(void 0, void 0, void 0, function () {
                var QueueUrls;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            QueueUrls = [
                                'http://127.0.0.1/queue1',
                                'http://127.0.0.1/queue2'
                            ];
                            sqsClientMock.on(client_sqs_1.ListQueuesCommand).resolves({ QueueUrls: QueueUrls });
                            return [4 /*yield*/, invoke()];
                        case 1:
                            _a.sent();
                            expect(sqsClientMock.calls().length).toBe(3);
                            expect(sqsClientMock.commandCalls(client_sqs_1.ListQueuesCommand).length).toBe(1);
                            expect(sqsClientMock.commandCalls(client_sqs_1.PurgeQueueCommand).length).toBe(2);
                            expect(sqsClientMock.commandCalls(client_sqs_1.PurgeQueueCommand, { QueueUrl: QueueUrls[0] }).length).toBe(1);
                            expect(sqsClientMock.commandCalls(client_sqs_1.PurgeQueueCommand, { QueueUrl: QueueUrls[1] }).length).toBe(1);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('removeExistingQueuesOnStart true and purgeExistingQueuesOnStart true', function () {
            var invoke = function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, (0, setupQueues_1.deleteOrPurgeQueuesIfRequired)(sqsClient, true, false)];
            }); }); };
            it('does nothing if no queues', function () { return __awaiter(void 0, void 0, void 0, function () {
                var QueueUrls;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            QueueUrls = [];
                            sqsClientMock.on(client_sqs_1.ListQueuesCommand).resolves({ QueueUrls: QueueUrls });
                            return [4 /*yield*/, invoke()
                                // Only ListQueuesCommand invoked
                            ];
                        case 1:
                            _a.sent();
                            // Only ListQueuesCommand invoked
                            expect(sqsClientMock.calls().length).toBe(1);
                            expect(sqsClientMock.commandCalls(client_sqs_1.ListQueuesCommand).length).toBe(1);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('ignores purge command and invokes delete command for each queue', function () { return __awaiter(void 0, void 0, void 0, function () {
                var QueueUrls;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            QueueUrls = [
                                'http://127.0.0.1/queue1',
                                'http://127.0.0.1/queue2'
                            ];
                            sqsClientMock.on(client_sqs_1.ListQueuesCommand).resolves({ QueueUrls: QueueUrls });
                            return [4 /*yield*/, invoke()];
                        case 1:
                            _a.sent();
                            expect(sqsClientMock.calls().length).toBe(3);
                            expect(sqsClientMock.commandCalls(client_sqs_1.ListQueuesCommand).length).toBe(1);
                            expect(sqsClientMock.commandCalls(client_sqs_1.PurgeQueueCommand).length).toBe(0);
                            expect(sqsClientMock.commandCalls(client_sqs_1.DeleteQueueCommand).length).toBe(2);
                            expect(sqsClientMock.commandCalls(client_sqs_1.DeleteQueueCommand, { QueueUrl: QueueUrls[0] }).length).toBe(1);
                            expect(sqsClientMock.commandCalls(client_sqs_1.DeleteQueueCommand, { QueueUrl: QueueUrls[1] }).length).toBe(1);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
    describe('getSingleQueueDetails', function () {
        var queueUrl = 'http://127.0.0.1/queue1';
        var invoke = function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, (0, setupQueues_1.getSingleQueueDetails)(sqsClient, queueUrl)];
        }); }); };
        it('maps details correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var QueueArn, details;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        QueueArn = 'arn:aws:sqs:eu-west-1:444455556666:queue1';
                        sqsClientMock.on(client_sqs_1.GetQueueAttributesCommand).resolves({ Attributes: { QueueArn: QueueArn } });
                        return [4 /*yield*/, invoke()];
                    case 1:
                        details = _a.sent();
                        expect(sqsClientMock.calls().length).toBe(1);
                        expect(details.name).toEqual('queue1');
                        expect(details.queueArn).toEqual(QueueArn);
                        expect(details.queueUrl).toEqual(queueUrl);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getAllExistingQueuesDetails', function () {
        var invoke = function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, (0, setupQueues_1.getAllExistingQueuesDetails)(sqsClient)];
        }); }); };
        it('does nothing if no existing queues', function () { return __awaiter(void 0, void 0, void 0, function () {
            var details;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sqsClientMock.on(client_sqs_1.ListQueuesCommand).resolves({});
                        return [4 /*yield*/, invoke()];
                    case 1:
                        details = _a.sent();
                        expect(sqsClientMock.calls().length).toBe(1);
                        expect(sqsClientMock.commandCalls(client_sqs_1.ListQueuesCommand).length).toBe(1);
                        expect(details).toEqual({});
                        return [2 /*return*/];
                }
            });
        }); });
        it('maps details correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var queueUrl1, QueueArn1, queueUrl2, QueueArn2, details;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queueUrl1 = 'http://127.0.0.1/queue1';
                        QueueArn1 = 'arn:aws:sqs:eu-west-1:444455556666:queue1';
                        queueUrl2 = 'http://127.0.0.1/queue2';
                        QueueArn2 = 'arn:aws:sqs:eu-west-1:444455556666:queue2';
                        sqsClientMock.on(client_sqs_1.ListQueuesCommand)
                            .resolves({ QueueUrls: [queueUrl1, queueUrl2] });
                        sqsClientMock.on(client_sqs_1.GetQueueAttributesCommand, { QueueUrl: queueUrl1 })
                            .resolves({ Attributes: { QueueArn: QueueArn1 } });
                        sqsClientMock.on(client_sqs_1.GetQueueAttributesCommand, { QueueUrl: queueUrl2 })
                            .resolves({ Attributes: { QueueArn: QueueArn2 } });
                        return [4 /*yield*/, invoke()];
                    case 1:
                        details = _a.sent();
                        expect(sqsClientMock.calls().length).toBe(3);
                        expect(sqsClientMock.commandCalls(client_sqs_1.ListQueuesCommand).length).toBe(1);
                        expect(sqsClientMock.commandCalls(client_sqs_1.GetQueueAttributesCommand).length).toBe(2);
                        expect(details).toEqual({
                            queue1: { name: 'queue1', queueUrl: queueUrl1, queueArn: QueueArn1 },
                            queue2: { name: 'queue2', queueUrl: queueUrl2, queueArn: QueueArn2 }
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getQueuesToCreate', function () {
        it('handles queue definitions empty', function () { return __awaiter(void 0, void 0, void 0, function () {
            var queues;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, setupQueues_1.getQueuesToCreate)([], {})];
                    case 1:
                        queues = _a.sent();
                        expect(queues.length).toEqual(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns queue definitions if existing queues empty', function () { return __awaiter(void 0, void 0, void 0, function () {
            var queueDefinitions, queues;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queueDefinitions = [
                            queueDef('queue1', [], 'Queue1'),
                            queueDef('queue2', [], 'Queue2')
                        ];
                        return [4 /*yield*/, (0, setupQueues_1.getQueuesToCreate)(queueDefinitions, {})];
                    case 1:
                        queues = _a.sent();
                        expect(queues).toEqual(queueDefinitions);
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns queue definitions if existing queues does not include definitions', function () { return __awaiter(void 0, void 0, void 0, function () {
            var existingQueues, queueDefinitions, queues;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        existingQueues = {
                            queue3: existingQueueDef('queue3'),
                            queue4: existingQueueDef('queue4')
                        };
                        queueDefinitions = [
                            queueDef('queue1', [], 'Queue1'),
                            queueDef('queue2', [], 'Queue2')
                        ];
                        return [4 /*yield*/, (0, setupQueues_1.getQueuesToCreate)(queueDefinitions, existingQueues)];
                    case 1:
                        queues = _a.sent();
                        expect(queues).toEqual(queueDefinitions);
                        return [2 /*return*/];
                }
            });
        }); });
        it('filters queue definitions that already exist', function () { return __awaiter(void 0, void 0, void 0, function () {
            var existingQueues, queueDefinitions, queues;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        existingQueues = {
                            queue1: existingQueueDef('queue1'),
                            queue4: existingQueueDef('queue3')
                        };
                        queueDefinitions = [
                            queueDef('queue1', [], 'Queue1'),
                            queueDef('queue2', [], 'Queue2')
                        ];
                        return [4 /*yield*/, (0, setupQueues_1.getQueuesToCreate)(queueDefinitions, existingQueues)];
                    case 1:
                        queues = _a.sent();
                        expect(queues.length).toBe(1);
                        expect(queues[0]).toEqual(queueDefinitions[1]);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('createQueues', function () {
        var invoke = function (queueDefinitions) { return (0, setupQueues_1.createQueues)(sqsClient, queueDefinitions); };
        it('does nothing when queue definitions empty', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, invoke([])];
                    case 1:
                        _a.sent();
                        expect(sqsClientMock.calls().length).toEqual(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it('sends CreateQueue for each queue definition', function () { return __awaiter(void 0, void 0, void 0, function () {
            var queueUrl1, queueArn1, queueUrl2, queueArn2, queueDefinitions, activeQueues;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queueUrl1 = 'http://127.0.0.1/queue1';
                        queueArn1 = 'arn:aws:sqs:eu-west-1:444455556666:queue1';
                        queueUrl2 = 'http://127.0.0.1/queue2';
                        queueArn2 = 'arn:aws:sqs:eu-west-1:444455556666:queue2';
                        queueDefinitions = [
                            queueDef('queue1', [], 'Queue1'),
                            queueDef('queue2', [], 'Queue2')
                        ];
                        sqsClientMock.on(client_sqs_1.CreateQueueCommand, { QueueName: queueDefinitions[0].name })
                            .resolves({ QueueUrl: queueUrl1 });
                        sqsClientMock.on(client_sqs_1.CreateQueueCommand, { QueueName: queueDefinitions[1].name })
                            .resolves({ QueueUrl: queueUrl2 });
                        sqsClientMock.on(client_sqs_1.GetQueueAttributesCommand, { QueueUrl: queueUrl1 })
                            .resolves({ Attributes: { QueueArn: queueArn1 } });
                        sqsClientMock.on(client_sqs_1.GetQueueAttributesCommand, { QueueUrl: queueUrl2 })
                            .resolves({ Attributes: { QueueArn: queueArn2 } });
                        return [4 /*yield*/, invoke(queueDefinitions)];
                    case 1:
                        activeQueues = _a.sent();
                        expect(sqsClientMock.calls().length).toEqual(4);
                        expect(sqsClientMock.commandCalls(client_sqs_1.CreateQueueCommand, { QueueName: queueDefinitions[0].name }).length).toEqual(1);
                        expect(sqsClientMock.commandCalls(client_sqs_1.GetQueueAttributesCommand, { QueueUrl: queueUrl1 }).length).toEqual(1);
                        expect(sqsClientMock.commandCalls(client_sqs_1.CreateQueueCommand, { QueueName: queueDefinitions[1].name }).length).toEqual(1);
                        expect(sqsClientMock.commandCalls(client_sqs_1.GetQueueAttributesCommand, { QueueUrl: queueUrl2 }).length).toEqual(1);
                        expect(activeQueues.length).toBe(2);
                        expect(activeQueues[0]).toEqual({
                            fifo: false,
                            handlerFunctions: [],
                            resourceKey: queueDefinitions[0].resourceKey,
                            name: queueDefinitions[0].name,
                            queueArn: queueArn1,
                            queueUrl: queueUrl1,
                            aliases: []
                        });
                        expect(activeQueues[1]).toEqual({
                            fifo: false,
                            handlerFunctions: [],
                            resourceKey: queueDefinitions[1].resourceKey,
                            name: queueDefinitions[1].name,
                            queueArn: queueArn2,
                            queueUrl: queueUrl2,
                            aliases: []
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('creates queue as FIFO if queue is FIFO', function () { return __awaiter(void 0, void 0, void 0, function () {
            var queueUrl, queueArn, queueDefinitions, activeQueues;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queueUrl = 'http://127.0.0.1/queue1.fifo';
                        queueArn = 'arn:aws:sqs:eu-west-1:444455556666:queue1.fifo';
                        queueDefinitions = [
                            queueDef('queue1.fifo', [], 'Queue1'),
                        ];
                        sqsClientMock.on(client_sqs_1.CreateQueueCommand, { QueueName: queueDefinitions[0].name })
                            .resolves({ QueueUrl: queueUrl });
                        sqsClientMock.on(client_sqs_1.GetQueueAttributesCommand, { QueueUrl: queueUrl })
                            .resolves({ Attributes: { QueueArn: queueArn } });
                        return [4 /*yield*/, invoke(queueDefinitions)];
                    case 1:
                        activeQueues = _a.sent();
                        expect(activeQueues.length).toBe(1);
                        expect(activeQueues[0]).toEqual({
                            fifo: true,
                            handlerFunctions: [],
                            resourceKey: queueDefinitions[0].resourceKey,
                            name: queueDefinitions[0].name,
                            queueArn: queueArn,
                            queueUrl: queueUrl,
                            aliases: []
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('sets VisibilityTimeout when specified', function () { return __awaiter(void 0, void 0, void 0, function () {
            var queueDefinition, activeQueues;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queueDefinition = __assign(__assign({}, queueDef('queue1', [], 'Queue1')), { visibilityTimeout: 50 });
                        sqsClientMock.on(client_sqs_1.CreateQueueCommand).resolves({ QueueUrl: 'http://127.0.0.1/queue1' });
                        sqsClientMock.on(client_sqs_1.GetQueueAttributesCommand).resolves({ Attributes: { QueueArn: 'arn:aws:sqs:eu-west-1:444455556666:queue1' } });
                        return [4 /*yield*/, invoke([queueDefinition])];
                    case 1:
                        activeQueues = _a.sent();
                        expect(sqsClientMock.calls().length).toEqual(2);
                        expect(sqsClientMock.commandCalls(client_sqs_1.CreateQueueCommand, { Attributes: { VisibilityTimeout: "50" } }).length).toEqual(1);
                        expect(activeQueues[0].visibilityTimeout).toEqual(50);
                        return [2 /*return*/];
                }
            });
        }); });
        it('sets DelaySeconds when specified', function () { return __awaiter(void 0, void 0, void 0, function () {
            var queueDefinition, activeQueues;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queueDefinition = __assign(__assign({}, queueDef('queue1', [], 'Queue1')), { delaySeconds: 50 });
                        sqsClientMock.on(client_sqs_1.CreateQueueCommand).resolves({ QueueUrl: 'http://127.0.0.1/queue1' });
                        sqsClientMock.on(client_sqs_1.GetQueueAttributesCommand).resolves({ Attributes: { QueueArn: 'arn:aws:sqs:eu-west-1:444455556666:queue1' } });
                        return [4 /*yield*/, invoke([queueDefinition])];
                    case 1:
                        activeQueues = _a.sent();
                        expect(sqsClientMock.calls().length).toEqual(2);
                        expect(sqsClientMock.commandCalls(client_sqs_1.CreateQueueCommand, { Attributes: { DelaySeconds: "50" } }).length).toEqual(1);
                        expect(activeQueues[0].delaySeconds).toEqual(50);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('setupQueues', function () {
        var config = (0, PluginConfiguration_1.getDefaultPluginConfiguration)();
        config.sqs.createQueuesFromResources = false;
        config.sqs.purgeExistingQueuesOnStart = false;
        config.sqs.removeExistingQueuesOnStart = false;
        var invoke = function (queueDefinitions) { return (0, setupQueues_1["default"])(config, sqsClient)(queueDefinitions); };
        it('sets up queues correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var existingQueueUrl, existingQueueArn, queueUrl2, queueArn2, queueUrl3, queueArn3, queueDefinitions, activeQueues;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        existingQueueUrl = 'http://127.0.0.1/queue1';
                        existingQueueArn = 'arn:aws:sqs:eu-west-1:444455556666:queue1';
                        queueUrl2 = 'http://127.0.0.1/queue2';
                        queueArn2 = 'arn:aws:sqs:eu-west-1:444455556666:queue2';
                        queueUrl3 = 'http://127.0.0.1/queue3';
                        queueArn3 = 'arn:aws:sqs:eu-west-1:444455556666:queue3';
                        queueDefinitions = [
                            queueDef('queue1', [], 'Queue1'),
                            queueDef('queue2', [], 'Queue2'),
                            queueDef('queue3', [], 'Queue3'),
                        ];
                        // Existing queue 1
                        sqsClientMock.on(client_sqs_1.ListQueuesCommand).resolves({ QueueUrls: [existingQueueUrl] });
                        sqsClientMock.on(client_sqs_1.GetQueueAttributesCommand, { QueueUrl: existingQueueUrl })
                            .resolves({ Attributes: { QueueArn: existingQueueArn } });
                        // New queue 2
                        sqsClientMock.on(client_sqs_1.CreateQueueCommand, { QueueName: queueDefinitions[1].name })
                            .resolves({ QueueUrl: queueUrl2 });
                        sqsClientMock.on(client_sqs_1.GetQueueAttributesCommand, { QueueUrl: queueUrl2 })
                            .resolves({ Attributes: { QueueArn: queueArn2 } });
                        // New queue 3
                        sqsClientMock.on(client_sqs_1.CreateQueueCommand, { QueueName: queueDefinitions[2].name })
                            .resolves({ QueueUrl: queueUrl3 });
                        sqsClientMock.on(client_sqs_1.GetQueueAttributesCommand, { QueueUrl: queueUrl3 })
                            .resolves({ Attributes: { QueueArn: queueArn3 } });
                        return [4 /*yield*/, invoke(queueDefinitions)];
                    case 1:
                        activeQueues = _a.sent();
                        expect(activeQueues.length).toEqual(3);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
