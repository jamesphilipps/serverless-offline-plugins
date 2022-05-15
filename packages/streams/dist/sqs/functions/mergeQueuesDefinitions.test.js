"use strict";
exports.__esModule = true;
var mergeQueueDefinitions_1 = require("./mergeQueueDefinitions");
var testHelpers_1 = require("../testHelpers");
describe('mergeQueueDefinitions', function () {
    var func = mergeQueueDefinitions_1["default"];
    it('handles empty queue definitions', function () {
        expect(func([])).toEqual([]);
    });
    it('does not merge queue definitions with different names', function () {
        var defs = [
            (0, testHelpers_1.queueDef)({ name: 'queue1', handlerFunctions: ['f1'] }),
            (0, testHelpers_1.queueDef)({ name: 'queue2', handlerFunctions: ['f2'] }),
            (0, testHelpers_1.queueDef)({ name: 'queue3', handlerFunctions: ['f3'] }),
        ];
        var merged = func(defs);
        expect(merged.length).toBe(3);
        expect(merged[0]).toEqual(defs[0]);
        expect(merged[1]).toEqual(defs[1]);
        expect(merged[2]).toEqual(defs[2]);
        expect(func([])).toEqual([]);
    });
    it('merges queue definitions with the same names', function () {
        var defs = [
            (0, testHelpers_1.queueDef)({ name: 'queue1', handlerFunctions: ['f1'], aliases: ['ff1', 'ff1a'] }),
            (0, testHelpers_1.queueDef)({ name: 'queue1', handlerFunctions: ['f1'], aliases: ['ff1a', 'ff1b'] }),
            (0, testHelpers_1.queueDef)({ name: 'queue1', handlerFunctions: ['f2'] }),
            (0, testHelpers_1.queueDef)({ name: 'queue3', handlerFunctions: ['f3'] }),
        ];
        var merged = func(defs);
        expect(merged.length).toBe(2);
        expect(merged[0].name).toEqual('queue1');
        expect(merged[0].handlerFunctions.length).toBe(2);
        expect(merged[0].handlerFunctions).toContain('f1');
        expect(merged[0].handlerFunctions).toContain('f2');
        expect(merged[0].aliases.length).toBe(3);
        expect(merged[0].aliases).toContain('ff1');
        expect(merged[0].aliases).toContain('ff1a');
        expect(merged[0].aliases).toContain('ff1b');
        expect(merged[1].name).toEqual('queue3');
        expect(merged[1].handlerFunctions.length).toBe(1);
        expect(merged[1].handlerFunctions).toContain('f3');
        expect(merged[1].aliases.length).toBe(0);
    });
});
