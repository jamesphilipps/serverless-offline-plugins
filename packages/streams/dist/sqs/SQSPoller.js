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
var logging_1 = require("../logging");
var client_sqs_1 = require("@aws-sdk/client-sqs");
var SQSPoller = /** @class */ (function () {
    function SQSPoller(options, config, queueDefinitions, lambda) {
        this.options = options;
        this.config = config;
        this.queueDefinitions = queueDefinitions;
        this.lambda = lambda;
    }
    SQSPoller.prototype.start = function () {
        this._clearNextPoll();
        this._scheduleNextPoll(false);
    };
    SQSPoller.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._clearNextPoll();
                return [2 /*return*/];
            });
        });
    };
    SQSPoller.prototype._clearNextPoll = function () {
        if (this.nextPoll)
            clearTimeout(this.nextPoll);
    };
    SQSPoller.prototype._scheduleNextPoll = function (messagesRetrievedOnLastPoll) {
        var _this = this;
        var getNextPollInterval = function () {
            var pollConfig = _this.config.pollConfig;
            var strategy = pollConfig.strategy, fixedIntervalMs = pollConfig.fixedIntervalMs, minIntervalMs = pollConfig.minIntervalMs, maxIntervalMs = pollConfig.maxIntervalMs, backoffType = pollConfig.backoffType, intervalStepMs = pollConfig.intervalStepMs;
            if (strategy === 'backoff') {
                if (!_this.pollInterval || messagesRetrievedOnLastPoll) {
                    return minIntervalMs;
                }
                if (backoffType === 'double') {
                    return Math.min(maxIntervalMs, _this.pollInterval * 2);
                }
                return Math.min(maxIntervalMs, _this.pollInterval + intervalStepMs);
            }
            return fixedIntervalMs;
        };
        this.pollInterval = getNextPollInterval();
        this.nextPoll = setTimeout(this._poll.bind(this), this.pollInterval);
        (0, logging_1.logDebug)("Next poll interval: ", this.pollInterval);
    };
    SQSPoller.prototype._poll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var processResults, retrievedMessageCount;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, logging_1.logDebug)("Polling SQS queues..");
                        return [4 /*yield*/, Promise.all(this.queueDefinitions.map(function (queue) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, this._processMessages(queue)];
                            }); }); }))];
                    case 1:
                        processResults = _a.sent();
                        retrievedMessageCount = processResults
                            .map(function (r) { return r.retrievedMessageCount; })
                            .reduce(function (acc, v) { return acc + v; }, 0);
                        (0, logging_1.logDebug)("Finished polling SQS queues");
                        this._scheduleNextPoll(retrievedMessageCount > 0);
                        return [2 /*return*/];
                }
            });
        });
    };
    SQSPoller.prototype._processMessages = function (queue) {
        return __awaiter(this, void 0, void 0, function () {
            var pollConfig, noMessagesResult, processInternal, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pollConfig = this.config.pollConfig;
                        noMessagesResult = { retrievedMessageCount: 0, successMessageCount: 0, failedMessageCount: 0 };
                        processInternal = function () { return __awaiter(_this, void 0, void 0, function () {
                            var response, messages, messageCount, invocationResult, successMessages, successMessageIds, failedMessages, failedMessageIds, results_1, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, queue.sqsClient.send(new client_sqs_1.ReceiveMessageCommand({
                                            QueueUrl: queue.url,
                                            MaxNumberOfMessages: 10
                                        }))];
                                    case 1:
                                        response = _b.sent();
                                        (0, logging_1.logDebug)(response);
                                        messages = response.Messages;
                                        messageCount = (messages === null || messages === void 0 ? void 0 : messages.length) || 0;
                                        if (!(messageCount > 0)) return [3 /*break*/, 8];
                                        (0, logging_1.logDebug)("Retrieved ".concat(messageCount, " messages for '").concat(queue.name));
                                        return [4 /*yield*/, this._invokeHandlersForQueue(queue, messages)];
                                    case 2:
                                        invocationResult = _b.sent();
                                        successMessages = invocationResult.successMessages, successMessageIds = invocationResult.successMessageIds, failedMessages = invocationResult.failedMessages, failedMessageIds = invocationResult.failedMessageIds;
                                        if (!(successMessages.length > 0)) return [3 /*break*/, 4];
                                        (0, logging_1.logDebug)("Successfully handled message Ids: ".concat(setToString(successMessageIds)));
                                        (0, logging_1.logDebug)("Removing successfully handled messages from queue..");
                                        return [4 /*yield*/, queue.sqsClient.send(new client_sqs_1.DeleteMessageBatchCommand({
                                                QueueUrl: queue.url,
                                                Entries: successMessages.map(function (m) { return ({ Id: m.MessageId, ReceiptHandle: m.ReceiptHandle }); })
                                            }))];
                                    case 3:
                                        _b.sent();
                                        _b.label = 4;
                                    case 4:
                                        if (failedMessages.length > 0) {
                                            (0, logging_1.logDebug)("Failed to handle message Ids: ".concat(setToString(failedMessageIds)));
                                        }
                                        if (!pollConfig.drainQueues) return [3 /*break*/, 6];
                                        return [4 /*yield*/, processInternal()];
                                    case 5:
                                        _a = _b.sent();
                                        return [3 /*break*/, 7];
                                    case 6:
                                        _a = noMessagesResult;
                                        _b.label = 7;
                                    case 7:
                                        results_1 = _a;
                                        return [2 /*return*/, {
                                                retrievedMessageCount: messages.length + results_1.retrievedMessageCount,
                                                successMessageCount: successMessages.length + results_1.successMessageCount,
                                                failedMessageCount: failedMessages.length + results_1.failedMessageCount
                                            }];
                                    case 8: return [2 /*return*/, noMessagesResult];
                                }
                            });
                        }); };
                        return [4 /*yield*/, processInternal()];
                    case 1:
                        results = _a.sent();
                        if (results.retrievedMessageCount === 0) {
                            (0, logging_1.logDebug)("No messages for '".concat(queue.name));
                        }
                        return [2 /*return*/, results];
                }
            });
        });
    };
    SQSPoller.prototype._invokeHandlersForQueue = function (queue, messages) {
        return __awaiter(this, void 0, void 0, function () {
            var invokeHandler, event, handlerResults, failedMessageIds, failedMessages, successMessages, successMessageIds;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        invokeHandler = function (handlerName, event) {
                            (0, logging_1.logDebug)("Invoking handler: '".concat(handlerName, "'"));
                            var lambdaFunction = _this.lambda.get(handlerName);
                            lambdaFunction.setEvent(event);
                            return lambdaFunction.runHandler();
                        };
                        event = {
                            Records: messages.map(function (m) { return ({
                                messageId: m.MessageId,
                                receiptHandle: m.ReceiptHandle,
                                body: m.Body,
                                attributes: m.Attributes,
                                messageAttributes: m.MessageAttributes,
                                md5OfBody: m.MD5OfBody,
                                eventSource: "aws:sqs",
                                eventSourceARN: queue.arn,
                                awsRegion: _this.options.region
                            }); })
                        };
                        (0, logging_1.logDebug)("Using event: ", event);
                        return [4 /*yield*/, Promise.all(queue.handlerFunctions.map(function (handlerName) { return invokeHandler(handlerName, event); }))];
                    case 1:
                        handlerResults = _a.sent();
                        failedMessageIds = new Set(handlerResults.map(function (r) {
                            return ((r === null || r === void 0 ? void 0 : r.batchItemFailures) || []).map(function (f) { return f.itemIdentifier; });
                        }).flat());
                        failedMessages = messages.filter(function (m) { return failedMessageIds.has(m.MessageId); });
                        successMessages = messages.filter(function (m) { return !failedMessageIds.has(m.MessageId); });
                        successMessageIds = new Set(successMessages.map(function (v) { return v.MessageId; }));
                        return [2 /*return*/, { failedMessageIds: failedMessageIds, failedMessages: failedMessages, successMessageIds: successMessageIds, successMessages: successMessages }];
                }
            });
        });
    };
    return SQSPoller;
}());
exports["default"] = SQSPoller;
var setToString = function (s) { return "[".concat(Array.from(s).join(', '), "]"); };
