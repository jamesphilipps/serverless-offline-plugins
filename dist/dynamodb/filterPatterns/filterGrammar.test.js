"use strict";
// noinspection JSUnusedAssignment
exports.__esModule = true;
describe("Filter Grammar", function () {
    it("compiles correctly", function () {
        // Test grammar for filters against the typescript compiler. All of these rules are valid
        var f;
        // Simple dynamo scalars + OR logic
        f = { S: ['FOO'] };
        f = { S: ['FOO', 'BAR'] };
        f = { N: [1] };
        f = { N: [1, 2] };
        f = { B: ['abcd'] };
        f = { B: ['abcd', 'efgh'] };
        f = { BOOL: [true] };
        f = { BOOL: [false] };
        f = { BOOL: [true, false] };
        f = { NULL: "" };
        // Single rules
        var nullRule = null;
        var emptyRule = "";
        var numericEqualsRule = { numeric: ['=', 100] };
        var stringNotRule = { 'anything-but': ['FOO'] };
        var stringNotRuleOR = { 'anything-but': ['FOO', 'BAR'] };
        var numericNotRule = { 'anything-but': [1] };
        var numericNotRuleOR = { 'anything-but': [1, 2] };
        var existsRule = { exists: true };
        var notExistsRule = { exists: false };
        var beginsWithRule = { prefix: 'FOO' };
        f = [nullRule];
        f = [emptyRule];
        f = [numericEqualsRule];
        f = [stringNotRule];
        f = [stringNotRuleOR];
        f = [numericNotRule];
        f = [numericNotRuleOR];
        f = [existsRule];
        f = [notExistsRule];
        f = [beginsWithRule];
        // Combination rule
        f = [nullRule, emptyRule, numericEqualsRule];
    });
});
