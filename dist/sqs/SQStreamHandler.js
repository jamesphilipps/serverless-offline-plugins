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
exports.SQStreamHandler = void 0;
var logging_1 = require("../logging");
var lambda_1 = require("serverless-offline/dist/lambda");
var SQSPoller_1 = require("./SQSPoller");
var client_sqs_1 = require("@aws-sdk/client-sqs");
var StreamFunctionDefinitions_1 = require("../StreamFunctionDefinitions");
var utils_1 = require("./utils");
var getQueuesToCreate_1 = require("./functions/getQueuesToCreate");
var setupQueues_1 = require("./functions/setupQueues");
var getFunctionQueueDefinitions_1 = require("./functions/getFunctionQueueDefinitions");
var utils_2 = require("../utils");
var getAdditionalQueueDefinitions_1 = require("./functions/getAdditionalQueueDefinitions");
var SQStreamHandler = /** @class */ (function () {
    function SQStreamHandler(serverless, options, config) {
        this.serverless = serverless;
        this.options = options;
        this.config = config;
    }
    SQStreamHandler.prototype.start = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var service, _b, resources, functionsWithSqsEvents, resourceQueueDefinitions, functionQueueDefinitions, additionalQueueDefinitions, queuesToCreate, activeQueueDefinitions, queuesWithFunctionEventHandler, queuesToPoll;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        (0, logging_1.log)("Starting Offline SQS Streams: ".concat(this.options.stage, "/").concat(this.options.region, ".."));
                        service = this.serverless.service;
                        _b = this;
                        return [4 /*yield*/, this._createSQSClient()
                            // TODO: create all lambdas at plugin level and push them down into the handlers. DynamoDbStream Handler has a
                            //  better implementation to create only lambdas with stream events
                        ];
                    case 1:
                        _b.sqsClient = _c.sent();
                        // TODO: create all lambdas at plugin level and push them down into the handlers. DynamoDbStream Handler has a
                        //  better implementation to create only lambdas with stream events
                        this.slsOfflineLambda = new lambda_1["default"](this.serverless, this.options);
                        this.slsOfflineLambda.create((0, utils_2.getHandlersAsLambdaFunctionDefinitions)(this.serverless));
                        resources = (_a = this.serverless.resources) === null || _a === void 0 ? void 0 : _a.Resources;
                        functionsWithSqsEvents = (0, StreamFunctionDefinitions_1.getFunctionDefinitionsWithStreamsEvents)(this.serverless, 'SQS');
                        resourceQueueDefinitions = (0, utils_1.getQueueDefinitionsFromResources)(this.serverless);
                        (0, logging_1.logDebug)("resourceQueueDefinitions", resourceQueueDefinitions);
                        functionQueueDefinitions = (0, getFunctionQueueDefinitions_1["default"])(this.config, resources)(functionsWithSqsEvents);
                        (0, logging_1.logDebug)("functionQueueDefinitions", functionQueueDefinitions);
                        additionalQueueDefinitions = (0, getAdditionalQueueDefinitions_1["default"])(this.config);
                        (0, logging_1.logDebug)("additionalQueueDefinitions", additionalQueueDefinitions);
                        queuesToCreate = (0, getQueuesToCreate_1["default"])(this.config)(resourceQueueDefinitions, functionQueueDefinitions, additionalQueueDefinitions);
                        (0, logging_1.logDebug)("queuesToCreate", queuesToCreate);
                        return [4 /*yield*/, (0, setupQueues_1["default"])(this.config, this.sqsClient)(queuesToCreate)];
                    case 2:
                        activeQueueDefinitions = _c.sent();
                        (0, logging_1.logDebug)("activeQueueDefinitions", activeQueueDefinitions);
                        queuesWithFunctionEventHandler = new Set(functionQueueDefinitions.map(function (queue) { return queue.name; }));
                        queuesToPoll = activeQueueDefinitions.filter(function (queue) { return queuesWithFunctionEventHandler.has(queue.name); });
                        (0, logging_1.logDebug)("queuesToPoll", queuesToPoll);
                        this.sqsPoller = new SQSPoller_1["default"](this.options, this.config, queuesToPoll, this.sqsClient, this.slsOfflineLambda);
                        this.sqsPoller.start();
                        (0, logging_1.log)("Started Offline SQS Streams. ");
                        return [2 /*return*/];
                }
            });
        });
    };
    SQStreamHandler.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cleanupPromises;
            return __generator(this, function (_a) {
                (0, logging_1.log)("Halting Offline SQS Streams..");
                cleanupPromises = [];
                if (this.slsOfflineLambda) {
                    cleanupPromises.push(this.slsOfflineLambda.cleanup());
                }
                if (this.sqsPoller) {
                    cleanupPromises.push(this.sqsPoller.stop());
                }
                return [2 /*return*/, Promise.all(cleanupPromises)];
            });
        });
    };
    SQStreamHandler.prototype._createSQSClient = function () {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, client, e_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        endpoint = (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.sqs) === null || _b === void 0 ? void 0 : _b.host;
                        if (!endpoint) {
                            throw Error("No endpoint specified for Offline SQS Streams");
                        }
                        client = new client_sqs_1.SQSClient({ region: this.options.region, endpoint: endpoint });
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, client.send(new client_sqs_1.ListQueuesCommand({}))];
                    case 2:
                        _e.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _e.sent();
                        if (((_d = (_c = e_1.code) === null || _c === void 0 ? void 0 : _c.trim()) === null || _d === void 0 ? void 0 : _d.toUpperCase()) === 'ECONNREFUSED') {
                            throw Error("An SQS API compatible queue is not available at '".concat(endpoint, "'. Did you forget to start your elasticmq instance?"));
                        }
                        throw e_1;
                    case 4: return [2 /*return*/, client];
                }
            });
        });
    };
    return SQStreamHandler;
}());
exports.SQStreamHandler = SQStreamHandler;