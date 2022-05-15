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
var StreamFunctionDefinitions_1 = require("../StreamFunctionDefinitions");
var utils_1 = require("../utils");
var bindHandlersToQueues_1 = require("./functions/bindHandlersToQueues");
var getDefinedQueues_1 = require("./functions/getDefinedQueues");
var deleteQueues_1 = require("./functions/deleteQueues");
var purgeQueues_1 = require("./functions/purgeQueues");
var createAndActivateQueues_1 = require("./functions/createAndActivateQueues");
var createSQSClient_1 = require("./functions/createSQSClient");
var SQStreamHandler = /** @class */ (function () {
    function SQStreamHandler(serverless, options, config) {
        this.serverless = serverless;
        this.options = options;
        this.config = config;
    }
    SQStreamHandler.prototype.start = function () {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, _c, stage, region, resources, localSqsClient, definedQueues, activeQueues, functionsWithSqsEvents, boundQueues;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        endpoint = this.config.endpoint;
                        _c = this.options, stage = _c.stage, region = _c.region;
                        resources = (_b = (_a = this.serverless.service) === null || _a === void 0 ? void 0 : _a.resources) === null || _b === void 0 ? void 0 : _b.Resources;
                        (0, logging_1.log)("Starting Offline SQS Streams: ".concat(stage, "/").concat(region, ".."));
                        return [4 /*yield*/, (0, createSQSClient_1["default"])(region, endpoint)];
                    case 1:
                        localSqsClient = _d.sent();
                        this.slsOfflineLambda = new lambda_1["default"](this.serverless, this.options);
                        this.slsOfflineLambda.create((0, utils_1.getHandlersAsLambdaFunctionDefinitions)(this.serverless));
                        definedQueues = (0, getDefinedQueues_1["default"])(this.config, resources);
                        (0, logging_1.logDebug)("definedQueues", definedQueues);
                        if (!this.config.localQueueManagement.removeOnStart) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, deleteQueues_1["default"])(localSqsClient)];
                    case 2:
                        _d.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        if (!this.config.localQueueManagement.purgeOnStart) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, purgeQueues_1["default"])(localSqsClient)];
                    case 4:
                        _d.sent();
                        _d.label = 5;
                    case 5: return [4 /*yield*/, (0, createAndActivateQueues_1["default"])(createSQSClient_1["default"], this.config, localSqsClient, definedQueues)];
                    case 6:
                        activeQueues = _d.sent();
                        (0, logging_1.logDebug)("activeQueues", activeQueues);
                        functionsWithSqsEvents = (0, StreamFunctionDefinitions_1.getFunctionDefinitionsWithStreamsEvents)(this.serverless, 'SQS');
                        boundQueues = (0, bindHandlersToQueues_1["default"])(this.config, resources, activeQueues, functionsWithSqsEvents);
                        (0, logging_1.logDebug)("boundQueues", boundQueues);
                        // Start polling for bound queues
                        this.sqsPoller = new SQSPoller_1["default"](this.options, this.config, boundQueues, this.slsOfflineLambda);
                        this.sqsPoller.start();
                        (0, logging_1.log)("Started Offline SQS Streams. ");
                        return [2 /*return*/];
                }
            });
        });
    };
    SQStreamHandler.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, logging_1.log)("Halting Offline SQS Streams..");
                return [2 /*return*/, Promise.all([
                        this.slsOfflineLambda ? this.slsOfflineLambda.cleanup() : Promise.resolve(),
                        this.sqsPoller ? this.sqsPoller.stop() : Promise.resolve()
                    ])];
            });
        });
    };
    return SQStreamHandler;
}());
exports.SQStreamHandler = SQStreamHandler;
