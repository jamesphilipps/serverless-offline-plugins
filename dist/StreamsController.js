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
var stream_1 = require("stream");
var DynamodbStreamsReadable = require("dynamodb-streams-readable");
var logging_1 = require("./logging");
var constants_1 = require("./constants");
var filterPatterns_1 = require("./filterPatterns/filterPatterns");
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var DynamodbStreamsClient = require("aws-sdk/clients/dynamodbstreams");
var StreamsController = /** @class */ (function () {
    function StreamsController(serverless, lambda, options) {
        this.serverless = serverless;
        this.lambda = lambda;
        this.options = options;
        this.readableStreams = [];
        this.serverless = serverless;
        this.dynamodbClient = new client_dynamodb_1.DynamoDBClient(this.options);
        this.dynamodbStreamsClient = new DynamodbStreamsClient(this.options);
    }
    StreamsController.prototype.start = function (functionEvents) {
        var _this = this;
        return Promise.all(functionEvents.flatMap(function (functionEvent) {
            var functionKey = functionEvent.functionKey, events = functionEvent.events;
            return events
                .filter(function (event) { return event.stream.enabled !== false; })
                .map(function (event) { return __awaiter(_this, void 0, void 0, function () {
                var tableName, LatestStreamArn, streamDesc, shards, shardStreams;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            (0, logging_1.logDebug)("Creating stream for event", event);
                            tableName = this._extractTableNameFromARN(event.stream.arn);
                            return [4 /*yield*/, this._describeTable(tableName)];
                        case 1:
                            LatestStreamArn = (_a.sent()).Table.LatestStreamArn;
                            return [4 /*yield*/, this.dynamodbStreamsClient.describeStream({ StreamArn: LatestStreamArn }).promise()];
                        case 2:
                            streamDesc = _a.sent();
                            shards = streamDesc.StreamDescription.Shards;
                            shardStreams = shards
                                .map(function (shard) { return _this._createStream(functionKey, LatestStreamArn, shard.ShardId, event); });
                            this.readableStreams.push(shardStreams);
                            return [2 /*return*/];
                    }
                });
            }); });
        }));
    };
    StreamsController.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.readableStreams.forEach(function (r) { return r.close(); });
                return [2 /*return*/];
            });
        });
    };
    StreamsController.prototype.count = function () {
        return this.readableStreams.length;
    };
    StreamsController.prototype._describeTable = function (TableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, client_dynamodb_1.waitUntilTableExists)({
                            client: this.dynamodbClient,
                            maxWaitTime: 10,
                            minDelay: 1
                        }, { TableName: TableName })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.dynamodbClient.send(new client_dynamodb_1.DescribeTableCommand({ TableName: TableName }))];
                }
            });
        });
    };
    StreamsController.prototype._extractTableNameFromARN = function (arn) {
        var _a, _b, _c, _d;
        console.log("ARN", arn);
        if (typeof arn === 'string') {
            console.log("ARN2");
            if (arn.startsWith("arn:")) {
                // AWS Arn. Parse the table name from the string
                var _e = arn.split(":"), TableURI = _e[5];
                var _f = TableURI.split("/"), TableName = _f[1];
                return TableName;
            }
            else {
                console.log("ARN3");
                // Probably an output reference. Use directly as a key to the custom resources table
                var tableName = (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.tableNames) === null || _b === void 0 ? void 0 : _b[arn];
                if (!tableName)
                    throw Error("No table name mapping entry for stream arn: '".concat(arn, "'. Add a mapping at 'custom.").concat(constants_1.SLS_CUSTOM_OPTION, ".tableNames.").concat(arn, "'"));
                return tableName;
            }
        }
        else if (Array.isArray(arn) && arn.length === 2 && arn[1] === 'StreamArn') {
            console.log("ARN4");
            // An attribute reference to a resource defined within the stack. Check the defined resources
            var resources = this.serverless.service.resources.Resources;
            var resourceKey = arn[0];
            var tableName = (_d = (_c = resources[resourceKey]) === null || _c === void 0 ? void 0 : _c.Properties) === null || _d === void 0 ? void 0 : _d.TableName;
            if (!tableName)
                throw Error("Could not find table name at '".concat(resourceKey, ".Properties.TableName'"));
            return tableName;
        }
        throw Error("Cannot resolve arn: ".concat(arn, " to a table name"));
    };
    StreamsController.prototype._createStream = function (functionKey, LatestStreamArn, shardId, event) {
        var _this = this;
        var region = this.options.region;
        var _a = event.stream, batchSize = _a.batchSize, arn = _a.arn;
        var applyEventFilters = function (filterPatterns, event) {
            (0, logging_1.logDebug)("filterPatterns", filterPatterns);
            (0, logging_1.logDebug)("event", event);
            if (!filterPatterns || filterPatterns.length == 0 || (0, filterPatterns_1.allowEvent)(filterPatterns, event)) {
                return true;
            }
            else {
                (0, logging_1.log)("Filtered DynamoDb streams event");
                return false;
            }
        };
        var enrichRecord = function (record) { return (__assign(__assign({}, record), { awsRegion: region, eventSourceArn: arn })); };
        var readable = DynamodbStreamsReadable(this.dynamodbStreamsClient, LatestStreamArn, {
            shardId: shardId,
            limit: batchSize,
            iterator: 'LATEST'
        });
        var writable = new stream_1.Writable({
            objectMode: true,
            write: function (records, _, cb) {
                (0, logging_1.log)("Received ".concat(records.length, " DynamoDb streams events"));
                (0, logging_1.logDebug)(event);
                var filterPatterns = event.stream.filterPatterns;
                var filteredRecords = records
                    .filter(function (r) { return applyEventFilters(filterPatterns, r); })
                    .map(function (r) { return enrichRecord(r); });
                if (filteredRecords.length > 0) {
                    var lambdaFunction = _this.lambda.get(functionKey);
                    lambdaFunction.setEvent({ Records: filteredRecords });
                    // Run handler and return on completion
                    lambdaFunction.runHandler()
                        .then(function () { return cb(); })["catch"](cb);
                }
                else {
                    // Return immediately
                    cb();
                }
            }
        });
        readable.pipe(writable);
        return readable;
    };
    return StreamsController;
}());
exports["default"] = StreamsController;
