"use strict";
exports.__esModule = true;
var utils_1 = require("./utils");
var constants_1 = require("./constants");
describe('utils', function () {
    describe('getPluginConfiguration', function () {
        it('retrieves plugin configuration from serverless', function () {
            var _a;
            var config = { sqs: { enabled: true } };
            var serverless = {
                service: {
                    custom: (_a = {},
                        _a[constants_1.SLS_CUSTOM_OPTION] = config,
                        _a)
                }
            };
            expect((0, utils_1.getPluginConfiguration)(serverless)).toEqual(config);
        });
    });
    describe('extractResourceNameFromArn', function () {
        var mappings = { k1: "MAP1", k2: "MAP2" };
        var resources = { k3: { name: "RES3" }, k4: { name: "RES4" } };
        var func = (0, utils_1.extractResourceNameFromArn)(function (parts) { return parts[2]; }, function (key) { var _a; return (_a = resources[key]) === null || _a === void 0 ? void 0 : _a.name; }, 'MAPPINGS_PATH', function (key) { return mappings[key]; });
        it('extracts name from aws arn using provided function', function () {
            expect(func('arn:aws:MY_RES')).toEqual('MY_RES');
        });
        it('extracts name from output reference using provided function', function () {
            expect(func('k1')).toEqual('MAP1');
            expect(func('k2')).toEqual('MAP2');
        });
        it('extracts name from "Fn::ImportValue" reference using provided function', function () {
            expect(func({ "Fn::ImportValue": 'k1' })).toEqual('MAP1');
        });
        it('extracts name from resources using provided function', function () {
            expect(func(['k3', 'ARN'])).toEqual('RES3');
            expect(func(['k4', 'ARN'])).toEqual('RES4');
        });
        it('extracts name from Fn::GetAtt reference using provided function', function () {
            expect(func({ 'Fn::GetAtt': ['k3', 'ARN'] })).toEqual('RES3');
            expect(func({ 'Fn::GetAtt': ['k4', 'ARN'] })).toEqual('RES4');
        });
        it('extracts name from Fn::Ref reference using provided function', function () {
            expect(func({ 'Fn::Ref': 'k3' })).toEqual('RES3');
            expect(func({ 'Fn::Ref': 'k4' })).toEqual('RES4');
        });
        it('throws meaningful error if cannot find resource ARN', function () {
            expect(function () { return func(['k7', 'ARN']); }).toThrow("No resource defined with key: 'k7'. Add a resource with this key");
        });
        it('throws meaningful error if cannot find mapping ARN', function () {
            expect(function () { return func('k7'); }).toThrow("No resource name mapping for arn: 'k7'. Add a mapping at 'MAPPINGS_PATH'");
        });
        it('throws meaningful error if cannot detect ARN format from list', function () {
            expect(function () { return func(['k3']); }).toThrow("Cannot resolve arn: '[\"k3\"]' to a resource name");
        });
        it('throws meaningful error if cannot detect ARN format from object', function () {
            expect(function () { return func({ Unknown: "K1" }); }).toThrow("Cannot resolve arn: '{\"Unknown\":\"K1\"}' to a resource name");
        });
    });
});
