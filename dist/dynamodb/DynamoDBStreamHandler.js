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
exports.DynamoDBStreamHandler = void 0;
var logging_1 = require("../logging");
var DynamoDBStreamsController_1 = require("./DynamoDBStreamsController");
var support_1 = require("./support");
var lambda_1 = require("serverless-offline/dist/lambda");
var DynamoDBStreamHandler = /** @class */ (function () {
    function DynamoDBStreamHandler(serverless, options) {
        this.serverless = serverless;
        this.options = options;
    }
    DynamoDBStreamHandler.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var service, functions, functionsWithStreamEvents;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        service = this.serverless.service;
                        (0, logging_1.log)("Starting Offline Dynamodb Streams: ".concat(this.options.stage, "/").concat(this.options.region, ".."));
                        this.slsOfflineLambda = new lambda_1["default"](this.serverless, this.options);
                        this.streamsController = new DynamoDBStreamsController_1["default"](this.serverless, this.slsOfflineLambda, this.options);
                        functions = this._getFunctionsWithRawFilterPatterns();
                        functionsWithStreamEvents = (0, support_1.getFunctionsWithStreamEvents)(function (functionKey) { return functions[functionKey]; })(service.getAllFunctions());
                        // Create lambdas
                        this.slsOfflineLambda.create(functionsWithStreamEvents);
                        return [4 /*yield*/, this.streamsController.start(functionsWithStreamEvents)];
                    case 1:
                        _a.sent();
                        (0, logging_1.log)("Started Offline Dynamodb Streams. Created ".concat(this.streamsController.count(), " streams"));
                        return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBStreamHandler.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cleanupPromises;
            return __generator(this, function (_a) {
                (0, logging_1.log)("Halting Offline Dynamodb Streams..");
                cleanupPromises = [];
                if (this.slsOfflineLambda) {
                    cleanupPromises.push(this.slsOfflineLambda.cleanup());
                }
                if (this.streamsController) {
                    cleanupPromises.push(this.streamsController.stop());
                }
                return [2 /*return*/, Promise.all(cleanupPromises)];
            });
        });
    };
    /**
     * For some reason, serverless messes about with event definitions in its functions property and removes the
     * dynamo typings from all event filters. This makes it impossible to properly match the filters. Luckily, the
     * raw configuration has the original structure, so we need to load in the ordinary functions and overwrite any
     * filter pattern fields with the original, unmodified version from the raw config.. why!?
     * @private
     */
    DynamoDBStreamHandler.prototype._getFunctionsWithRawFilterPatterns = function () {
        var service = this.serverless.service;
        var rawFunctionsConfig = this.serverless.configurationInput.functions;
        return Object.fromEntries(service.getAllFunctions().map(function (functionName) {
            var f = service.getFunction(functionName);
            var events = f.events.map(function (event, i) {
                var _a, _b, _c;
                var eventStreamBlock = event.stream;
                return (__assign(__assign({}, event), { stream: eventStreamBlock ? __assign(__assign({}, eventStreamBlock), { filterPatterns: (_c = (_b = (_a = rawFunctionsConfig[functionName]) === null || _a === void 0 ? void 0 : _a.events[i]) === null || _b === void 0 ? void 0 : _b.stream) === null || _c === void 0 ? void 0 : _c.filterPatterns }) : undefined }));
            });
            return [functionName, __assign(__assign({}, f), { events: events })];
        }));
    };
    return DynamoDBStreamHandler;
}());
exports.DynamoDBStreamHandler = DynamoDBStreamHandler;
