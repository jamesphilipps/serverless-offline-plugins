"use strict";
exports.__esModule = true;
var filterPatterns_1 = require("./filterPatterns");
describe("allowEvent", function () {
    it("ORS multiple rules", function () {
        var patterns = [{ eventName: ['FOO'] }, { eventName: ['BAR'] }];
        expect((0, filterPatterns_1.allowEvent)(patterns, { eventName: 'FOO' })).toBeTruthy();
        expect((0, filterPatterns_1.allowEvent)(patterns, { eventName: 'BAR' })).toBeTruthy();
    });
    describe("eventName", function () {
        it("allows single", function () {
            var pattern = { eventName: ['FOO'] };
            var event = { eventName: 'FOO' };
            expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeTruthy();
        });
        it("rejects single", function () {
            var pattern = { eventName: ['FOO'] };
            var event = { eventName: 'BAR' };
            expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeFalsy();
        });
        it("allows multiple", function () {
            var pattern = { eventName: ['BAZ', 'FOO', 'BAR'] };
            var event = { eventName: 'FOO' };
            expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeTruthy();
        });
        it("rejects multiple", function () {
            var pattern = { eventName: ['FOO', 'BAR'] };
            var event = { eventName: 'BAZ' };
            expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeFalsy();
        });
    });
    describe("dynamodb", function () {
        describe("Keys", function () {
            it("allows single property single pattern", function () {
                var pattern = { dynamodb: { Keys: { prop1: { S: ['FOO'] } } } };
                var event = { dynamodb: { Keys: { prop1: { S: 'FOO' } } } };
                expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeTruthy();
            });
            it("rejects single property single pattern", function () {
                var pattern = { dynamodb: { Keys: { prop1: { S: ['FOO'] } } } };
                var event = { dynamodb: { Keys: { prop1: { S: 'BAR' } } } };
                expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeFalsy();
            });
            it("allows single property multiple pattern", function () {
                var pattern = { dynamodb: { Keys: { prop1: { S: ['BAZ', 'FOO', 'BAR'] } } } };
                var event = { dynamodb: { Keys: { prop1: { S: 'FOO' } } } };
                expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeTruthy();
            });
            it("rejects single property multiple pattern", function () {
                var pattern = { dynamodb: { Keys: { prop1: { S: ['FOO', 'BAR'] } } } };
                var event = { dynamodb: { Keys: { prop1: { S: 'BAZ' } } } };
                expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeFalsy();
            });
            it("allows multiple properties single pattern", function () {
                var pattern = { dynamodb: { Keys: { prop1: { S: ['FOO'] }, prop2: { S: ['BAR'] } } } };
                var event = { dynamodb: { Keys: { prop1: { S: 'FOO' }, prop2: { S: 'BAR' } } } };
                expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeTruthy();
            });
            it("rejects multiple properties single pattern", function () {
                var pattern = { dynamodb: { Keys: { prop1: { S: ['FOO'] }, prop2: { S: ['BAR'] } } } };
                var eventData = [
                    ['FOOZ', 'BAR'],
                    ['FOO', 'BARZ'],
                ];
                eventData.forEach(function (_a) {
                    var prop1 = _a[0], prop2 = _a[1];
                    var event = { dynamodb: { Keys: { prop1: { S: prop1 }, prop2: { S: prop2 } } } };
                    expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeFalsy();
                });
            });
            it("allows multiple properties multiple pattern", function () {
                var pattern = { dynamodb: { Keys: { prop1: { S: ['FOO', 'BAR'] }, prop2: { S: ['BAR', 'BAZ'] } } } };
                var eventData = [
                    ['FOO', 'BAR'],
                    ['FOO', 'BAZ'],
                    ['BAR', 'BAR'],
                    ['BAR', 'BAZ'],
                ];
                eventData.forEach(function (_a) {
                    var prop1 = _a[0], prop2 = _a[1];
                    var event = { dynamodb: { Keys: { prop1: { S: prop1 }, prop2: { S: prop2 } } } };
                    expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeTruthy();
                });
            });
            it("rejects multiple properties multiple pattern", function () {
                var pattern = { dynamodb: { Keys: { prop1: { S: ['FOO', 'BAR'] }, prop2: { S: ['BAR', 'BAZ'] } } } };
                var eventData = [
                    ['FOOZ', 'BAR'],
                    ['FOOZ', 'BAZ'],
                    ['BARZ', 'BAR'],
                    ['BARZ', 'BAZ'],
                    ['FOO', 'BARZ'],
                    ['FOO', 'BAZZ'],
                    ['BAR', 'BARZ'],
                    ['BAR', 'BAZZ'],
                ];
                eventData.forEach(function (_a) {
                    var prop1 = _a[0], prop2 = _a[1];
                    var event = { dynamodb: { Keys: { prop1: { S: prop1 }, prop2: { S: prop2 } } } };
                    expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeFalsy();
                });
            });
            it("allows number", function () {
                var testData = [
                    [[100], 100],
                    [[99, 100, 101], 100]
                ];
                testData.forEach(function (_a) {
                    var patternData = _a[0], eventData = _a[1];
                    var pattern = { dynamodb: { Keys: { prop1: { N: patternData } } } };
                    var event = { dynamodb: { Keys: { prop1: { N: eventData } } } };
                    expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeTruthy();
                });
            });
            it("rejects number", function () {
                var testData = [
                    [[100], 101],
                    [[99, 100, 101], 102]
                ];
                testData.forEach(function (_a) {
                    var patternData = _a[0], eventData = _a[1];
                    var pattern = { dynamodb: { Keys: { prop1: { N: patternData } } } };
                    var event = { dynamodb: { Keys: { prop1: { N: eventData } } } };
                    expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeFalsy();
                });
            });
            it("allows binary", function () {
                var testData = [
                    [["abcd"], "abcd"],
                    [["abcd", "efgh"], "abcd"],
                    [["abcd", "efgh"], "efgh"],
                ];
                testData.forEach(function (_a) {
                    var patternData = _a[0], eventData = _a[1];
                    var pattern = { dynamodb: { Keys: { prop1: { B: patternData } } } };
                    var event = { dynamodb: { Keys: { prop1: { B: eventData } } } };
                    expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeTruthy();
                });
            });
            it("rejects binary", function () {
                var testData = [
                    [["abcd"], "efgh"],
                    [["abcd", "efgh"], "ijkl"],
                ];
                testData.forEach(function (_a) {
                    var patternData = _a[0], eventData = _a[1];
                    var pattern = { dynamodb: { Keys: { prop1: { B: patternData } } } };
                    var event = { dynamodb: { Keys: { prop1: { B: eventData } } } };
                    expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeFalsy();
                });
            });
            it("allows boolean", function () {
                var testData = [
                    [[true], true],
                    [[false, true], true],
                    [[false, true], false]
                ];
                testData.forEach(function (_a) {
                    var patternData = _a[0], eventData = _a[1];
                    var pattern = { dynamodb: { Keys: { prop1: { BOOL: patternData } } } };
                    var event = { dynamodb: { Keys: { prop1: { BOOL: eventData } } } };
                    expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeTruthy();
                });
            });
            it("rejects boolean", function () {
                var testData = [
                    [[true], false],
                    [[false], true],
                ];
                testData.forEach(function (_a) {
                    var patternData = _a[0], eventData = _a[1];
                    var pattern = { dynamodb: { Keys: { prop1: { BOOL: patternData } } } };
                    var event = { dynamodb: { Keys: { prop1: { BOOL: eventData } } } };
                    expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeFalsy();
                });
            });
            it("allows empty rule", function () {
                var pattern = { dynamodb: { Keys: { prop1: { S: [''] } } } };
                var event = { dynamodb: { Keys: { prop1: { S: '' } } } };
                expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeTruthy();
            });
            it("rejects empty rule", function () {
                var pattern = { dynamodb: { Keys: { prop1: { S: [''] } } } };
                var event = { dynamodb: { Keys: { prop1: { S: 'FOO' } } } };
                expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeFalsy();
            });
            it("allows null rule", function () {
                var pattern = { dynamodb: { Keys: { prop1: [null] } } };
                var event = { dynamodb: { Keys: { prop1: { NULL: '' } } } };
                expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeTruthy();
            });
            it("rejects null rule", function () {
                var pattern = { dynamodb: { Keys: { prop1: [null] } } };
                var event = { dynamodb: { Keys: { prop1: { S: 'FOO' } } } };
                expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeFalsy();
            });
            it("allows not rule", function () {
                var testData = [
                    [["FOO"], "BAR"],
                    [["FOO", "BAZ"], "BAR"],
                ];
                testData.forEach(function (_a) {
                    var patternData = _a[0], eventData = _a[1];
                    var pattern = { dynamodb: { Keys: { prop1: [{ "anything-but": patternData }] } } };
                    var event = { dynamodb: { Keys: { prop1: { S: eventData } } } };
                    expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeTruthy();
                });
            });
            it("rejects not rule", function () {
                var testData = [
                    [["FOO"], "FOO"],
                    [["FOO", "BAR"], "BAR"],
                ];
                testData.forEach(function (_a) {
                    var patternData = _a[0], eventData = _a[1];
                    var pattern = { dynamodb: { Keys: { prop1: [{ "anything-but": patternData }] } } };
                    var event = { dynamodb: { Keys: { prop1: { S: eventData } } } };
                    expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeFalsy();
                });
            });
            it("allows numeric rule", function () {
                var testData = [
                    [['=', 1], 1], [['=', 0], 0], [['=', -1], -1],
                    [['<', 2], 1], [['<', 1], 0], [['<', 0], -1],
                    [['<=', 2], 2], [['<=', 2], 1], [['<=', 1], 1], [['<=', 1], 0], [['<=', 0], 0], [['<=', 0], -1], [['<=', -1], -1],
                    [['>', 1], 2], [['>', 0], 1], [['>', -1], 0],
                    [['>=', 2], 2], [['>=', 1], 2], [['>=', 1], 1], [['>=', 0], 1], [['>=', 0], 0], [['>=', -1], 0], [['>=', -1], -1],
                ];
                testData.forEach(function (_a) {
                    var patternData = _a[0], eventData = _a[1];
                    var pattern = { dynamodb: { Keys: { prop1: [{ numeric: patternData }] } } };
                    var event = { dynamodb: { Keys: { prop1: { N: eventData } } } };
                    expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeTruthy();
                });
            });
            it("rejects numeric rule", function () {
                var testData = [
                    [['=', 1], 2], [['=', 0], 1], [['=', -1], -2], [['=', -1], 1], [['=', 1], -1],
                    [['<', 1], 2], [['<', 1], 1], [['<', 0], 1], [['<', 0], 0], [['<', -1], 0], [['<', -1], -1],
                    [['<=', 1], 2], [['<=', 0], 1], [['<=', -1], 0],
                    [['>', 2], 1], [['>', 1], 1], [['>', 1], 0], [['>', 0], 0], [['>', 0], -1], [['>', -1], -1],
                    [['>=', 2], 1], [['>=', 1], 0], [['>=', 0], -1],
                ];
                testData.forEach(function (_a) {
                    var patternData = _a[0], eventData = _a[1];
                    var pattern = { dynamodb: { Keys: { prop1: [{ numeric: patternData }] } } };
                    var event = { dynamodb: { Keys: { prop1: { N: eventData } } } };
                    expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeFalsy();
                });
            });
            it("allows numeric range rule", function () {
                var testData = [
                    [['>', 5, '<', 7], 6],
                    [['>', 5, '<=', 7], 6], [['>', 5, '<=', 7], 7],
                    [['>=', 5, '<', 7], 5], [['>=', 5, '<', 7], 6],
                    [['>=', -1, '<', 2], -1], [['>=', -1, '<', 2], 0], [['>=', -1, '<', 2], 1],
                    [['>', -2, '<=', 1], -1], [['>', -2, '<=', 1], 0], [['>', -2, '<=', 1], 1],
                ];
                testData.forEach(function (_a) {
                    var patternData = _a[0], eventData = _a[1];
                    var pattern = { dynamodb: { Keys: { prop1: [{ numeric: patternData }] } } };
                    var event = { dynamodb: { Keys: { prop1: { N: eventData } } } };
                    expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeTruthy();
                });
            });
            it("rejects numeric range rule", function () {
                var testData = [
                    [['>', 5, '<', 7], 5], [['>', 5, '<', 7], 7],
                    [['>', 5, '<=', 7], 5], [['>', 5, '<=', 7], 8],
                    [['>=', 5, '<', 7], 4], [['>=', 5, '<', 7], 7],
                    [['>=', -1, '<', 2], -2], [['>=', -1, '<', 2], 2],
                    [['>', -2, '<=', 1], -2], [['>', -2, '<=', 1], 2],
                ];
                testData.forEach(function (_a) {
                    var patternData = _a[0], eventData = _a[1];
                    var pattern = { dynamodb: { Keys: { prop1: [{ numeric: patternData }] } } };
                    var event = { dynamodb: { Keys: { prop1: { N: eventData } } } };
                    expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeFalsy();
                });
            });
            it("allows exists rule", function () {
                var testData = [
                    [true, { S: "FOO" }],
                    [true, { N: 1 }],
                    [false, undefined],
                ];
                testData.forEach(function (_a) {
                    var patternData = _a[0], eventData = _a[1];
                    var pattern = { dynamodb: { Keys: { prop1: [{ exists: patternData }] } } };
                    var event = { dynamodb: { Keys: { prop1: eventData } } };
                    expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeTruthy();
                });
            });
            it("rejects exists rule", function () {
                var testData = [
                    [false, { S: "FOO" }],
                    [false, { N: 1 }],
                    [true, undefined],
                ];
                testData.forEach(function (_a) {
                    var patternData = _a[0], eventData = _a[1];
                    var pattern = { dynamodb: { Keys: { prop1: [{ exists: patternData }] } } };
                    var event = { dynamodb: { Keys: { prop1: eventData } } };
                    expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeFalsy();
                });
            });
            it("allows begins with rule", function () {
                var testData = [
                    ["FO", { S: "FOO" }],
                    ["FO", { S: "FO" }],
                    ["BA", { S: "BAR" }],
                    ["BA", { S: "BA" }],
                ];
                testData.forEach(function (_a) {
                    var patternData = _a[0], eventData = _a[1];
                    var pattern = { dynamodb: { Keys: { prop1: [{ prefix: patternData }] } } };
                    var event = { dynamodb: { Keys: { prop1: eventData } } };
                    expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeTruthy();
                });
            });
            it("rejects begins with rule", function () {
                var testData = [
                    ["FO", { S: "1FOO" }],
                    ["BA", { S: "ABAR" }],
                ];
                testData.forEach(function (_a) {
                    var patternData = _a[0], eventData = _a[1];
                    var pattern = { dynamodb: { Keys: { prop1: [{ prefix: patternData }] } } };
                    var event = { dynamodb: { Keys: { prop1: eventData } } };
                    expect((0, filterPatterns_1.allowEvent)([pattern], event)).toBeFalsy();
                });
            });
        });
    });
});
