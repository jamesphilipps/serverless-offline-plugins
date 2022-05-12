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
var logging_1 = require("./logging");
var server_1 = require("./server");
var store_1 = require("./store");
var Secret_1 = require("./Secret");
var SLS_CUSTOM_OPTION = 'secrets-manager-simulator';
var DEFAULT_PORT = 8007;
// TODO: support only valid secret name characters
var ServerlessSecretsManagerSimulatorPlugin = /** @class */ (function () {
    function ServerlessSecretsManagerSimulatorPlugin(serverless, cliOptions) {
        this.serverless = serverless;
        this.cliOptions = cliOptions;
        this.commands = [];
        (0, logging_1.setLog)(function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return (_a = serverless.cli).log.apply(_a, args);
        });
        this.options = mergeOptions(serverless, cliOptions);
        (0, logging_1.logDebug)('options:', JSON.stringify(this.options || {}, undefined, 2));
        this.hooks = {
            "offline:start:init": this.start.bind(this),
            "offline:start:end": this.end.bind(this)
        };
        this.secretStore = this._createSecretStore();
    }
    ServerlessSecretsManagerSimulatorPlugin.prototype.start = function () {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var enableDebugEndpoint, context, port;
            return __generator(this, function (_c) {
                (0, logging_1.log)('Starting Secrets Manager Simulator..');
                enableDebugEndpoint = (_a = this._getPluginOptions()) === null || _a === void 0 ? void 0 : _a.enableDebugEndpoint;
                context = {
                    secretStore: this.secretStore,
                    region: this.serverless.service.provider.region,
                    enableDebugEndpoint: enableDebugEndpoint !== undefined ? enableDebugEndpoint : true
                };
                port = ((_b = this.options[SLS_CUSTOM_OPTION]) === null || _b === void 0 ? void 0 : _b.port) || DEFAULT_PORT;
                this.server = (0, server_1.createAndStartServer)(port, (0, server_1.createRequestListener)(context));
                (0, logging_1.log)("Started Secrets Manager Simulator at http://localhost:".concat(port));
                return [2 /*return*/];
            });
        });
    };
    ServerlessSecretsManagerSimulatorPlugin.prototype.end = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, logging_1.log)("Halting Secrets Manager Simulator..");
                return [2 /*return*/];
            });
        });
    };
    ServerlessSecretsManagerSimulatorPlugin.prototype._createSecretStore = function () {
        var _a;
        var region = this.serverless.service.provider.region;
        var store = new store_1.SecretStore();
        var secrets = (_a = this._getPluginOptions()) === null || _a === void 0 ? void 0 : _a.secrets;
        if (secrets) {
            secrets.forEach(function (s) { return store.add(s.name, (0, Secret_1.createSecret)(region, s.name, s.value)); });
            (0, logging_1.log)("Seeded ".concat(secrets.length, " secrets"));
        }
        return store;
    };
    ServerlessSecretsManagerSimulatorPlugin.prototype._getPluginOptions = function () {
        return this.options[SLS_CUSTOM_OPTION];
    };
    return ServerlessSecretsManagerSimulatorPlugin;
}());
exports["default"] = ServerlessSecretsManagerSimulatorPlugin;
var mergeOptions = function (serverless, cliOptions) {
    var _a;
    var _b = serverless.service.custom, custom = _b === void 0 ? {} : _b;
    var customOptions = custom[SLS_CUSTOM_OPTION];
    var extraOptions = {
        region: serverless.service.provider.region
    };
    return __assign(__assign((_a = {}, _a[SLS_CUSTOM_OPTION] = customOptions, _a), extraOptions), cliOptions);
};
module.exports = ServerlessSecretsManagerSimulatorPlugin;
