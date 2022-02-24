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
var constants_1 = require("../constants");
var logging_1 = require("../logging");
var client_sqs_1 = require("@aws-sdk/client-sqs");
var SQSPoller = /** @class */ (function () {
    function SQSPoller(options, config, queueDefinitions, sqsClient, lambda) {
        this.options = options;
        this.config = config;
        this.queueDefinitions = queueDefinitions;
        this.sqsClient = sqsClient;
        this.lambda = lambda;
    }
    SQSPoller.prototype.start = function () {
        this.pollInterval = setInterval(this._poll.bind(this), constants_1.DEFAULT_SQS_POLL_INTERVAL_MS);
    };
    SQSPoller.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                clearInterval(this.pollInterval);
                return [2 /*return*/];
            });
        });
    };
    SQSPoller.prototype._poll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var processMessages, _i, _a, queue;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        processMessages = function (queue) { return __awaiter(_this, void 0, void 0, function () {
                            var activeHandlers, messageCount, _loop_1, this_1;
                            var _this = this;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        activeHandlers = [];
                                        messageCount = 0;
                                        _loop_1 = function () {
                                            var response, messageCount_1, event_1;
                                            return __generator(this, function (_c) {
                                                switch (_c.label) {
                                                    case 0: return [4 /*yield*/, this_1.sqsClient.send(new client_sqs_1.ReceiveMessageCommand({
                                                            QueueUrl: queue.queueUrl
                                                        }))];
                                                    case 1:
                                                        response = _c.sent();
                                                        messageCount_1 = ((_a = response.Messages) === null || _a === void 0 ? void 0 : _a.length) || 0;
                                                        if (messageCount_1 > 0) {
                                                            (0, logging_1.log)("Retrieved ".concat(messageCount_1, " messages for '").concat(queue.name));
                                                            event_1 = {
                                                                Records: response.Messages.map(function (message) { return ({
                                                                    messageId: message.MessageId,
                                                                    receiptHandle: message.ReceiptHandle,
                                                                    body: message.Body,
                                                                    attributes: message.Attributes,
                                                                    messageAttributes: message.MessageAttributes,
                                                                    md5OfBody: message.MD5OfBody,
                                                                    eventSource: "aws:sqs",
                                                                    eventSourceARN: queue.queueArn,
                                                                    awsRegion: _this.options.region
                                                                }); })
                                                            };
                                                            (0, logging_1.logDebug)("lambda event input", JSON.stringify(event_1));
                                                            queue.handlerFunctions.forEach(function (handlerFunction) {
                                                                (0, logging_1.logDebug)("lambda name", handlerFunction);
                                                                var lambdaFunction = _this.lambda.get(handlerFunction);
                                                                (0, logging_1.logDebug)("lambda definition", JSON.stringify(lambdaFunction));
                                                                lambdaFunction.setEvent(event_1);
                                                                activeHandlers.push(lambdaFunction.runHandler());
                                                            });
                                                        }
                                                        else {
                                                            (0, logging_1.logDebug)("No messages for '".concat(queue.name));
                                                        }
                                                        return [2 /*return*/];
                                                }
                                            });
                                        };
                                        this_1 = this;
                                        _b.label = 1;
                                    case 1: return [5 /*yield**/, _loop_1()];
                                    case 2:
                                        _b.sent();
                                        _b.label = 3;
                                    case 3:
                                        if (messageCount > 0) return [3 /*break*/, 1];
                                        _b.label = 4;
                                    case 4: return [2 /*return*/, Promise.all(activeHandlers)];
                                }
                            });
                        }); };
                        (0, logging_1.logDebug)("Polling SQS queues..");
                        _i = 0, _a = this.queueDefinitions;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        queue = _a[_i];
                        (0, logging_1.logDebug)("Polling SQS queue: '".concat(queue.name, "'"));
                        return [4 /*yield*/, processMessages(queue)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        (0, logging_1.logDebug)("Finished polling SQS queues");
                        return [2 /*return*/];
                }
            });
        });
    };
    return SQSPoller;
}());
exports["default"] = SQSPoller;
