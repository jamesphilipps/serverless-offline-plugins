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
exports.setupQueues = exports.createQueues = exports.getQueuesToCreate = exports.getAllExistingQueuesDetails = exports.getSingleQueueDetails = exports.deleteOrPurgeQueuesIfRequired = void 0;
var client_sqs_1 = require("@aws-sdk/client-sqs");
var logging_1 = require("../../logging");
var utils_1 = require("../utils");
var deleteOrPurgeQueuesIfRequired = function (sqsClient, removeExistingQueuesOnStart, purgeExistingQueuesOnStart) { return __awaiter(void 0, void 0, void 0, function () {
    var existingQueues, existingQueueCount;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!removeExistingQueuesOnStart && !purgeExistingQueuesOnStart) {
                    return [2 /*return*/];
                }
                return [4 /*yield*/, sqsClient.send(new client_sqs_1.ListQueuesCommand({}))];
            case 1:
                existingQueues = _b.sent();
                existingQueueCount = ((_a = existingQueues.QueueUrls) === null || _a === void 0 ? void 0 : _a.length) || 0;
                if (!(removeExistingQueuesOnStart && existingQueueCount > 0)) return [3 /*break*/, 3];
                (0, logging_1.logDebug)("Removing existing queues..");
                return [4 /*yield*/, Promise.all(existingQueues.QueueUrls.map(function (QueueUrl) { return sqsClient.send(new client_sqs_1.DeleteQueueCommand({ QueueUrl: QueueUrl })); }))];
            case 2:
                _b.sent();
                return [3 /*break*/, 5];
            case 3:
                if (!(purgeExistingQueuesOnStart && existingQueueCount > 0)) return [3 /*break*/, 5];
                (0, logging_1.logDebug)("Purging existing queues..");
                return [4 /*yield*/, Promise.all(existingQueues.QueueUrls.map(function (QueueUrl) { return sqsClient.send(new client_sqs_1.PurgeQueueCommand({ QueueUrl: QueueUrl })); }))];
            case 4:
                _b.sent();
                _b.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.deleteOrPurgeQueuesIfRequired = deleteOrPurgeQueuesIfRequired;
var getSingleQueueDetails = function (sqsClient, QueueUrl) { return __awaiter(void 0, void 0, void 0, function () {
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
                        queueUrl: QueueUrl,
                        queueArn: response.Attributes.QueueArn
                    }];
        }
    });
}); };
exports.getSingleQueueDetails = getSingleQueueDetails;
var getAllExistingQueuesDetails = function (sqsClient) { return __awaiter(void 0, void 0, void 0, function () {
    var existingQueues, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, sqsClient.send(new client_sqs_1.ListQueuesCommand({}))];
            case 1:
                existingQueues = _c.sent();
                _b = (_a = Object).fromEntries;
                return [4 /*yield*/, Promise.all(((existingQueues === null || existingQueues === void 0 ? void 0 : existingQueues.QueueUrls) || []).map(function (QueueUrl) { return __awaiter(void 0, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (0, exports.getSingleQueueDetails)(sqsClient, QueueUrl)];
                                case 1:
                                    details = _a.sent();
                                    return [2 /*return*/, [details.name, details]];
                            }
                        });
                    }); }))];
            case 2: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
        }
    });
}); };
exports.getAllExistingQueuesDetails = getAllExistingQueuesDetails;
var getQueuesToCreate = function (queueDefinitions, existingQueues) { return __awaiter(void 0, void 0, void 0, function () {
    var existingQueueNames;
    return __generator(this, function (_a) {
        existingQueueNames = new Set(Object.keys(existingQueues));
        if (existingQueueNames.size === 0) {
            return [2 /*return*/, queueDefinitions];
        }
        return [2 /*return*/, queueDefinitions.filter(function (queue) { return !existingQueueNames.has(queue.name); })];
    });
}); };
exports.getQueuesToCreate = getQueuesToCreate;
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
                                    FifoQueue: queue.fifo.toString()
                                }
                            }))];
                        case 1:
                            createResult = _c.sent();
                            return [4 /*yield*/, (0, exports.getSingleQueueDetails)(sqsClient, createResult.QueueUrl)];
                        case 2:
                            details = _c.sent();
                            return [2 /*return*/, __assign(__assign({}, queue), details)];
                    }
                });
            }); }))];
    });
}); };
exports.createQueues = createQueues;
var getActiveQueueDefs = function (queueDefinitions, existingQueues) {
    var queueDefMap = Object.fromEntries(queueDefinitions.map(function (queue) { return [queue.name, queue]; }));
    return Object.entries(existingQueues)
        .map(function (_a) {
        var queueName = _a[0], existingQueue = _a[1];
        var queueDef = queueDefMap[queueName];
        if (queueDef) {
            return __assign(__assign({}, queueDef), existingQueue);
        }
    })
        .filter(function (v) { return !!v; });
};
var setupQueues = function (config, sqsClient) { return function (queueDefinitions) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, removeExistingQueuesOnStart, purgeExistingQueuesOnStart, existingQueues, queuesToCreate, createdQueues;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = config.sqs, removeExistingQueuesOnStart = _a.removeExistingQueuesOnStart, purgeExistingQueuesOnStart = _a.purgeExistingQueuesOnStart;
                return [4 /*yield*/, (0, exports.deleteOrPurgeQueuesIfRequired)(sqsClient, removeExistingQueuesOnStart, purgeExistingQueuesOnStart)];
            case 1:
                _b.sent();
                return [4 /*yield*/, (0, exports.getAllExistingQueuesDetails)(sqsClient)];
            case 2:
                existingQueues = _b.sent();
                return [4 /*yield*/, (0, exports.getQueuesToCreate)(queueDefinitions, existingQueues)];
            case 3:
                queuesToCreate = _b.sent();
                return [4 /*yield*/, (0, exports.createQueues)(sqsClient, queuesToCreate)];
            case 4:
                createdQueues = _b.sent();
                return [2 /*return*/, getActiveQueueDefs(queueDefinitions, existingQueues).concat(createdQueues)];
        }
    });
}); }; };
exports.setupQueues = setupQueues;
exports["default"] = exports.setupQueues;
