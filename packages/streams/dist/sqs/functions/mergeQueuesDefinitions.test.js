"use strict";
exports.__esModule = true;
var mergeQueueDefinitions_1 = require("./mergeQueueDefinitions");
var queueDef = function (name, handlerFunctions, aliases) {
    if (aliases === void 0) { aliases = []; }
    return ({
        name: name,
        aliases: aliases,
        handlerFunctions: handlerFunctions,
        fifo: name.endsWith('.fifo')
    });
};
describe('mergeQueueDefinitions', function () {
    var func = mergeQueueDefinitions_1["default"];
    it('handles empty queue definitions', function () {
        expect(func([])).toEqual([]);
    });
    it('does not merge queue definitions with different names', function () {
        var defs = [
            queueDef('queue1', ['f1']),
            queueDef('queue2', ['f2']),
            queueDef('queue3', ['f3']),
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
            queueDef('queue1', ['f1'], ['ff1', 'ff1a']),
            queueDef('queue1', ['f1'], ['ff1a', 'ff1b']),
            queueDef('queue1', ['f2']),
            queueDef('queue3', ['f3']),
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
