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
exports.createAndActivateQueues = void 0;
var client_sqs_1 = require("@aws-sdk/client-sqs");
var utils_1 = require("../utils");
var utils_2 = require("../../utils");
var getQueueDetails = function (sqsClient, QueueUrl) { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, sqsClient.send(new client_sqs_1.GetQueueAttributesCommand({
                    QueueUrl: QueueUrl,
                    AttributeNames: ['QueueArn']
                }))];
            case 1:
                response = _a.sent();
                return [2 /*return*/, {
                        name: (0, utils_1.getQueueNameFromArnString)(response.Attributes.QueueArn),
                        url: QueueUrl,
                        arn: response.Attributes.QueueArn
                    }];
        }
    });
}); };
var getExistingQueues = function (sqsClient) { return __awaiter(void 0, void 0, void 0, function () {
    var existingQueues;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, sqsClient.send(new client_sqs_1.ListQueuesCommand({}))];
            case 1:
                existingQueues = _a.sent();
                return [4 /*yield*/, Promise.all(((existingQueues === null || existingQueues === void 0 ? void 0 : existingQueues.QueueUrls) || []).map(function (QueueUrl) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, getQueueDetails(sqsClient, QueueUrl)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    }); }); }))];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var createQueues = function (sqsClient, queueDefinitions) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, Promise.all(queueDefinitions.map(function (queue) { return __awaiter(void 0, void 0, void 0, function () {
                var createResult, details;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, sqsClient.send(new client_sqs_1.CreateQueueCommand({
                                QueueName: queue.name,
                                Attributes: {
                                    VisibilityTimeout: (_a = queue.visibilityTimeout) === null || _a === void 0 ? void 0 : _a.toString(),
                                    DelaySeconds: (_b = queue.delaySeconds) === null || _b === void 0 ? void 0 : _b.toString(),
                                    FifoQueue: queue.fifo || false
                                }
                            }))];
                        case 1:
                            createResult = _c.sent();
                            return [4 /*yield*/, getQueueDetails(sqsClient, createResult.QueueUrl)];
                        case 2:
                            details = _c.sent();
                            return [2 /*return*/, __assign(__assign(__assign({}, queue), details), { sqsClient: sqsClient })];
                    }
                });
            }); }))];
    });
}); };
var createAndActivateLocalQueues = function (config, sqsClient, definedQueues) { return __awaiter(void 0, void 0, void 0, function () {
    var queuesToActivate, existingQueues, existingQueueNames, queuesToCreate, createdActiveQueues, createdQueueNames, queuesToActivateByName, existingActiveQueues;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                queuesToActivate = definedQueues
                    .filter(function (queue) { return config.localQueueManagement.createFromResources || queue.source !== 'RESOURCES'; }) // Filter resource queues if flag set
                ;
                return [4 /*yield*/, getExistingQueues(sqsClient)];
            case 1:
                existingQueues = _a.sent();
                existingQueueNames = new Set(existingQueues.map(function (queue) { return queue.name; }));
                queuesToCreate = config.localQueueManagement.createFromResources ?
                    queuesToActivate
                        .filter(function (queue) { return !existingQueueNames.has(queue.name); }) // Doesn't exist
                        .filter(function (queue) { return queue.create !== false; }) : // Not excluded from creation
                    [];
                return [4 /*yield*/, createQueues(sqsClient, queuesToCreate)];
            case 2:
                createdActiveQueues = _a.sent();
                createdQueueNames = new Set(createdActiveQueues.map(function (queue) { return queue.name; }));
                queuesToActivateByName = (0, utils_2.mapBy)(queuesToActivate, function (v) { return v.name; });
                existingActiveQueues = existingQueues
                    .filter(function (queue) { return !!queuesToActivateByName[queue.name]; }) // Queue is defined
                    .filter(function (queue) { return !createdQueueNames.has(queue.name); }) // Queue was not just created
                    .map(function (queue) { return (__assign(__assign({ sqsClient: sqsClient }, queuesToActivateByName[queue.name]), queue // Queue ARN and URI
                )); });
                return [2 /*return*/, createdActiveQueues.concat(existingActiveQueues)];
        }
    });
}); };
var activateRemoteQueues = function (createSQSClient, config, definedQueues) { return __awaiter(void 0, void 0, void 0, function () {
    var queuesToActivate, endpointRegex;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                queuesToActivate = definedQueues;
                endpointRegex = /https?:\/\/sqs\.([^.]+)\.amazonaws\.com/;
                return [4 /*yield*/, Promise.all(queuesToActivate
                        .map(function (queue) { return __awaiter(void 0, void 0, void 0, function () {
                        var endpointMatch, sqsClient, queueDetails;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    endpointMatch = queue.endpoint.match(endpointRegex);
                                    if (!endpointMatch) {
                                        throw Error("Invalid remote endpoint for remote queue: '".concat(queue.endpoint, "'. Remote endpoints should be in the form: \"http(s)://sqs.REGION.amazonaws.com\""));
                                    }
                                    return [4 /*yield*/, createSQSClient(endpointMatch[1], queue.endpoint)];
                                case 1:
                                    sqsClient = _a.sent();
                                    return [4 /*yield*/, getQueueDetails(sqsClient, queue.url)];
                                case 2:
                                    queueDetails = _a.sent();
                                    return [2 /*return*/, __assign(__assign({ sqsClient: sqsClient }, queue), { url: queueDetails.url, arn: queueDetails.arn })];
                            }
                        });
                    }); }))];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var createAndActivateQueues = function (createSQSClient, config, sqsClient, definedQueues) { return __awaiter(void 0, void 0, void 0, function () {
    var queuesWithTarget, activeLocalQueues, activeRemoteQueues;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                queuesWithTarget = function (targetType) { return definedQueues.filter(function (v) { return v.targetType === targetType; }); };
                return [4 /*yield*/, createAndActivateLocalQueues(config, sqsClient, queuesWithTarget('LOCAL'))];
            case 1:
                activeLocalQueues = _a.sent();
                return [4 /*yield*/, activateRemoteQueues(createSQSClient, config, queuesWithTarget('REMOTE'))];
            case 2:
                activeRemoteQueues = _a.sent();
                return [2 /*return*/, activeLocalQueues.concat(activeRemoteQueues)];
        }
    });
}); };
exports.createAndActivateQueues = createAndActivateQueues;
exports["default"] = exports.createAndActivateQueues;
