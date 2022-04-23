import {QueueDef} from "../QueueDef";
import mergeQueueDefinitions from "./mergeQueueDefinitions";

const queueDef = (name: string, handlerFunctions: string[]): QueueDef => ({
    name,
    handlerFunctions,
    fifo: name.endsWith('.fifo'),
})

describe('mergeQueueDefinitions', () => {
    const func = mergeQueueDefinitions

    describe('createQueuesFromResources is false', () => {
        it('handles empty queue definitions', () => {
            expect(func([])).toEqual([])
        })
        it('does not merge queue definitions with different names', () => {
            const defs = [
                queueDef('queue1', ['f1']),
                queueDef('queue2', ['f2']),
                queueDef('queue3', ['f3']),
            ]

            const merged = func(defs)
            expect(merged.length).toBe(3)
            expect(merged[0]).toEqual(defs[0])
            expect(merged[1]).toEqual(defs[1])
            expect(merged[2]).toEqual(defs[2])
            expect(func([])).toEqual([])
        })
        it('merges queue definitions with the same names', () => {
            const defs = [
                queueDef('queue1', ['f1']),
                queueDef('queue1', ['f1']),
                queueDef('queue1', ['f2']),
                queueDef('queue3', ['f3']),
            ]

            const merged = func(defs)
            expect(merged.length).toBe(2)
            expect(merged[0].name).toEqual('queue1')
            expect(merged[0].handlerFunctions.length).toBe(2)
            expect(merged[0].handlerFunctions).toContain('f1')
            expect(merged[0].handlerFunctions).toContain('f2')

            expect(merged[1].name).toEqual('queue3')
            expect(merged[1].handlerFunctions.length).toBe(1)
            expect(merged[1].handlerFunctions).toContain('f3')
        })
    })
})

